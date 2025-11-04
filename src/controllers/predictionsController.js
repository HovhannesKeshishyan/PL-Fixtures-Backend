import {GoogleGenAI} from "@google/genai";
import {cache} from "../cache/index.js";

process.loadEnvFile();

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({
    apiKey: API_KEY,
});

const systemInstruction =
    "You are an expert football predictor. Your ONLY task is to provide a single " +
    "final score prediction. The output must ONLY contain the score in " +
    "'HomeScore-AwayScore' format (e.g., '2-1', '0-0'). " +
    "DO NOT include any other text, explanation, or markdown formatting.";

const model = "gemini-2.5-flash";

function createUserPrompt(homeTeam, awayTeam, matchDate) {
    return `Predict the final score for the match: ${homeTeam} vs ${awayTeam}, scheduled for ${matchDate}.`;
}

export async function predictScores(req, res, next) {
    const {matchUUID, homeTeam, awayTeam, matchDate} = req.body;

    const predictionFromCache = cache.getPrediction(matchUUID);
    if (predictionFromCache) {
        console.log(`Prediction for ${homeTeam} - ${awayTeam} returned from cache, match uuid is ${matchUUID}`);
        return res.json({score: predictionFromCache.score});
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: createUserPrompt(homeTeam, awayTeam, matchDate),
            config: {
                systemInstruction
            },
        });

        const score = response.text.trim();
        const lastUpdated = new Date();

        if (/^\d+-\d+$/.test(score)) {
            cache.setPrediction(matchUUID, {
                score,
                lastUpdated,
            });
            return res.json({score, lastUpdated});
        } else {
            console.error("Unexpected format:", score);
            return next(new Error("Prediction format error"));
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return next(error);
    }
}
