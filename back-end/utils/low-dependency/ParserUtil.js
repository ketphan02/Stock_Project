const { isEqual } = require("lodash");

/**
 * @param redisString From 'cachedMarketHoliday' -> 'id|year|newYearsDay|martinLutherKingJrDay|washingtonBirthday|goodFriday|memorialDay|independenceDay|laborDay|thanksgivingDay|christmas'
 */
const parseCachedMarketHoliday = (redisString) => {
  const valuesArray = redisString.split("|");
  return {
    id: valuesArray[0],
    year: parseInt(valuesArray[1], 10),
    newYearsDay: valuesArray[2],
    martinLutherKingJrDay: valuesArray[3],
    washingtonBirthday: valuesArray[4],
    goodFriday: valuesArray[5],
    memorialDay: valuesArray[6],
    independenceDay: valuesArray[7],
    laborDay: valuesArray[8],
    thanksgivingDay: valuesArray[9],
    christmas: valuesArray[10]
  };
};

/**
 * @param marketHoliday Market Holiday object obtained from Database
 * @returns Redis market holiday value used for cache
 */
const createRedisValueFromMarketHoliday = (marketHoliday) => {
  const {
    id,
    year,
    newYearsDay,
    martinLutherKingJrDay,
    washingtonBirthday,
    goodFriday,
    memorialDay,
    independenceDay,
    laborDay,
    thanksgivingDay,
    christmas
  } = marketHoliday;

  return `${id}|${year}|${newYearsDay}|${martinLutherKingJrDay}|${washingtonBirthday}|${goodFriday}|${memorialDay}|${independenceDay}|${laborDay}|${thanksgivingDay}|${christmas}`;
};

/**
 * @param redisString From 'cachedShares|AAPL|quote' -> 'name|price|changesPercentage|change|dayLow|dayHigh|yearHigh|yearLow|marketCap|priceAvg50|priceAvg200|volume|avgVolume|exchange|open|previousClose|eps|pe|earningsAnnouncement|sharesOutstanding|timestamp'
 */
const parseCachedShareQuote = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    symbol: valuesArray[0],
    name: valuesArray[1],
    price: parseFloat(valuesArray[2]),
    changesPercentage: parseFloat(valuesArray[3]),
    change: parseFloat(valuesArray[4]),
    dayLow: parseFloat(valuesArray[5]),
    dayHigh: parseFloat(valuesArray[6]),
    yearHigh: parseFloat(valuesArray[7]),
    yearLow: parseFloat(valuesArray[8]),
    marketCap: parseFloat(valuesArray[9]),
    priceAvg50: parseFloat(valuesArray[10]),
    priceAvg200: parseFloat(valuesArray[11]),
    volume: parseInt(valuesArray[12], 10),
    avgVolume: parseInt(valuesArray[13], 10),
    exchange: valuesArray[14],
    open: parseFloat(valuesArray[15]),
    previousClose: parseFloat(valuesArray[16]),
    eps: parseFloat(valuesArray[17]),
    pe: parseFloat(valuesArray[18]),
    earningsAnnouncement: valuesArray[19],
    sharesOutstanding: parseInt(valuesArray[20], 10),
    timestamp: parseInt(valuesArray[21], 10)
  };
};

/**
 * @param stockQuoteJSON Stock quote similar to Financial Modeling Prep '/quote' API
 * @returns Redis stock quote value used for cache
 */
const createRedisValueFromStockQuoteJSON = (stockQuoteJSON) => {
  const {
    symbol,
    name,
    price,
    changesPercentage,
    change,
    dayLow,
    dayHigh,
    yearHigh,
    yearLow,
    marketCap,
    priceAvg50,
    priceAvg200,
    volume,
    avgVolume,
    exchange,
    open,
    previousClose,
    eps,
    pe,
    earningsAnnouncement,
    sharesOutstanding,
    timestamp
  } = stockQuoteJSON;

  return `${symbol}|${name}|${price}|${changesPercentage}|${change}|${dayLow}|${dayHigh}|${yearHigh}|${yearLow}|${marketCap}|${priceAvg50}|${priceAvg200}|${volume}|${avgVolume}|${exchange}|${open}|${previousClose}|${eps}|${pe}|${earningsAnnouncement}|${sharesOutstanding}|${timestamp}`;
};

