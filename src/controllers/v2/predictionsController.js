import "dotenv/config";
import OpenAI from "openai";
import { cache } from "../../cache/index.js";
import { getPredictionDTO } from "../../helpers/helpers.js";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set.");
}

const openai = new OpenAI({
    apiKey: API_KEY,
});

const predictionSchema = {
    name: "football_prediction",
    strict: true,
    schema: {
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
        required: ["homeTeam", "awayTeam"],
        additionalProperties: false
    }
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
    "You are an expert football analyst and score predictor. " +
    "Base your predictions on team form, historical head-to-head data, " +
    "and home/away performance trends.";

const model = "gpt-4o-mini";

function createUserPrompt(homeTeam, awayTeam, matchDate) {
    return `Predict the final score for the football match: ${homeTeam} vs ${awayTeam}, scheduled for ${matchDate}.`;
}

export async function predictScores(req, res, next) {
    const { matchUUID, homeTeam, awayTeam, matchDate } = req.body;

    const predictionFromCache = cache.getPrediction(matchUUID);
    if (predictionFromCache) {
        console.log(`Prediction for ${homeTeam} - ${awayTeam} returned from cache, match uuid is ${matchUUID}`);
        return res.json(getPredictionDTO(predictionFromCache));
    }

    try {
        const response = await openai.chat.completions.create({
            model,
            messages: [
                { role: "system", content: systemInstruction },
                { role: "user", content: createUserPrompt(homeTeam, awayTeam, matchDate) }
            ],
            response_format: {
                type: "json_schema",
                json_schema: predictionSchema
            },
        });

        const data = JSON.parse(response.choices[0].message.content);

        if (!isPredictionResponseValid(data)) {
            console.error("Unexpected format:", data);
            return next(new Error("Prediction format error"));
        }

        const lastUpdated = new Date();
        const score = `${data.homeTeam}-${data.awayTeam}`;

        const newPrediction = {
            homeTeam,
            awayTeam,
            matchDate,
            score,
            lastUpdated
        };

        cache.setPrediction(matchUUID, newPrediction);
        return res.json(getPredictionDTO(newPrediction));

    } catch (error) {
        console.error("OpenAI API call failed:", error);
        return next(error);
    }
}