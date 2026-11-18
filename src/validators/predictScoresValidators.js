import StatusCodes from "http-status-codes";
import { cache } from "../cache/index.js";

const isValidString = (str) => typeof str === "string" && str.trim().length > 0;

const findCachedMatch = (matchUUID) => {
  for (const { matches } of Object.values(cache.getFixtures().value)) {
    const match = matches.find((m) => m.uuid === matchUUID);
    if (match) return match;
  }
  return null;
};

const isSameTeam = (team, name) => team.name === name.trim();

// only real scheduled matches with correct team names can be predicted
const isKnownMatch = ({ matchUUID, homeTeam, awayTeam }) => {
  console.log("isKnownMatch", matchUUID, homeTeam, awayTeam);
  const match = findCachedMatch(matchUUID);
  return (
    !!match &&
    isSameTeam(match.homeTeam, homeTeam) &&
    isSameTeam(match.awayTeam, awayTeam)
  );
};

export const predictScoresValidator = (req, res, next) => {
  const { matchUUID, homeTeam, awayTeam, matchDate } = req.body;

  const requiredParams = [matchUUID, homeTeam, awayTeam, matchDate];

  const allIsValid =
    requiredParams.every((p) => isValidString(p)) &&
    !isNaN(Date.parse(matchDate));

  if (allIsValid) {
    if (isKnownMatch(req.body)) return next();

    const err = new Error("Invalid match data");
    err.status = StatusCodes.BAD_REQUEST;
    return next(err);
  }

  let errorMessage = "";
  const emptyParams = [];
  ["matchUUID", "homeTeam", "awayTeam", "matchDate"].forEach((param) => {
    if (!isValidString(req.body[param])) {
      emptyParams.push(param);
    }
  });

  if (emptyParams.length) {
    errorMessage += `Fields are required: ${emptyParams.join(", ")}. `;
  }

  if (isNaN(Date.parse(matchDate))) {
    errorMessage += "matchDate must be valid date";
  }

  const err = new Error(errorMessage);
  err.status = StatusCodes.BAD_REQUEST;
  next(err);
};
