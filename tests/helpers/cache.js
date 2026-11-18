import {cache} from "../../src/cache/index.js";

export function resetCache() {
    cache.cache = {
        teams: {value: [], lastUpdated: null, teamIds: []},
        fixtures: {value: {}, lastUpdated: null},
        predictions: {},
    };
}
