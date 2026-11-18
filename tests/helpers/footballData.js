import axios from "axios";
import {vi} from "vitest";

const team = (id, name, shortName, tla) => ({id, name, shortName, tla, crest: `https://crests.test/${id}.png`});

export const ARSENAL = team(57, "Arsenal FC", "Arsenal", "ARS");
export const CHELSEA = team(61, "Chelsea FC", "Chelsea", "CHE");
export const LIVERPOOL = team(64, "Liverpool FC", "Liverpool", "LIV");
// a league team without scheduled matches
export const EVERTON = team(62, "Everton FC", "Everton", "EVE");

export const TEAMS = [ARSENAL, CHELSEA, LIVERPOOL, EVERTON];

const apiMatch = (id, utcDate, homeTeam, awayTeam) => ({
    id,
    utcDate,
    lastUpdated: "2026-11-01T10:00:00Z",
    status: "SCHEDULED",
    homeTeam,
    awayTeam,
});

// matches in football-data.org format
export const MATCHES = [
    apiMatch(100, "2026-12-01T15:00:00Z", ARSENAL, CHELSEA),
    apiMatch(101, "2026-12-08T15:00:00Z", LIVERPOOL, ARSENAL),
    apiMatch(102, "2026-12-15T15:00:00Z", CHELSEA, LIVERPOOL),
];

// uuid of MATCHES[0], as built by getFixturesDTO
export const ARSENAL_CHELSEA_UUID = "100-57-61";

/**
 * Replaces football-data.org API calls (axios.get) with test data.
 * @param {{teamsError?: Error, matchesError?: Error}} [options]
 * @returns the axios.get spy
 */
export function mockFootballData({teamsError, matchesError} = {}) {
    return vi.spyOn(axios, "get").mockImplementation(async (url) => {
        if (url.includes("/teams")) {
            if (teamsError) throw teamsError;
            return {data: {teams: structuredClone(TEAMS)}};
        }
        if (url.includes("/matches")) {
            if (matchesError) throw matchesError;
            return {data: {matches: structuredClone(MATCHES)}};
        }
        throw new Error(`Unexpected football-data request: ${url}`);
    });
}

export const countCalls = (spy, path) => spy.mock.calls.filter(([url]) => url.includes(path)).length;
