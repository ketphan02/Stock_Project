import axios from "axios";
import { isEmpty, isEqual } from "lodash";

import { getBackendHost } from "./low-dependency/NetworkUtil";
import {
  getParsedCachedSharesList,
  getManyStockInfosUsingPrismaShares,
} from "./RedisUtil";

import {
  updateUserSession,
  updateUserSessionInitialMessage,
} from "./SocketUtil";

const typeLoginUtil = ["facebook", "google"];
const BACKEND_HOST = getBackendHost();

// User Authorization and Login Related:

export const getUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BACKEND_HOST}/user`, { withCredentials: true })
      .then((user) => {
        if (user.data.dateOfBirth) {
          user.data.dateOfBirth = new Date(user.data.dateOfBirth);
        }
        resolve(user);
      })
      .catch((e) => {
        console.log(e);
        reject(e);
      });
  });
};

export const logoutUser = () => {
  return new Promise((resolve, reject) => {
    axios
      .get(`${BACKEND_HOST}/logout`, { withCredentials: true })
      .then(() => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const loginUser = (typeLogin, credentials) => {
  return new Promise((resolve, reject) => {
    if (typeLoginUtil.indexOf(typeLogin) >= 0) {
      window.location = `${BACKEND_HOST}/auth/${typeLogin}`;
      resolve("Successful");
    } else {
      //typeLogin==='local'
      axios(`${BACKEND_HOST}/auth/login`, {
        method: "post",
        data: credentials,
        withCredentials: true,
      })
        .then(() => {
          resolve("Successful");
        })
        .catch((e) => {
          reject(e.response.data.message);
        });
    }
  });
};

export const signupUser = (credentials) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/auth/signup`, {
      method: "post",
      data: credentials,
      withCredentials: true,
    })
      .then((res) => {
        resolve(res.data.message);
      })
      .catch((e) => {
        reject(e.response.data.message);
      });
  });
};

// Forgot password process includes 3 functions below:

/**
 * @param email User email
 * @param credentialNeedVerification -
 * - "password"
 * - "email"
 */
export const sendVerificationCode = (email, credentialNeedVerification) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/verificationSession/sendVerificationCode`, {
      method: "get",
      params: {
        email,
        credentialNeedVerification,
      },
      withCredentials: true,
    })
      .then((res) => {
        resolve(res.data.message);
      })
      .catch((err) => {
        reject(err.response.data);
      });
  });
};

/**
 * @param email User email
 * @param code Verification code input
 * @param credentialNeedVerification -
 * - "password"
 * - "email"
 */
export const checkVerificationCode = (
  email,
  code,
  credentialNeedVerification
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/verificationSession/checkVerificationCode`, {
      method: "get",
      params: {
        email,
        code,
        credentialNeedVerification,
      },
      withCredentials: true,
    })
      .then(() => {
        resolve("Successful");
      })
      .catch((err) => {
        reject(err.response.data);
      });
  });
};

