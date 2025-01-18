const {BAD_REQUEST} = require("http-status-codes");
const {PREMIER_LEAGUE_CODE, CHAMPIONS_LEAGUE_CODE} = require("../constants/constants");

const AVAILABLE_COMPETITIONS = [PREMIER_LEAGUE_CODE, CHAMPIONS_LEAGUE_CODE];

const teamsFixturesValidator = (req, res, next) => {
    const {ids, limit, competitions} = req.body;
    // team ids
    let errorMessage = "";
    if (!ids || !ids.length) errorMessage = "ids is required";
    else if (!Array.isArray(ids)) errorMessage = "id must be an array";
    else if (ids.some(id => typeof id !== "number")) errorMessage = "id must be a number";
    // fixtures count
    if (limit && !parseInt(limit)) errorMessage = "Limit must be a number";
    // competitions
    if (competitions) {
        if (!Array.isArray(competitions)) errorMessage = "Competitions must be an array";
        else if (!competitions.length) errorMessage = "Competitions can't be empty";
        else if (competitions.some(code => !AVAILABLE_COMPETITIONS.includes(code))) {
            errorMessage = `Available competition codes are ${AVAILABLE_COMPETITIONS}`;
        }
    }

    if (!errorMessage) next();
    else {
        const err = new Error(errorMessage);
        err.status = BAD_REQUEST;
        next(err);
    }
}

module.exports = {teamsFixturesValidator}