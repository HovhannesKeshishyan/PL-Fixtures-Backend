const {BAD_REQUEST} = require("http-status-codes");

const isValidString = str => typeof str === "string" && str.trim().length > 0;

const predictScoresValidator = (req, res, next) => {
    const {matchID, homeTeam, awayTeam, matchDate} = req.body;

    const requiredParams = [matchID, homeTeam, awayTeam, matchDate];

    const allIsValid = requiredParams.every(p => isValidString(p)) && !isNaN(Date.parse(matchDate));

    if (allIsValid) {
        return next();
    }

    let errorMessage = "";
    const emptyParams = [];
    ["matchID", "homeTeam", "awayTeam", "matchDate"].forEach(param => {
        if (!isValidString(req.body[param])) {
            emptyParams.push(param);
        }
    })

    if (emptyParams.length) {
        errorMessage += `Fields are required: ${emptyParams.join(", ")}. `;
    }

    if (isNaN(Date.parse(matchDate))) {
        errorMessage += "matchDate must be valid date";
    }

    const err = new Error(errorMessage);
    err.status = BAD_REQUEST;
    next(err);
}

module.exports = {predictScoresValidator}