import {beforeEach, describe, expect, it, vi} from "vitest";

// cors-config reads env variables on import, so each test re-imports it
async function isAllowed(origin) {
    const {default: corsConfig} = await import("../../src/configs/cors-config.js");
    return new Promise((resolve) => corsConfig.origin(origin, (err, allowed) => resolve(allowed)));
}

describe("CORS origin check", () => {
    beforeEach(() => {
        vi.resetModules();
        vi.stubEnv("FRONT_END_ORIGIN", "https://frontend.test, https://www.frontend.test");
    });

    it("allows every origin from the comma-separated FRONT_END_ORIGIN list", async () => {
        expect(await isAllowed("https://frontend.test")).toBe(true);
        expect(await isAllowed("https://www.frontend.test")).toBe(true);
    });

    it("blocks unknown origins", async () => {
        expect(await isAllowed("https://evil.test")).toBe(false);
        expect(await isAllowed("https://frontend.test.evil.test")).toBe(false);
    });

    it("allows requests without origin (e.g. Postman, server-to-server)", async () => {
        expect(await isAllowed(undefined)).toBe(true);
    });

    it("works with a single origin", async () => {
        vi.stubEnv("FRONT_END_ORIGIN", "https://frontend.test");

        expect(await isAllowed("https://frontend.test")).toBe(true);
        expect(await isAllowed("https://www.frontend.test")).toBe(false);
    });

    it("allows http localhost in development", async () => {
        vi.stubEnv("NODE_ENV", "development");

        expect(await isAllowed("http://localhost:5173")).toBe(true);
        expect(await isAllowed("http://127.0.0.1:3000")).toBe(true);
    });

    it("blocks localhost in production", async () => {
        vi.stubEnv("NODE_ENV", "production");

        expect(await isAllowed("http://localhost:5173")).toBe(false);
        expect(await isAllowed("https://frontend.test")).toBe(true);
    });
});
