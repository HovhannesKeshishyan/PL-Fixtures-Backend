import StatusCodes from "http-status-codes";
import { cache } from "../cache/index.js";

const REQUIRED_PARAMS = ["matchUUID", "homeTeam", "awayTeam", "matchDate"];

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
  const match = findCachedMatch(matchUUID);
  return (
    !!match &&
    isSameTeam(match.homeTeam, homeTeam) &&
    isSameTeam(match.awayTeam, awayTeam)
  );
};

const createBadRequestError = (message) => {
  const err = new Error(message);
  err.status = StatusCodes.BAD_REQUEST;
  return err;
};

export const predictScoresValidator = (req, res, next) => {
  const emptyParams = REQUIRED_PARAMS.filter((param) => !isValidString(req.body[param]));
  const isDateValid = !isNaN(Date.parse(req.body.matchDate));

  if (emptyParams.length || !isDateValid) {
    let errorMessage = "";
    if (emptyParams.length) {
      errorMessage += `Fields are required: ${emptyParams.join(", ")}. `;
    }
    if (!isDateValid) {
      errorMessage += "matchDate must be valid date";
    }
    return next(createBadRequestError(errorMessage));
  }

  if (!isKnownMatch(req.body)) {
    return next(createBadRequestError("Invalid match data"));
  }

  next();
};
