import {afterAll, beforeAll, describe, expect, it} from "vitest";

import app from "../../src/app.js";
import {countCalls, mockFootballData, TEAMS} from "../helpers/footballData.js";
import {startServer} from "../helpers/server.js";

let server;
beforeAll(async () => (server = await startServer(app)));
afterAll(() => server.close());

describe("GET /api/v1/teams", () => {
    it("returns league teams with only the needed fields", async () => {
        mockFootballData();

        const res = await fetch(`${server.url}/api/v1/teams`);

        expect(res.status).toBe(200);
        expect(await res.json()).toEqual(TEAMS.map(({id, name, shortName, crest}) => ({id, name, shortName, crest})));
    });

    it("calls football-data only once and then serves teams from cache", async () => {
        const api = mockFootballData();

        await fetch(`${server.url}/api/v1/teams`);
        const res = await fetch(`${server.url}/api/v1/teams`);

        expect(res.status).toBe(200);
        expect(countCalls(api, "/teams")).toBe(1);
    });

    it("returns 502 with a generic message when football-data fails", async () => {
        mockFootballData({teamsError: new Error("Your API token SECRET is restricted")});

        const res = await fetch(`${server.url}/api/v1/teams`);

        expect(res.status).toBe(502);
        expect(await res.text()).toBe("Failed to load teams, please try again later");
    });
});
