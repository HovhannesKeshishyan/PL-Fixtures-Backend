const axios = require("axios");
const {BAD_REQUEST} = require("http-status-codes");

const {
    BASE_URL,
    PREMIER_LEAGUE_CODE,
    FIVE_MINUTES,
    ONE_WEEK
} = require("../constants/constants");

const {getTeamsDTO, getFixturesDTO} = require("../helpers/helpers");

const {CACHED_DATA} = require("../cache/index");

axios.defaults.baseURL = BASE_URL;
axios.defaults.headers.common['X-Auth-Token'] = process.env.API_KEY;

const fetchTeams = async () => {
    try {
        const {data} = await axios.get("/competitions/" + PREMIER_LEAGUE_CODE + "/teams");
        const teams = getTeamsDTO(data.teams);

        CACHED_DATA.teams.value = teams;
        CACHED_DATA.teams.lastUpdated = Date.now();
        CACHED_DATA.teams.teamIds = teams.map(team => team.id);

        return [null, teams];
    } catch (err) {
        return ["Something went wrong", null]
    }
}

const getLeagueTeams = async (req, res, next) => {
    const now = Date.now();
    const isCacheValid = CACHED_DATA.teams.value.length > 0 &&
        (CACHED_DATA.teams.lastUpdated && (now - CACHED_DATA.teams.lastUpdated < ONE_WEEK));

    if (isCacheValid) {
        return res.json(CACHED_DATA.teams.value);
    }

    const [error, teams] = await fetchTeams();
    if (error) return next(error)
    res.json(teams);
}

const getTeamsFixtures = async (req, res, next) => {
    if (!CACHED_DATA.teams.teamIds.length) {
        await fetchTeams();
    }
    const ids = req.body.ids;
    const limit = req.body.limit || 5;

    const invalidIds = ids.filter(id => !CACHED_DATA.teams.teamIds.includes(id));
    if (invalidIds.length) {
        const error = new Error("Team ids are invalid: " + invalidIds.join(", "));
        error.status = BAD_REQUEST;
        return next(error);
    }

    try {
        if (CACHED_DATA.fixtures.lastUpdated && (Date.now() - CACHED_DATA.fixtures.lastUpdated < FIVE_MINUTES)) {
            console.log("From Cache");
        } else {
            CACHED_DATA.fixtures = {}
            const {data} = await axios.get(`/competitions/${PREMIER_LEAGUE_CODE}/matches?status=SCHEDULED`);
            data.matches = getFixturesDTO(data.matches);
            data.matches.forEach(match => {
                const homeTeamId = match.homeTeam.id;
                const awayTeamId = match.awayTeam.id;
                CACHED_DATA.fixtures[homeTeamId] = CACHED_DATA.fixtures[homeTeamId] || {teamId: homeTeamId, matches: []};
                CACHED_DATA.fixtures[awayTeamId] = CACHED_DATA.fixtures[awayTeamId] || {teamId: awayTeamId, matches: []};
                CACHED_DATA.fixtures[homeTeamId].matches.push(match);
                CACHED_DATA.fixtures[awayTeamId].matches.push(match);
            })
            CACHED_DATA.fixtures.lastUpdated = Date.now();
            console.log("From API");
        }

        const data = ids.map((id) => {
            let teamData;
            // Create a shallow copy of teamData
            if(CACHED_DATA.fixtures[id]) {
                teamData = { ...CACHED_DATA.fixtures[id] }
            }
            // when no fixtures create empty array
            else {
                teamData = {teamId: id, matches: []}
            }

            // add prediction if exists
            teamData.matches.forEach(match => {
                match.aiPrediction = CACHED_DATA.predictions[match.uuid] || null;
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

module.exports = {getLeagueTeams, getTeamsFixtures}