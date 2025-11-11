import express from "express";

import {getHomePage} from"../controllers/homeController.js";
import {getLeagueTeams, getTeamsFixtures} from"../controllers/fixturesController.js";
import {predictScores} from"../controllers/predictionsController.js";

import {teamsFixturesValidator} from"../validators/fixturesValidators.js";
import {predictScoresValidator} from"../validators/predictScoresValidators.js";

const router = express.Router();

router.get("/", getHomePage);

router.get("/api/teams", getLeagueTeams);

router.post("/api/fixtures", teamsFixturesValidator, getTeamsFixtures);

router.post("/api/predict-scores", predictScoresValidator, predictScores);

export default router;