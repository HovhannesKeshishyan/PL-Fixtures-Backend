const {ONE_WEEK, FIVE_MINUTES} = require("../constants/constants");

class Cache {
    static instance = null;

    constructor() {
        if (Cache.instance) {
            return Cache.instance;
        }

        this.cache = {
            teams: {
                value: [],
                lastUpdated: null,
                teamIds: []
            },
            fixtures: {
                lastUpdated: null,
            },
            predictions: {}
        };

        Cache.instance = this;
    }

    /**
     * @param {string} matchID - ID of the match.
     * @returns {{score: string | null, lastUpdated: string}}
     */
    getPrediction(matchID) {
        return this.cache.predictions[matchID] || null;
    }

    /**
     * @param {string} matchID - ID of the match.
     * @param {string} prediction - Predicted score.
     * @returns {{score: string | null, lastUpdated: string}}
     */
    setPrediction(matchID, prediction) {
        this.cache.predictions[matchID] = prediction;
    }

    /**
     * @returns {{id: number, name: string, shortName: string, crest: string}[]}
     */
    getTeams() {
        return this.cache.teams.value;
    }

    /**
     * @returns {string[]}
     */
    getTeamsIds() {
        return this.cache.teams.teamIds;
    }

    /**
     * @param {{id: number, name: string, shortName: string, crest: string}[]} teams
     */
    setTeams(teams) {
        this.cache.teams.value = teams;
        this.cache.teams.lastUpdated = Date.now();
        this.cache.teams.teamIds = teams.map(team => team.id);
    }

    /**
     * @returns {boolean}
     */
    teamsCacheIsValid() {
        const now = Date.now();
        const {value, lastUpdated} = this.cache.teams;
        return value.length > 0 && lastUpdated && (now - lastUpdated < ONE_WEEK);
    }

    getFixtures() {
        return this.cache.fixtures;
    }

    getFixture(fixtureId) {
        return this.cache.fixtures[fixtureId];
    }

    setFixturesLastUpdate() {
        this.cache.fixtures.lastUpdated = Date.now();
    }

    clearFixtures() {
        this.cache.fixtures = {};
    }

    setFixture(teamID, fixtures) {
        this.cache.fixtures[teamID] = fixtures;
    }

    addFixture(teamID, match) {
        if (!this.getFixture(teamID)) {
            this.setFixture(teamID, {teamId: teamID, matches: []});
        }
        this.cache.fixtures[teamID].matches.push(match);
    }

    /**
     * @returns {boolean}
     */
    fixturesCacheIsValid() {
        const now = Date.now();
        const lastUpdated = this.getFixtures().lastUpdated;
        return lastUpdated && (now - lastUpdated < FIVE_MINUTES)
    }
}

const cache = new Cache();
module.exports = {cache};