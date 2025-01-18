const {RATE_LIMIT_TIME} = require("../constants/constants");
const rateLimitConfig = {
    windowMs: RATE_LIMIT_TIME,
    max: 500,
    message: `To many requests, please try after ${RATE_LIMIT_TIME} minutes`,
}

module.exports = rateLimitConfig;