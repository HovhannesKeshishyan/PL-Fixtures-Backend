const express = require('express');
const router = express.Router();
const {getLeagueTeams, getTeamsFixtures} = require("../controllers/fixturesController");
const {predictScores} = require("../controllers/predictionsController");
const {teamsFixturesValidator} = require("../validators/fixturesValidators");
const {predictScoresValidator} = require("../validators/predictScoresValidators");

router.get('/', function (req, res) {
    res.send('Welcome to the server!');
})

router.get("/api/teams", getLeagueTeams);

router.post("/api/fixtures", teamsFixturesValidator, getTeamsFixtures);

router.post("/api/predict-scores", predictScoresValidator, predictScores);

module.exports = router;