import {RATE_LIMIT_TIME} from "../constants/constants.js";

const rateLimitConfig = {
    windowMs: RATE_LIMIT_TIME,
    max: 500,
    message: `To many requests, please try after ${RATE_LIMIT_TIME} minutes`,
}

export default rateLimitConfig;