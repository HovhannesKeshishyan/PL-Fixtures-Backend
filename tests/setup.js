import {afterEach, beforeEach, vi} from "vitest";

import {resetCache} from "./helpers/cache.js";

// never connect to a real Redis in tests, so the real cache can't be read or overwritten
vi.mock("../src/db/redis.js", () => ({
    DB: {
        connect: async () => null,
        getClient: () => null,
    },
}));

beforeEach(() => {
    resetCache();

    // keep test output clean (app logs cache hits, errors, etc.)
    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
});
