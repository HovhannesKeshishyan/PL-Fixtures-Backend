import axios from "axios";
import StatusCodes from "http-status-codes";

import {
    BASE_URL,
    PREMIER_LEAGUE_CODE
} from "../constants/constants.js";

import {getTeamsDTO, getFixturesDTO} from "../helpers/helpers.js";

import {cache} from "../cache/index.js";

process.loadEnvFile();

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['X-Auth-Token'] = process.env.API_KEY;

const fetchTeams = async () => {
    try {
        const {data} = await axios.get("/competitions/" + PREMIER_LEAGUE_CODE + "/teams");
        const teams = getTeamsDTO(data.teams);

        cache.setTeams(teams);

        return [null, teams];
    } catch (err) {
        return ["Something went wrong", null]
    }
}

export const getLeagueTeams = async (req, res, next) => {
    if (cache.isTeamsCacheValid()) {
        return res.json(cache.getTeams());
    }

    const [error, teams] = await fetchTeams();
    if (error) return next(error)
    res.json(teams);
}

export const getTeamsFixtures = async (req, res, next) => {
    if (!cache.getTeamsIds().length) {
        await fetchTeams();
    }
    const ids = req.body.ids;
    const limit = req.body.limit || 5;

    const teamIds = cache.getTeamsIds();
    const invalidIds = ids.filter(id => !teamIds.includes(id));
    if (invalidIds.length) {
        const error = new Error("Team ids are invalid: " + invalidIds.join(", "));
        error.status = StatusCodes.BAD_REQUEST;
        return next(error);
    }

    try {
        if (cache.isFixturesCacheValid()) {
            console.log("From Cache");
        } else {
            cache.clearFixturesValue();
            const {data} = await axios.get(`/competitions/${PREMIER_LEAGUE_CODE}/matches?status=SCHEDULED`);
            data.matches = getFixturesDTO(data.matches);
            data.matches.forEach(match => {
                const homeTeamId = match.homeTeam.id;
                const awayTeamId = match.awayTeam.id;
                cache.addFixture(homeTeamId, match);
                cache.addFixture(awayTeamId, match);
            })
            cache.setFixturesLastUpdate();
            console.log("From API");
        }

        const data = ids.map((id) => {
            let teamData;
            // Create a shallow copy of teamData
            if (cache.getFixture(id)) {
                teamData = {...cache.getFixture(id)}
            }
            // when no fixtures create empty array
            else {
                teamData = {teamId: id, matches: []}
            }

            // add prediction if exists
            teamData.matches.forEach(match => {
                match.aiPrediction = cache.getPrediction(match.uuid) || null;
            })

            if (limit && limit !== "all") {
                teamData.matches = [...teamData.matches].slice(0, limit);
            }
            return teamData;
        })

        res.json(data);
    } catch (error) {
        next(error);
    }
}