const axios = require("axios");

const {
    BASE_URL,
    PREMIER_LEAGUE_CODE,
    FIVE_MINUTES,
    ONE_WEEK,
    COMPETITIONS
} = require("../constants/constants");
const {getTeamsDTO} = require("../helpers/helpers");
const {BAD_REQUEST} = require("http-status-codes");

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['X-Auth-Token'] = process.env.API_KEY;

const cachedData = {
    teams: {
        value: [],
        lastUpdated: null,
        teamIds: []
    },

    fixtures: {
        lastUpdated: null,
    }
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
    const limit = req.body.limit || 5;
    //const competitions = req.body.competitions || [PREMIER_LEAGUE_CODE, CHAMPIONS_LEAGUE_CODE];

    const invalidIds = ids.filter(id => !cachedData.teams.teamIds.includes(id));
    if (invalidIds.length) {
        const error = new Error("Team ids are invalid: " + invalidIds.join(", "));
        error.status = BAD_REQUEST;
        return next(error);
    }

    try {
        if (cachedData.fixtures.lastUpdated && (Date.now() - cachedData.fixtures.lastUpdated < FIVE_MINUTES)) {
            console.log("From Cache");
        } else {
            cachedData.fixtures = {}
            const {data} = await axios.get(`/competitions/${PREMIER_LEAGUE_CODE}/matches?status=SCHEDULED`);
            data.matches.forEach(match => {
                const homeTeamId = match.homeTeam.id;
                const awayTeamId = match.awayTeam.id;
                cachedData.fixtures[homeTeamId] = cachedData.fixtures[homeTeamId] || {teamId: homeTeamId, matches: []};
                cachedData.fixtures[awayTeamId] = cachedData.fixtures[awayTeamId] || {teamId: awayTeamId, matches: []};
                cachedData.fixtures[homeTeamId].matches.push(match);
                cachedData.fixtures[awayTeamId].matches.push(match);
            })
            cachedData.fixtures.lastUpdated = Date.now();
            console.log("From API");
        }

        const data = ids.map((id) => {
            let teamData;
            // Create a shallow copy of teamData
            if(cachedData.fixtures[id]) {
                teamData = { ...cachedData.fixtures[id] }
            }
            // when no fixtures create empty array
            else {
                teamData = {teamId: id, matches: []}
            }

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

const getCompetitions = async (req, res, _next) => {
    res.json(COMPETITIONS);
}

module.exports = {getLeagueTeams, getTeamsFixtures, getCompetitions}