const BASE_URL = "https://api.football-data.org/v4";

// TIMES
const ONE_MINUTE = 60 * 1000;
const FIVE_MINUTES = 5 * ONE_MINUTE;
const ONE_HOUR = 60 * ONE_MINUTE;
const ONE_DAY = 24 * ONE_HOUR;
const ONE_WEEK = 7 * ONE_DAY;

// LEAGUE CODE
const PREMIER_LEAGUE_CODE = "PL";

// RATE LIMIT
const RATE_LIMIT_TIME = 15 * ONE_MINUTE;

module.exports = {
    BASE_URL, FIVE_MINUTES, ONE_WEEK, PREMIER_LEAGUE_CODE
}