/**
 * @param redisString From 'cachedShares|AAPL|profile': 'price|beta|volAvg|mktCap|lastDiv|range|changes|companyName|exchange|exchangeShortName|industry|website|description|ceo|sector|country|fullTimeEmployees|phone|address|city|state|zip|dcfDiff|dcf|image|ipoDate'
 */
const parseCachedShareProfile = (redisString) => {
  const valuesArray = redisString.split("|");

  return {
    symbol: valuesArray[0],
    price: parseFloat(valuesArray[1]),
    beta: parseFloat(valuesArray[2]),
    volAvg: parseInt(valuesArray[3], 10),
    mktCap: parseInt(valuesArray[4], 10),
    lastDiv: parseFloat(valuesArray[5]),
    range: valuesArray[6],
    changes: parseFloat(valuesArray[7]),
    companyName: valuesArray[8],
    exchange: valuesArray[9],
    exchangeShortName: valuesArray[10],
    industry: valuesArray[11],
    website: valuesArray[12],
    description: valuesArray[13],
    ceo: valuesArray[14],
    sector: valuesArray[15],
    country: valuesArray[16],
    fullTimeEmployees: parseInt(valuesArray[17], 10),
    phone: valuesArray[18],
    address: valuesArray[19],
    city: valuesArray[20],
    state: valuesArray[21],
    zip: parseInt(valuesArray[22], 10),
    dcfDiff: parseFloat(valuesArray[23]),
    dcf: parseFloat(valuesArray[24]),
    image: valuesArray[25],
    ipoDate: new Date(valuesArray[26])
  };
};

/**
 * @param stockProfileJSON Stock profile similar to Financial Modeling Prep '/profile' API
 * @returns Redis stock profile value used for cache
 */
const createRedisValueFromStockProfileJSON = (stockProfileJSON) => {
  const {
    symbol,
    price,
    beta,
    volAvg,
    mktCap,
    lastDiv,
    range,
    changes,
    companyName,
    exchange,
    exchangeShortName,
    industry,
    website,
    description,
    ceo,
    sector,
    country,
    fullTimeEmployees,
    phone,
    address,
    city,
    state,
    zip,
    dcfDiff,
    dcf,
    image,
    ipoDate
  } = stockProfileJSON;

  return `${symbol}|${price}|${beta}|${volAvg}|${mktCap}|${lastDiv}|${range}|${changes}|${companyName}|${exchange}|${exchangeShortName}|${industry}|${website}|${description}|${ceo}|${sector}|${country}|${fullTimeEmployees}|${phone}|${address}|${city}|${state}|${zip}|${dcfDiff}|${dcf}|${image}|${ipoDate}`;
};

/**
 * @param filters
 * {
 *    type: buy, sell, OR none
 *    code: none OR random string with NO String ";" -> this is special character used when these attributes in a string
 *    quantity: (int/none)_to_(int/none)
 *    price: (int/none)_to_(int/none)
 *    brokerage: (int/none)_to_(int/none)
 *    spendOrGain: (int/none)_to_(int/none)
 *    transactionTime: (DateTime/none)_to_(DateTime/none)
 * }
 */
const createPrismaFiltersObject = (filters) => {
  const { type, code, price, transactionTime } = filters;
  const filtering = {
    isFinished: true
    // isTypeBuy
    // companyCode
    // priceAtTransaction
    // finishedTime
    // quantity
    // brokerage
    // spendOrGain
  };

  // type
  if (!isEqual(type, "none")) {
    filtering.isTypeBuy = isEqual(type, "buy");
  }

  // code
  if (!isEqual(code, "none")) {
    filtering.companyCode = { contains: code };
  }

  // price
  const priceValues = price.split("_to_");
  if (!isEqual(priceValues[0], "none")) {
    filtering.priceAtTransaction.gte = parseInt(priceValues[0], 10);
  }
  if (!isEqual(priceValues[1], "none")) {
    filtering.priceAtTransaction.lte = parseInt(priceValues[1], 10);
  }

  // transactionTime
  const timeValues = transactionTime.split("_to_");
  filtering.finishedTime = {};
  if (!isEqual(timeValues[0], "none")) {
    filtering.finishedTime.gte = new Date(timeValues[0]);
  }
  if (!isEqual(timeValues[1], "none")) {
    filtering.finishedTime.lte = new Date(timeValues[1]);
  }

  // quantity, brokerage, spendOrGain
  const forLoopItems = ["quantity", "brokerage", "spendOrGain"];
  for (let i = 0; i < 3; i++) {
    const item = forLoopItems[i];
    const values = filters[item].split("_to_");

    filtering[item] = {};

    if (!isEqual(values[0], "none")) {
      filtering[item].gte = parseInt(values[0], 10);
    }
    if (!isEqual(values[1], "none")) {
      filtering[item].lte = parseInt(values[1], 10);
    }
  }

  return filtering;
};

