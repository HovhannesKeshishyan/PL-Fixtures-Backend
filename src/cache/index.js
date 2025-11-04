import {ONE_WEEK, FIVE_MINUTES} from "../constants/constants.js";
import {DB} from "../db/redis.js";

function getCacheInitialValues() {
    return {
        teams: {
            value: [],
            lastUpdated: null,
            teamIds: []
        },
        fixtures: {
            value: {},
            lastUpdated: null,
        },
        predictions: {}
    };
}

class Cache {
    static instance = null;

    static async getInstance() {
        if (!Cache.instance) {
            const cache = new Cache();
            await cache.initCache();
            Cache.instance = cache;
        }
        return Cache.instance;
    }

    constructor() {
        this.cache = getCacheInitialValues();
    }

    async initCache() {
        try {
            const client = await DB.connect();
            const result = client && await client.get("CACHE");
            this.cache = result ? JSON.parse(result) : getCacheInitialValues();
        } catch (err) {
            console.error("Cache init failed:", err);
            this.cache = getCacheInitialValues();
        }
    }

    async saveCacheInRedis() {
        if (this._saveTimeout) clearTimeout(this._saveTimeout);
        this._saveTimeout = setTimeout(async () => {
            try {
                const client = DB.getClient();
                if (client) {
                    await client.set("CACHE", JSON.stringify(this.cache));
                    console.log("Cache is saved in Redis")
                }
            } catch (err) {
                console.error("Failed to save cache:", err);
            }
        }, 200); // waits briefly to group multiple writes
    }

    saveCacheInDB() {
        this.saveCacheInRedis();
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
     * @param {{score: string, lastUpdated: Date}} prediction - Predicted score.
     */
    setPrediction(matchID, prediction) {
        this.cache.predictions[matchID] = prediction;

        this.saveCacheInDB();
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

        this.saveCacheInDB();
    }

    /**
     * @returns {boolean}
     */
    isTeamsCacheValid() {
        const now = Date.now();
        const {value, lastUpdated} = this.cache.teams;
        return value.length > 0 && lastUpdated && (now - lastUpdated < ONE_WEEK);
    }

    getFixtures() {
        return this.cache.fixtures;
    }

    getFixture(fixtureId) {
        return this.cache.fixtures.value[fixtureId];
    }

    setFixturesLastUpdate() {
        this.cache.fixtures.lastUpdated = Date.now();

        this.saveCacheInDB();
    }

    clearFixturesValue() {
        this.cache.fixtures.value = {};

        this.saveCacheInDB();
    }

    setFixture(teamID, fixtures) {
        this.cache.fixtures.value[teamID] = fixtures;

        this.saveCacheInDB();
    }

    addFixture(teamID, match) {
        if (!this.getFixture(teamID)) {
            this.setFixture(teamID, {teamId: teamID, matches: []});
        }
        this.cache.fixtures.value[teamID].matches.push(match);

        this.saveCacheInDB();
    }

    /**
     * @returns {boolean}
     */
    isFixturesCacheValid() {
        const now = Date.now();
        const {lastUpdated} = this.getFixtures();
        return lastUpdated && (now - lastUpdated < FIVE_MINUTES);
    }
}

export const cache = await Cache.getInstance();