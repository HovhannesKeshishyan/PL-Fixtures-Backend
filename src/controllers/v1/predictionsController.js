import {getPrediction} from "../../services/predictionService.js";
import * as geminiProvider from "../../services/predictionProviders/geminiProvider.js";

export async function predictScores(req, res, next) {
    res.setHeader("Deprecation", "true");
    res.setHeader("Link", "</api/v2/predict-scores>; rel=\"successor-version\"");

    try {
        const prediction = await getPrediction(geminiProvider, req.body);
        res.json(prediction);
    } catch (error) {
        next(error);
    }
}
