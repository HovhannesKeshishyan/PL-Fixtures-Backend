import {AxiosError} from "axios";
import {afterAll, beforeAll, describe, expect, it} from "vitest";

import app from "../../src/app.js";
import {cache} from "../../src/cache/index.js";
import {
    ARSENAL,
    ARSENAL_CHELSEA_UUID,
    CHELSEA,
    countCalls,
    EVERTON,
    mockFootballData,
} from "../helpers/footballData.js";
import {startServer} from "../helpers/server.js";

let server;
beforeAll(async () => (server = await startServer(app)));
afterAll(() => server.close());

const getFixtures = (body) => server.post("/api/v1/fixtures", body);
const uuids = (team) => team.matches.map((match) => match.uuid);

describe("POST /api/v1/fixtures", () => {
    it("returns scheduled matches for each requested team", async () => {
        mockFootballData();

        const res = await getFixtures({ids: [ARSENAL.id, CHELSEA.id]});

        expect(res.status).toBe(200);
        const [arsenal, chelsea] = await res.json();
        expect(arsenal.teamId).toBe(ARSENAL.id);
        expect(uuids(arsenal)).toEqual(["100-57-61", "101-64-57"]);
        expect(chelsea.teamId).toBe(CHELSEA.id);
        expect(uuids(chelsea)).toEqual(["100-57-61", "102-61-64"]);
    });

    it("returns an empty list for a team without scheduled matches", async () => {
        mockFootballData();

        const [everton] = await (await getFixtures({ids: [EVERTON.id]})).json();

        expect(everton).toEqual({teamId: EVERTON.id, matches: []});
    });

    it("applies the limit", async () => {
        mockFootballData();

        const [limited] = await (await getFixtures({ids: [ARSENAL.id], limit: 1})).json();
        const [all] = await (await getFixtures({ids: [ARSENAL.id], limit: "all"})).json();

        expect(limited.matches).toHaveLength(1);
        expect(all.matches).toHaveLength(2);
    });

    it("calls football-data only once while the fixtures cache is valid", async () => {
        const api = mockFootballData();

        await getFixtures({ids: [ARSENAL.id]});
        await getFixtures({ids: [CHELSEA.id]});

        expect(countCalls(api, "/matches")).toBe(1);
    });

    it("adds AI prediction to matches without changing cached matches", async () => {
        mockFootballData();
        cache.setPrediction(ARSENAL_CHELSEA_UUID, {score: "2-1", matchDate: "2026-12-01T15:00:00Z"});

        const [arsenal] = await (await getFixtures({ids: [ARSENAL.id]})).json();

        expect(arsenal.matches[0].aiPrediction).toMatchObject({score: "2-1"});
        expect(arsenal.matches[1].aiPrediction).toBeNull();
        for (const match of cache.getFixture(ARSENAL.id).matches) {
            expect(match).not.toHaveProperty("aiPrediction");
        }
    });

    it("returns 400 for unknown team ids", async () => {
        mockFootballData();

        const res = await getFixtures({ids: [ARSENAL.id, 999]});

        expect(res.status).toBe(400);
        expect(await res.text()).toBe("Team ids are invalid: 999");
    });

    it("returns 400 when ids are missing", async () => {
        const res = await getFixtures({});

        expect(res.status).toBe(400);
        expect(await res.text()).toBe("ids is required");
    });

    it("returns 502 instead of 'invalid ids' when teams can't be loaded", async () => {
        mockFootballData({teamsError: new Error("upstream down")});

        const res = await getFixtures({ids: [ARSENAL.id]});

        expect(res.status).toBe(502);
        expect(await res.text()).toBe("Failed to load teams, please try again later");
    });

    it("returns a generic 500 without upstream details when matches can't be loaded", async () => {
        // a real axios error, as thrown when football-data responds with 403
        const error = new AxiosError("Request failed with status code 403", "ERR_BAD_REQUEST", undefined, undefined, {
            status: 403,
            data: {message: "Your API token SECRET is restricted"},
            headers: {},
            config: {},
        });
        mockFootballData({matchesError: error});

        const res = await getFixtures({ids: [ARSENAL.id]});

        expect(res.status).toBe(500);
        expect(await res.text()).toBe("Server Error");
    });
});
