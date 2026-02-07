import express from "express";

import {getLeagueTeams, getTeamsFixtures} from"../../controllers/v1/fixturesController.js";
import {predictScores} from"../../controllers/v1/predictionsController.js";

import {teamsFixturesValidator} from"../../validators/fixturesValidators.js";
import {predictScoresValidator} from"../../validators/predictScoresValidators.js";

const router = express.Router();

router.get("/teams", getLeagueTeams);

router.post("/fixtures", teamsFixturesValidator, getTeamsFixtures);

router.post("/predict-scores", predictScoresValidator, predictScores);

export default router;