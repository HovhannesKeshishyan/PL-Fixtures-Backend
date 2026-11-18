import {describe, expect, it, vi} from "vitest";

import {cache} from "../../src/cache/index.js";
import {ARSENAL, MATCHES} from "../helpers/footballData.js";

const DAY = 24 * 60 * 60 * 1000;

describe("teams cache", () => {
    it("is invalid when empty", () => {
        expect(cache.isTeamsCacheValid()).toBeFalsy();
    });

    it("stores teams and their ids", () => {
        cache.setTeams([ARSENAL, "PYUNIC"]);

        expect(cache.getTeams()).toEqual([ARSENAL, "PYUNIC"]);
        expect(cache.getTeamsIds()).toEqual([57, undefined]);
        expect(cache.isTeamsCacheValid()).toBe(true);
    });

    it("expires after one week", () => {
        vi.useFakeTimers();
        cache.setTeams([ARSENAL]);

        vi.advanceTimersByTime(7 * DAY - 1000);
        expect(cache.isTeamsCacheValid()).toBe(true);

        vi.advanceTimersByTime(2000);
        expect(cache.isTeamsCacheValid()).toBe(false);
    });
});

describe("fixtures cache", () => {
    it("is invalid when never updated", () => {
        expect(cache.isFixturesCacheValid()).toBeFalsy();
    });

    it("groups matches by team", () => {
        cache.addFixture(57, MATCHES[0]);
        cache.addFixture(61, MATCHES[0]);
        cache.addFixture(57, MATCHES[1]);

        expect(cache.getFixture(57).matches).toEqual([MATCHES[0], MATCHES[1]]);
        expect(cache.getFixture(61).matches).toEqual([MATCHES[0]]);
        expect(cache.getFixture(64)).toBeUndefined();
    });

    it("expires after five minutes", () => {
        vi.useFakeTimers();
        cache.setFixturesLastUpdate();

        vi.advanceTimersByTime(5 * 60 * 1000 - 1000);
        expect(cache.isFixturesCacheValid()).toBe(true);

        vi.advanceTimersByTime(2000);
        expect(cache.isFixturesCacheValid()).toBe(false);
    });
});

describe("predictions cache", () => {
    const daysAgo = (days) => new Date(Date.now() - days * DAY).toISOString();

    it("stores and returns predictions by match uuid", () => {
        const prediction = {score: "2-1", matchDate: daysAgo(-3)};
        cache.setPrediction("100-57-61", prediction);

        expect(cache.getPrediction("100-57-61")).toEqual(prediction);
        expect(cache.getPrediction("unknown")).toBeNull();
    });

    it("removes predictions for matches older than 7 days when a prediction is added", () => {
        cache.cache.predictions = {
            "8-days-ago": {score: "1-0", matchDate: daysAgo(8)},
            "6-days-ago": {score: "1-0", matchDate: daysAgo(6)},
            future: {score: "1-0", matchDate: daysAgo(-3)},
            "no-date": {score: "1-0"},
            "invalid-date": {score: "1-0", matchDate: "not a date"},
        };

        cache.setPrediction("new", {score: "2-1", matchDate: daysAgo(-5)});

        expect(Object.keys(cache.cache.predictions).sort()).toEqual(
            ["6-days-ago", "future", "invalid-date", "new", "no-date"].sort(),
        );
    });
});
