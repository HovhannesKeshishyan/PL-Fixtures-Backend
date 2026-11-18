import {afterAll, beforeAll, describe, expect, it} from "vitest";

import app from "../../src/app.js";
import {startServer} from "../helpers/server.js";

let server;
beforeAll(async () => (server = await startServer(app)));
afterAll(() => server.close());

describe("app", () => {
    it("serves the home page", async () => {
        const res = await fetch(server.url);

        expect(res.status).toBe(200);
        expect(await res.text()).toContain("WELCOME TO THE SERVER!");
    });

    it("returns 400 with the parse error for invalid JSON body", async () => {
        const res = await server.post("/api/v2/predict-scores", "{invalid json");

        expect(res.status).toBe(400);
    });

    it("does not expose the removed Sentry test endpoint", async () => {
        const res = await fetch(`${server.url}/test/sentry-error`);

        expect(res.status).toBe(404);
    });

    it("sets CORS header for allowed origins only", async () => {
        const allowed = await fetch(server.url, {headers: {Origin: "https://frontend.test"}});
        const blocked = await fetch(server.url, {headers: {Origin: "https://evil.test"}});

        expect(allowed.headers.get("access-control-allow-origin")).toBe("https://frontend.test");
        expect(blocked.headers.get("access-control-allow-origin")).toBeNull();
    });

    it("does not send the credentials CORS header", async () => {
        const res = await fetch(server.url, {headers: {Origin: "https://frontend.test"}});

        expect(res.headers.get("access-control-allow-credentials")).toBeNull();
    });
});