export const changePassword = (password, email) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/changeData`, {
      method: "put",
      data: {
        email,
        dataNeedChange: {
          password,
        },
      },
      withCredentials: true,
    })
      .then(() => {
        resolve("Successfully changed password");
      })
      .catch((err) => {
        console.log(err);
        reject("Your email or credentials may be wrong");
      });
  });
};

// User Data Related:

export const changeUserData = (dataNeedChange, email, mutateUser, socket) => {
  /**
   * dataNeedChange in form:
   *  dataNeedChange: {
   *      password: "...",
   *      email: "...",
   *      [...]
   *  }
   */

  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/changeData`, {
      method: "put",
      data: {
        email,
        dataNeedChange,
      },
      withCredentials: true,
    })
      .then((userDataRes) => {
        if (userDataRes.data.dateOfBirth) {
          userDataRes.data.dateOfBirth = new Date(userDataRes.data.dateOfBirth);
        }
        mutateUser(userDataRes.data);
        socket.emit(
          updateUserSession,
          userDataRes.data,
          updateUserSessionInitialMessage
        );
        resolve("Successfully changed data");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const changeUserEmail = (email, newEmail, mutateUser, socket) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/changeEmail`, {
      method: "put",
      data: {
        email,
        newEmail,
      },
      withCredentials: true,
    })
      .then((userDataRes) => {
        if (userDataRes.data.dateOfBirth) {
          userDataRes.data.dateOfBirth = new Date(userDataRes.data.dateOfBirth);
        }
        mutateUser(userDataRes.data);
        socket.emit(
          updateUserSession,
          userDataRes.data,
          updateUserSessionInitialMessage
        );
        resolve("Successfully changed data");
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getUserData = (dataNeeded, email) => {
  /**
   *  dataNeeded in form of:
   *      dataNeeded: {
   *          cash: true,
   *          region: true,
   *          ...
   *      }
   */

  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/getData`, {
      method: "get",
      params: {
        email,
        dataNeeded,
      },
      withCredentials: true,
    })
      .then((userData) => {
        if (userData.data.dateOfBirth) {
          userData.data.dateOfBirth = new Date(userData.data.dateOfBirth);
        }
        resolve(userData.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getUserTransactionsHistory = (
  email,
  rowsLengthChoices,
  page,
  rowsPerPage,
  filters,
  orderBy,
  orderQuery
) => {
  /**
   * filtering in form:
   *    filtering = {
   *      isFinished: true, -> prisma relation filtering
   *      ...
   *    }
   */

  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/getUserTransactionsHistory`, {
      method: "get",
      params: {
        email,
        rowsLengthChoices, // required, min to max
        page, // required
        rowsPerPage, // required
        filters,
        orderBy, // 'none' or '...'
        orderQuery, // 'none' or 'desc' or 'asc
      },
      withCredentials: true,
    })
      .then((transactionsData) => {
        /**
         * data includes: transactions, length
         */
        const { transactions, length } = transactionsData.data;
        resolve({ transactions, transactionsLength: parseInt(length, 10) });
      })
      .catch((err) => {
        reject(err);
      });
  });
};

export const getUserAccountSummaryChartTimestamps = (
  afterOrEqualThisYear,
  email
) => {
  return new Promise((resolve, reject) => {
    axios(`${BACKEND_HOST}/userData/getUserAccountSummaryChartTimestamps`, {
      method: "get",
      params: {
        email,
        afterOrEqualThisYear,
      },
      withCredentials: true,
    })
      .then((accountSummaryChartTimestamps) => {
        resolve(accountSummaryChartTimestamps.data);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

// User Calculations Related:

// example of stockQuotesJSON in front-end/src/utils/FinancialModelingPrepUtil.js
export const calculateTotalSharesValue = (
  isMarketClosed,
  stockQuotesJSON,
  shares
) => {
  if (isEmpty(stockQuotesJSON) && isEmpty(shares)) {
    return 0;
  }

  let totalValue = 0;

  /**
   * we use prices of stockQuotesJSON to calculate total shares value
   */

  let hashSharesIndices = new Map();
  shares.map((share, index) => {
    return hashSharesIndices.set(share.companyCode, index);
  });

  for (let stockQuote of stockQuotesJSON) {
    const symbolOrCompanyCode = stockQuote.companyCode
      ? stockQuote.companyCode
      : stockQuote.symbol;

    let shareWithSameStockQuoteSymbol =
      shares[hashSharesIndices.get(symbolOrCompanyCode)];

    // add into total value this stock value: stock price * stock quantity
    totalValue += stockQuote.price * shareWithSameStockQuoteSymbol.quantity;
  }

  return totalValue;
};

/**
 * return [stockQuotesJSON, parsedCachedShares]
 */
export const checkStockQuotesForUser = (isMarketClosed, email) => {
  return new Promise((resolve, reject) => {
    getParsedCachedSharesList(email)
      .then((shares) => {
        if (isEmpty(shares)) {
          return [[], []];
        } else {
          if (!isMarketClosed) {
            return Promise.all([
              getManyStockInfosUsingPrismaShares(shares),
              shares,
            ]);
          } else {
            return [shares, shares];
          }
        }
      })
      .then(([stockQuotesJSON, cachedShares]) => {
        console.log(stockQuotesJSON);
        resolve([stockQuotesJSON, cachedShares]);
      })
      .catch((err) => {
        reject(err);
      });
  });
};

/**
 * @description_1 Check stock info (quote, profile) for User -> Take from cached stock bank in back-end
 * @description_2 mutate userSession in Redux and update user data in database if totalPortfolio is new and updated.
 * @param thisComponent reference of component (this) - in this case Layout.js
 * @param socket socket client exported from App.js
 */
export const checkStockQuotesToCalculateSharesValue = (
  thisComponent,
  socket
) => {
  const { isMarketClosed, mutateUser } = thisComponent.props;
  const { email, cash, totalPortfolio } = thisComponent.props.userSession;

  // example of stockQuotesJSON in back-end/utils/FinancialModelingPrepUtil.js
  checkStockQuotesForUser(isMarketClosed, email)
    .then(([stockQuotesJSON, cachedShares]) => {
      const totalSharesValue = calculateTotalSharesValue(
        isMarketClosed,
        stockQuotesJSON,
        cachedShares
      );

      const newTotalPortfolioValue = cash + totalSharesValue;

      /**
       * changeData so that when we reload page or go to other page, the data
       * would be up-to-date.
       */

      const dataNeedChange = {
        totalPortfolio: newTotalPortfolioValue,
      };

      if (
        newTotalPortfolioValue &&
        !isEqual(newTotalPortfolioValue, totalPortfolio)
      ) {
        return changeUserData(dataNeedChange, email, mutateUser, socket);
      } else {
        //console.log("No need to update user data.");
      }
    })
    .catch((err) => {
      console.log(
        err,
        "\n This error can be caused as when market is opened, we have not enabled getManyStockPricesFromFMP in UserUtil.js checkStockQuotesForUser."
      );
    });
};

export default {
  getUser,
  logoutUser,
  loginUser,
  signupUser,

  sendVerificationCode,
  checkVerificationCode,

  changePassword,
  changeUserData,
  changeUserEmail,
  getUserData,
  getUserTransactionsHistory,
  getUserAccountSummaryChartTimestamps,

  calculateTotalSharesValue,
  checkStockQuotesForUser,
  checkStockQuotesToCalculateSharesValue,
};
