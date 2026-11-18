import {getPrediction} from "../../services/predictionService.js";
import * as openaiProvider from "../../services/predictionProviders/openaiProvider.js";

export async function predictScores(req, res, next) {
    try {
        const prediction = await getPrediction(openaiProvider, req.body);
        res.json(prediction);
    } catch (error) {
        next(error);
    }
}
