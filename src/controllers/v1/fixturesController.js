import StatusCodes from "http-status-codes";

import * as fixturesService from "../../services/fixturesService.js";

export const getLeagueTeams = async (req, res, next) => {
    const [error, teams] = await fixturesService.getLeagueTeams();
    if (error) return next(error);
    res.json(teams);
};

export const getTeamsFixtures = async (req, res, next) => {
    const [teamsError, teamIds] = await fixturesService.getTeamIds();
    if (teamsError) return next(teamsError);

    const ids = req.body.ids;
    const limit = req.body.limit || 5;

    const invalidIds = ids.filter((id) => !teamIds.includes(id));
    if (invalidIds.length) {
        const error = new Error("Team ids are invalid: " + invalidIds.join(", "));
        error.status = StatusCodes.BAD_REQUEST;
        return next(error);
    }

    try {
        const data = await fixturesService.getTeamsFixtures(ids, limit);
        res.json(data);
    } catch (error) {
        next(error);
    }
};
