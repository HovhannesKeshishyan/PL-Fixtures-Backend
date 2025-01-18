const express = require('express');
const router = express.Router();
const {getLeagueTeams, getTeamsFixtures, getCompetitions} = require("../controllers/fixturesController");
const {teamsFixturesValidator} = require("../validators/fixturesValidators");

router.get('/', function (req, res) {
    res.send('Welcome to the server!');
})

router.get("/api/teams", getLeagueTeams);

router.get("/api/competitions", getCompetitions);

router.post("/api/fixtures", teamsFixturesValidator, getTeamsFixtures);

module.exports = router;