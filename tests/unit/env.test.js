import {beforeEach, describe, expect, it, vi} from "vitest";

// env.js validates on import, so each test re-imports it with different variables
const importEnv = () => import("../../src/configs/env.js");

describe("environment variables validation", () => {
    beforeEach(() => {
        vi.resetModules();
    });

    it("passes with valid variables", async () => {
        await expect(importEnv()).resolves.toBeDefined();
    });

    it("passes when optional variables are not set", async () => {
        for (const name of ["NODE_ENV", "PORT", "FRONT_END_ORIGIN", "REDIS_URL", "SENTRY_DSN"]) {
            vi.stubEnv(name, undefined);
        }

        await expect(importEnv()).resolves.toBeDefined();
    });

    it("lists all missing required variables at once", async () => {
        vi.stubEnv("API_KEY", undefined);
        vi.stubEnv("GEMINI_API_KEY", undefined);
        vi.stubEnv("OPENAI_API_KEY", undefined);

        const error = await importEnv().catch((err) => err);

        expect(error.message).toContain("Invalid environment variables");
        expect(error.message).toContain("API_KEY");
        expect(error.message).toContain("GEMINI_API_KEY");
        expect(error.message).toContain("OPENAI_API_KEY");
    });

    it("treats empty values as not set", async () => {
        vi.stubEnv("API_KEY", "");

        await expect(importEnv()).rejects.toThrow("API_KEY");
    });

    it("rejects invalid NODE_ENV", async () => {
        vi.stubEnv("NODE_ENV", "prod");

        await expect(importEnv()).rejects.toThrow("NODE_ENV");
    });

    it("rejects invalid PORT", async () => {
        vi.stubEnv("PORT", "abc");

        await expect(importEnv()).rejects.toThrow("PORT");
    });

    it("accepts numeric PORT", async () => {
        vi.stubEnv("PORT", "8080");

        await expect(importEnv()).resolves.toBeDefined();
    });
});
