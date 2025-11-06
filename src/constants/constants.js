export const BASE_URL = "https://api.football-data.org/v4";

// TIMES
const ONE_MINUTE = 60 * 1000;
export const FIVE_MINUTES = 5 * ONE_MINUTE;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
export const ONE_WEEK = 7 * ONE_DAY;

// LEAGUE CODE
export const PREMIER_LEAGUE_CODE = "PL";

// RATE LIMIT
export const RATE_LIMIT_TIME = 15 * ONE_MINUTE;

// REDIS
export const REDIS_CACHE_NAME_PROD = "CACHE";
export const REDIS_CACHE_NAME_DEV = "CACHE-DEV";