/**
 * @param filters
 * {
 *    type: buy, sell, OR none
 *    code: none OR random string with NO String ";" -> this is special character used when these attributes in a string
 *    quantity: (int/none)_to_(int/none)
 *    price: (int/none)_to_(int/none)
 *    brokerage: (int/none)_to_(int/none)
 *    spendOrGain: (int/none)_to_(int/none)
 *    transactionTime: (DateTime/none)_to_(DateTime/none)
 * }
 * @returns Transactions History filters redis string
 */
const createRedisValueFromTransactionsHistoryFilters = (filters) => {
  const {
    type,
    code,
    quantity,
    price,
    brokerage,
    spendOrGain,
    transactionTime
  } = filters;
  return `${type};${code};${quantity};${price};${brokerage};${spendOrGain};${transactionTime}`;
};

/**
 * @param redisValue `type;code;quantity;price;brokerage;spendOrGain;transactionTime`
 * @returns Transactions History filter object
 */
const parseRedisTransactionsHistoryFilters = (redisValue) => {
  const values = redisValue.split(";");
  return {
    type: values[0],
    code: values[1],
    quantity: values[2].split("_to_"),
    price: values[3].split("_to_"),
    brokerage: values[4].split("_to_"),
    spendOrGain: values[5].split("_to_"),
    transactionTime: values[6].split("_to_")
  };
};

/**
 * @param stockQuoteJSON Stock quote similar to Financial Modeling Prep '/quote' API
 * @param stockProfileJSON Stock profile similar to Financial Modeling Prep '/profile' API
 * @returns Combined Stock Info Object (includes both quote and profile)
 */
const combineFMPStockQuoteAndProfile = (stockQuoteJSON, stockProfileJSON) => {
  return {
    ...stockQuoteJSON,
    ...stockProfileJSON
  };
};

/**
 * @param cachedSharesList Shares list of symbols ['AAPL', 'GOOGL', 'FB', ...]
 * @returns Redis symbols string value used for cache
 */
const createSymbolsStringFromCachedSharesList = (cachedSharesList) => {
  return cachedSharesList.join();
};

/**
 * @param finishedTransaction Prisma Model Transaction with isFinished attribute == TRUE
 * @returns Finished Transaction redis string
 */
const createRedisValueFromFinishedTransaction = (finishedTransaction) => {
  const {
    id,
    createdAt,
    companyCode,
    quantity,
    priceAtTransaction,
    brokerage,
    spendOrGain,
    finishedTime,
    isTypeBuy,
    userID
  } = finishedTransaction;
  return `${id}|${createdAt}|${companyCode}|${quantity}|${priceAtTransaction}|${brokerage}|${spendOrGain}|${finishedTime}|${isTypeBuy}|${userID}`;
};

/**
 * @param redisString `email|accountSummaryChart` -> 'UTCDateString|portfolioValue'
 */
const parseAccountSummaryTimestamp = (redisString) => {
  const valuesArray = redisString.split("|");
  return {
    UTCDateString: valuesArray[0],
    portfolioValue: parseFloat(valuesArray[1])
  };
};

module.exports = {
  parseCachedMarketHoliday,
  createRedisValueFromMarketHoliday,

  parseCachedShareQuote,
  createRedisValueFromStockQuoteJSON,

  parseCachedShareProfile,
  createRedisValueFromStockProfileJSON,

  combineFMPStockQuoteAndProfile,
  createSymbolsStringFromCachedSharesList,

  createRedisValueFromFinishedTransaction,

  createPrismaFiltersObject,
  createRedisValueFromTransactionsHistoryFilters,
  parseRedisTransactionsHistoryFilters,

  parseAccountSummaryTimestamp
};
