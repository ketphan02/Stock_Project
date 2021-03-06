const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { keysAsync, delAsync } = require("../../redis/redis-client");
const { isEqual, isEmpty } = require("lodash");

const {
  redisUpdateOverallRankingList,
  redisUpdateRegionalRankingList
} = require("../redis-utils/RedisUtil");

const {
  resetUserCachedAccountSummaryTimestamps
} = require("../redis-utils/UserCachedDataUtil");

const {
  newDate,
  getFullDateUTCString,
  getYearUTCString
} = require("../low-dependency/DayTimeUtil");

const { createPrismaFiltersObject } = require("../low-dependency/ParserUtil");

const deleteExpiredVerification = () => {
  let date = new Date();
  date = date.getMonth() + 1 + "/" + date.getDate() + "/" + date.getFullYear();
  prisma.userVerification
    .deleteMany({
      where: {
        expiredAt: date
      }
    })
    .then((res) => {
      console.log("Deleted", res, "email verifications");
    })
    .catch((err) => {
      console.log(err);
    });
};

const createAccountSummaryChartTimestampIfNecessary = (user) => {
  return new Promise((resolve, reject) => {
    prisma.accountSummaryTimestamp
      .findOne({
        where: {
          UTCDateKey_userID: {
            UTCDateKey: getFullDateUTCString(newDate()),
            userID: user.id
          }
        }
      })
      .then((timestamp) => {
        if (!timestamp) {
          return prisma.accountSummaryTimestamp.create({
            data: {
              UTCDateString: newDate(),
              UTCDateKey: getFullDateUTCString(newDate()),
              year: getYearUTCString(newDate()),
              portfolioValue: user.totalPortfolio,
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          });
        }
      })
      .then(() => {
        console.log("Finished finding and creating account summary timestamp");
        resolve("Finished finding and creating account summary timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const createRankingTimestampIfNecessary = (user) => {
  return new Promise((resolve, reject) => {
    prisma.rankingTimestamp
      .findOne({
        where: {
          UTCDateKey_userID: {
            UTCDateKey: getFullDateUTCString(newDate()),
            userID: user.id
          }
        }
      })
      .then((timestamp) => {
        if (!timestamp) {
          prisma.rankingTimestamp.create({
            data: {
              UTCDateString: newDate(),
              UTCDateKey: getFullDateUTCString(newDate()),
              year: getYearUTCString(newDate()),
              ranking: user.ranking,
              regionalRanking: user.regionalRanking,
              user: {
                connect: {
                  id: user.id
                }
              }
            }
          });
        }
      })
      .then(() => {
        console.log("Finished finding and creating ranking timestamp");
        resolve("Finished finding and creating ranking timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description_1 Update ranking and regional of each user in server.
 * @description_2 Update both data in database and in cache.
 * @description_3 Switch globalBackendVariables updatedRankingList flag whenever finished.
 * @param globalBackendVariables Is in back-end/index.js
 */
const updateRankingList = (globalBackendVariables) => {
  keysAsync("RANKING_LIST*")
    .then((keysList) => {
      if (!isEmpty(keysList)) {
        return delAsync(keysList);
      }
    })
    .then(() => {
      console.log(`Deleted all redis ranking relating lists\n`);

      return prisma.user.findMany({
        where: {
          hasFinishedSettingUp: true
        },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          totalPortfolio: true,
          region: true
        },
        orderBy: [
          {
            totalPortfolio: "desc"
          }
        ]
      });
    })
    .then((usersArray) => {
      console.log(`Updating ${usersArray.length} user(s): ranking`);

      const regionsList = new Map(); // `region : recent rank`
      const updateAllUsersRanking = usersArray.map((user, index) => {
        const nowRegion = user.region;

        if (regionsList.has(nowRegion)) {
          regionsList.set(nowRegion, regionsList.get(nowRegion) + 1);
        } else {
          regionsList.set(nowRegion, 1);
        }

        const updateUserRanking = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            ranking: index + 1,
            regionalRanking: regionsList.get(nowRegion)
          }
        });

        return Promise.all([
          updateUserRanking,
          redisUpdateOverallRankingList(user),
          redisUpdateRegionalRankingList(nowRegion, user)
        ]);
      });

      return Promise.all(updateAllUsersRanking);
    })
    .then(() => {
      globalBackendVariables.updatedRankingListFlag = !globalBackendVariables.updatedRankingListFlag;
      console.log("Successfully updated all users ranking\n");
    })
    .catch((err) => {
      console.log(err);
    });
};

//
/**
 * @description_1 Update portfolioLastClosure and ranking for all users in server
 * @description_2 Update data in database only.
 * @description_3
 * - Clean cache for account summary chart timestamps of each user
 * - On front-end, Layout.js will check updated...Flag and update front-end account summary timestamps of user
 * @description_3 Switch globalBackendVariables updatedAllUsers flag whenever finished.
 * @param globalBackendVariables Is in back-end/index.js
 */
const updateAllUsers = (globalBackendVariables) => {
  prisma.user
    .findMany({
      where: {
        hasFinishedSettingUp: true
      },
      select: {
        id: true,
        email: true,
        totalPortfolio: true
      },
      orderBy: [
        {
          totalPortfolio: "desc"
        }
      ]
    })
    .then((usersArray) => {
      console.log(
        `Updating ${usersArray.length} user(s): portfolioLastClosure and accountSummaryTimestamp`
      );

      const updateAllUsersPromise = usersArray.map((user, index) => {
        const updatePortfolioLastClosure = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            totalPortfolioLastClosure: user.totalPortfolio
          }
        });

        const accountSummaryPromise = createAccountSummaryChartTimestampIfNecessary(
          user
        );

        const accountRankingPromise = createRankingTimestampIfNecessary(user);

        return Promise.all([
          updatePortfolioLastClosure,
          accountSummaryPromise,
          accountRankingPromise,
          resetUserCachedAccountSummaryTimestamps(user.email)
        ]);
      });
      return Promise.all(updateAllUsersPromise);
    })
    .then(() => {
      globalBackendVariables.updatedAllUsersFlag = !globalBackendVariables.updatedAllUsersFlag;
      console.log(
        "Successfully updated all users portfolioLastClosure and accountSummaryChartTimestamp\n"
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * @description Switch flag hasUpdatedAllUsersToday according to isMarketClosed
 * @param globalBackendVariables object passed in from back-end/index
 */
const checkAndUpdateAllUsers = (globalBackendVariables) => {
  if (!globalBackendVariables.isPrismaMarketHolidaysInitialized) {
    return;
  }

  // if market is closed but flag hasUpdatedAllUsersToday is still false
  // -> change it to true AND updatePortfolioLastClosure
  if (
    globalBackendVariables.isMarketClosed &&
    !globalBackendVariables.hasUpdatedAllUsersToday
  ) {
    globalBackendVariables.hasUpdatedAllUsersToday = true;
    updateAllUsers(globalBackendVariables);
  }

  // if market is opened but flag hasUpdatedAllUsersToday not switch to false yet -> change it to false
  if (
    !globalBackendVariables.isMarketClosed &&
    globalBackendVariables.hasUpdatedAllUsersToday
  ) {
    globalBackendVariables.hasUpdatedAllUsersToday = false;
  }
};

const getChunkUserTransactionsHistoryForRedisM5RU = (
  email,
  chunkSize, // required
  numberOfChunksSkipped, // required
  filters,
  orderBy, // 'none' or '...'
  orderQuery // 'none' or 'desc' or 'asc'
) => {
  // Each transactions history page has 10 items, but we cache beforehand 100 items
  return new Promise((resolve, reject) => {
    const filtering = createPrismaFiltersObject(filters);

    // Order
    const orderObject = {};
    if (!isEqual(orderBy, "none")) {
      orderObject[`${orderBy}`] = orderQuery;
    }

    const orderByPrisma = [];
    if (!isEmpty(orderObject)) {
      orderByPrisma.push(orderObject);
    }

    prisma.user
      .findOne({
        where: {
          email
        }
      })
      .transactions({
        where: filtering,
        orderBy: orderByPrisma,
        skip: chunkSize * numberOfChunksSkipped,
        take: chunkSize
      })
      .then((data) => {
        resolve(data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};
const getLengthUserTransactionsHistoryForRedisM5RU = (email, filters) => {
  return new Promise((resolve, reject) => {
    const filtering = createPrismaFiltersObject(filters);

    prisma.user
      .findOne({
        where: {
          email
        }
      })
      .transactions({
        where: filtering
      })
      .then((data) => {
        resolve(data.length);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

module.exports = {
  deleteExpiredVerification,

  createAccountSummaryChartTimestampIfNecessary,

  updateAllUsers,
  checkAndUpdateAllUsers,

  updateRankingList,

  getChunkUserTransactionsHistoryForRedisM5RU,
  getLengthUserTransactionsHistoryForRedisM5RU
};
