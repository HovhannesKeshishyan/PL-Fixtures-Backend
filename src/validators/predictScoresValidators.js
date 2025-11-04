import StatusCodes from "http-status-codes";

const isValidString = str => typeof str === "string" && str.trim().length > 0;

export const predictScoresValidator = (req, res, next) => {
    const {matchUUID, homeTeam, awayTeam, matchDate} = req.body;

    const requiredParams = [matchUUID, homeTeam, awayTeam, matchDate];

    const allIsValid = requiredParams.every(p => isValidString(p)) && !isNaN(Date.parse(matchDate));

    if (allIsValid) {
        return next();
    }

    let errorMessage = "";
    const emptyParams = [];
    ["matchUUID", "homeTeam", "awayTeam", "matchDate"].forEach(param => {
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
    err.status = StatusCodes.BAD_REQUEST;
    next(err);
}