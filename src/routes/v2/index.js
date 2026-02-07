import express from "express";

import {predictScores} from "../../controllers/v2/predictionsController.js";
import {predictScoresValidator} from "../../validators/predictScoresValidators.js";

const router = express.Router();

router.post("/predict-scores", predictScoresValidator, predictScores);

export default router;