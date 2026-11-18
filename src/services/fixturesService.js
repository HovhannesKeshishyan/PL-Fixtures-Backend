import axios from "axios";
import "dotenv/config";
import StatusCodes from "http-status-codes";

import {
    BASE_URL,
    PREMIER_LEAGUE_CODE
} from "../constants/constants.js";

import {getTeamsDTO, getFixturesDTO} from "../helpers/helpers.js";

import {cache} from "../cache/index.js";

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['X-Auth-Token'] = process.env.API_KEY;

/**
 * @returns {Promise<[Error|null, {id: number, name: string, shortName: string, crest: string}[]|null]>}
 */
const fetchTeams = async () => {
    try {
        const {data} = await axios.get("/competitions/" + PREMIER_LEAGUE_CODE + "/teams");
        const teams = getTeamsDTO(data.teams);

        cache.setTeams(teams);

        return [null, teams];
    } catch (err) {
        const error = new Error("Failed to load teams, please try again later", {cause: err});
        error.status = StatusCodes.BAD_GATEWAY;
        return [error, null];
    }
}

/**
 * Returns teams from cache, or fetches them if the cache has expired.
 * @returns {Promise<[Error|null, {id: number, name: string, shortName: string, crest: string}[]|null]>}
 */
export const getLeagueTeams = async () => {
    if (cache.isTeamsCacheValid()) {
        return [null, cache.getTeams()];
    }
    return fetchTeams();
}

/**
 * Returns cached team ids, fetching teams first if the cache is empty.
 * @returns {Promise<[Error|null, number[]|null]>}
 */
export const getTeamIds = async () => {
    if (!cache.getTeamsIds().length) {
        const [error] = await fetchTeams();
        if (error) return [error, null];
    }
    return [null, cache.getTeamsIds()];
}

const refreshFixturesIfExpired = async () => {
    if (cache.isFixturesCacheValid()) {
        console.log("From Cache");
        return;
    }

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

/**
 * Returns fixtures of the given teams with AI predictions, if they exist.
 * @param {number[]} ids - Team ids.
 * @param {number|string} limit - Max number of matches per team, or "all".
 */
export const getTeamsFixtures = async (ids, limit) => {
    await refreshFixturesIfExpired();

    return ids.map((id) => {
        // when no fixtures use empty array
        let matches = cache.getFixture(id)?.matches || [];

        if (limit && limit !== "all") {
            matches = matches.slice(0, limit);
        }

        // build new match objects, so cached matches are not mutated
        return {
            teamId: id,
            matches: matches.map(match => ({
                ...match,
                aiPrediction: cache.getPrediction(match.uuid) || null,
            })),
        };
    })
}
