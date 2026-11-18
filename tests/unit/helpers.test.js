import {describe, expect, it} from "vitest";

import {getFixturesDTO, getPredictionDTO, getTeamsDTO} from "../../src/helpers/helpers.js";
import {ARSENAL, CHELSEA, MATCHES} from "../helpers/footballData.js";

describe("getTeamsDTO", () => {
    it("keeps only id, name, shortName and crest", () => {
        expect(getTeamsDTO([{...ARSENAL, founded: 1886, venue: "Emirates Stadium"}])).toEqual([
            {id: 57, name: "Arsenal FC", shortName: "Arsenal", crest: ARSENAL.crest},
        ]);
    });
});

describe("getFixturesDTO", () => {
    it("adds uuid built from match, home team and away team ids", () => {
        const [match] = getFixturesDTO([MATCHES[0]]);

        expect(match).toEqual({
            id: 100,
            uuid: "100-57-61",
            utcDate: "2026-12-01T15:00:00Z",
            lastUpdated: "2026-11-01T10:00:00Z",
            homeTeam: ARSENAL,
            awayTeam: CHELSEA,
        });
    });

    it("drops fields that are not needed", () => {
        const [match] = getFixturesDTO([{...MATCHES[0], referees: [], odds: {}}]);

        expect(match).not.toHaveProperty("status");
        expect(match).not.toHaveProperty("referees");
        expect(match).not.toHaveProperty("odds");
    });
});

describe("getPredictionDTO", () => {
    it("returns only the score", () => {
        const prediction = {
            score: "2-1",
            homeTeam: "A",
            awayTeam: "B",
            matchDate: "2026-12-01",
            lastUpdated: new Date(),
        };

        expect(getPredictionDTO(prediction)).toEqual({score: "2-1"});
    });
});
