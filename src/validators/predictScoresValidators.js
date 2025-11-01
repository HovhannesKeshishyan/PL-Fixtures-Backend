const {BAD_REQUEST} = require("http-status-codes");

const predictScoresValidator = (req, res, next) => {
    const {matchID, homeTeam, awayTeam} = req.body;

    if (matchID && homeTeam && awayTeam) {
        next();
    } else {
        const err = new Error("Match ID, Home team and Away team are required!");
        err.status = BAD_REQUEST;
        next(err);
    }
}

module.exports = {predictScoresValidator}