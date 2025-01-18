const axios = require("axios");

const {
    BASE_URL,
    PREMIER_LEAGUE_CODE,
    FIVE_MINUTES,
    ONE_WEEK,
    COMPETITIONS,
    CHAMPIONS_LEAGUE_CODE
} = require("../constants/constants");
const {getTeamsDTO, getFixturesDTO} = require("../helpers/helpers");
const {BAD_REQUEST} = require("http-status-codes");

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['X-Auth-Token'] = process.env.API_KEY;

const cachedData = {
    teams: {
        value: [],
        lastUpdated: null,
        teamIds: []
    },

    fixtures: {}
}

const fetchLeagueTeams = async (leagueCode = PREMIER_LEAGUE_CODE) => {
    try {
        const {data} = await axios.get("/competitions/" + leagueCode + "/teams");
        const teams = getTeamsDTO(data.teams);

        cachedData.teams.value = teams;
        cachedData.teams.lastUpdated = Date.now();
        cachedData.teams.teamIds = teams.map(team => team.id);

        return [null, teams];
    } catch (err) {
        return ["Something went wrong", null]
    }
}

const getLeagueTeams = async (req, res, next) => {
    const leagueCode = req.query.leagueCode;

    const now = Date.now();
    const isCacheValid = cachedData.teams.value.length > 0 &&
        (cachedData.teams.lastUpdated && (now - cachedData.teams.lastUpdated < ONE_WEEK));

    if (isCacheValid) {
        return res.json(cachedData.teams.value);
    }

    const [error, teams] = await fetchLeagueTeams(leagueCode);
    if (error) return next(error)
    res.json(teams);
}

const getTeamsFixtures = async (req, res, next) => {
    if (!cachedData.teams.teamIds.length) {
        await fetchLeagueTeams();
    }
    const ids = req.body.ids;
    const limit = req.query.limit || 5;
    const competitions = req.body.competitions || [PREMIER_LEAGUE_CODE, CHAMPIONS_LEAGUE_CODE];

    const invalidIds = ids.filter(id => !cachedData.teams.teamIds.includes(id));
    if (invalidIds.length) {
        const error = new Error("Team ids are invalid: " + invalidIds.join(", "));
        error.status = BAD_REQUEST;
        return next(error);
    }

    try {
        let response = await Promise.all(ids.map(async (id) => {
            const cacheKey = `${id}-${competitions.toString()}`;
            const isCacheValid = cachedData.fixtures[cacheKey] && (Date.now() - cachedData.fixtures[cacheKey].lastUpdated) < FIVE_MINUTES;
            if (isCacheValid) {
                console.log("form cache: " + id);
                return cachedData.fixtures[cacheKey];
            }

            const {data} = await axios.get(`/teams/${id}/matches?status=SCHEDULED&competitions=${competitions}`);
            console.log("Form API: " + id);
            const matches = getFixturesDTO(data);
            cachedData.fixtures[cacheKey] = {
                teamId: id,
                matches: matches,
                lastUpdated: Date.now(),
            }
            return cachedData.fixtures[cacheKey];
        }));
        response.forEach(item => item.matches = item.matches.slice(0, limit));
        res.json(response);
    } catch (err) {
        next(err);
    }
}

const getCompetitions = async (req, res, _next) => {
    res.json(COMPETITIONS);
}

module.exports = {getLeagueTeams, getTeamsFixtures, getCompetitions}