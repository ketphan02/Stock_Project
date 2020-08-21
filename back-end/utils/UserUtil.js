const { isEqual } = require("lodash");
const {
  isMarketClosedCheck,
  newDate,
  getFullDateUTCString
} = require("./DayTimeUtil");

const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const { keysAsync, delAsync } = require("../redis/redis-client");

const { redisUpdateOverallRankingList, redisUpdateRegionalRankingList } = require("./RedisUtil");

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
        console.log("Finished finding and creating timestamp");
        resolve("Finished finding and creating timestamp");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

const updateRankingList = () => {
  keysAsync("RANKING_LIST*")
    .then((keysList) => {
      Promise.all(keysList.map(key => delAsync(key)));
    })
    .then(() => console.log("Deleted all RANKING_LIST"))
    .catch((err) => console.log(err));

  prisma.user
    .findMany({
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
      orderBy: {
        totalPortfolio: "desc"
      }
    })
    .then((usersArray) => {
      console.log(`Updating ${usersArray.length} user(s): ranking`);

      const updateAllUsersOverallRanking = usersArray.map((user, index) => {
        const updateOverallRanking = prisma.user.update({
          where: {
            id: user.id
          },
          data: {
            ranking: index + 1
          }
        });

        return Promise.all([
          updateOverallRanking,
          redisUpdateOverallRankingList(user)
        ]);
      });

      const regionsList = [...new Set(usersArray.map(user => user.region))];
      const updateAllUsersRegionalRanking = regionsList.map(region => {
        const usersInRegion = usersArray.filter(user => user.region === region);
        for (let i = 0; i <= usersInRegion.length; i++) {
          const updateRegionRanking = prisma.user.update({
            where: {
              id: usersInRegion[i].id
            },
            data: {
              regionalRanking: i + 1
            }
          });

          return Promise.all([
            updateRegionRanking,
            redisUpdateRegionalRankingList(region, usersInRegion[i])
          ]);
        }
      });

      return Promise.all([
        updateAllUsersOverallRanking,
        updateAllUsersRegionalRanking
      ]);
    })
    .then(() => {
      console.log("Successfully updated all users ranking");
    })
    .catch((err) => {
      console.log(err);
    });
};

const updateAllUsers = () => {
  // update portfolioLastClosure and ranking for all users

  prisma.user
    .findMany({
      where: {
        hasFinishedSettingUp: true
      },
      select: {
        id: true,
        totalPortfolio: true
      },
      orderBy: {
        totalPortfolio: "desc"
      }
    })
    .then((usersArray) => {
      console.log(
        `Updating ${usersArray.length} user(s): portfolioLastClosure`
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

        return Promise.all([updatePortfolioLastClosure, accountSummaryPromise]);
      });
      return Promise.all(updateAllUsersPromise);
    })
    .then(() => {
      console.log(
        "Successfully updated all users portfolioLastClosure and accountSummaryChartTimestamp"
      );
    })
    .catch((err) => {
      console.log(err);
    });
};

/**
 * objVariables: object passed in from back-end/index
 */
const checkAndUpdateAllUsers = (objVariables) => {
  // console.log(objVariables);

  if (!objVariables.isPrismaMarketHolidaysInitialized) {
    console.log("UserUtil, 68");
    return;
  }

  isMarketClosedCheck()
    .then((checkResult) => {
      // check if market is closed and update the status of objVariables
      if (!isEqual(checkResult, objVariables.isMarketClosed)) {
        console.log(checkResult, "UserUtil, 76");
        objVariables.isMarketClosed = checkResult;
      }

      // if market is closed but flag isAlreadyUpdate is still false
      // -> change it to true AND updatePortfolioLastClosure
      if (
        objVariables.isMarketClosed &&
        !objVariables.isAlreadyUpdateAllUsers
      ) {
        objVariables.isAlreadyUpdateAllUsers = true;
        updateAllUsers();
      }

      // if market is opened but flag isAlreadyUpdate not switch to false yet -> change it to false
      if (
        !objVariables.isMarketClosed &&
        objVariables.isAlreadyUpdateAllUsers
      ) {
        objVariables.isAlreadyUpdateAllUsers = false;
      }
    })
    .catch((err) => {
      console.log(err);
    });
};

module.exports = {
  deleteExpiredVerification,

  createAccountSummaryChartTimestampIfNecessary,

  updateAllUsers,
  checkAndUpdateAllUsers,

  updateRankingList
};
