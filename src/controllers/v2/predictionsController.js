import "dotenv/config";
import {GoogleGenAI} from "@google/genai";
import {cache} from "../../cache/index.js";
import {getPredictionDTO} from "../../helpers/helpers.js";

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({
    apiKey: API_KEY,
});

const predictionSchema = {
    type: "object",
    properties: {
        homeTeam: {
            type: "number",
            description: "Goals scored by the home team"
        },
        awayTeam: {
            type: "number",
            description: "Goals scored by the away team"
        }
    },
    required: ["homeTeam", "awayTeam"]
};

const isPredictionResponseValid = (data) => {
    return (
        data &&
        Number.isInteger(data.homeTeam) &&
        Number.isInteger(data.awayTeam) &&
        data.homeTeam >= 0 &&
        data.awayTeam >= 0
    );
};

const systemInstruction =
    "You are an expert football predictor. " +
    "Return ONLY valid JSON matching the provided schema. " +
    "Do not include explanations, markdown, or extra text.";

const model = "gemini-2.5-flash";

function createUserPrompt(homeTeam, awayTeam, matchDate) {
    return `Predict the final score for the football match: ${homeTeam} vs ${awayTeam}, scheduled for ${matchDate}. where homeTeam is ${homeTeam} and awayTeam = ${awayTeam}`;
}

export async function predictScores(req, res, next) {
    const {matchUUID, homeTeam, awayTeam, matchDate} = req.body;

    const predictionFromCache = cache.getPrediction(matchUUID);
    if (predictionFromCache) {
        console.log(`Prediction for ${homeTeam} - ${awayTeam} returned from cache, match uuid is ${matchUUID}`);
        return res.json(getPredictionDTO(predictionFromCache));
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: createUserPrompt(homeTeam, awayTeam, matchDate),
            config: {
                responseMimeType: "application/json",
                responseSchema: predictionSchema,
                systemInstruction
            },
        });

        const data = JSON.parse(response.text);
        if (!isPredictionResponseValid(data)) {
            console.error("Unexpected format:", data);
            return next(new Error("Prediction format error"));
        }

        const lastUpdated = new Date();
        const score = `${data.homeTeam}-${data.awayTeam}`

        const newPrediction = {
            homeTeam,
            awayTeam,
            matchDate,
            score,
            lastUpdated
        }

        cache.setPrediction(matchUUID, newPrediction);
        return res.json(getPredictionDTO(newPrediction));
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return next(error);
    }
}
