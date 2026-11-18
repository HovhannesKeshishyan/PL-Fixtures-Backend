import {ONE_MINUTE, RATE_LIMIT_TIME} from "../constants/constants.js";

const rateLimitConfig = {
    windowMs: RATE_LIMIT_TIME,
    max: 500,
    message: `Too many requests, please try again after ${RATE_LIMIT_TIME / ONE_MINUTE} minutes`,
};

export default rateLimitConfig;
