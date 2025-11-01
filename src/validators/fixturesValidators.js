const {BAD_REQUEST} = require("http-status-codes");

const teamsFixturesValidator = (req, res, next) => {
    const {ids, limit} = req.body;
    // team ids
    let errorMessage = "";
    if (!ids || !ids.length) errorMessage = "ids is required";
    else if (!Array.isArray(ids)) errorMessage = "id must be an array";
    else if (ids.some(id => typeof id !== "number")) errorMessage = "id must be a number";
    // fixtures-list count
    if (limit && !parseInt(limit) && limit !== "all") errorMessage = "Limit must be a number";

    if (!errorMessage) next();
    else {
        const err = new Error(errorMessage);
        err.status = BAD_REQUEST;
        next(err);
    }
}

module.exports = {teamsFixturesValidator}