import "dotenv/config";
import {GoogleGenAI} from "@google/genai";

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

export const name = "Gemini";

function createUserPrompt(homeTeam, awayTeam, matchDate) {
    return `Predict the final score for the match: ${homeTeam} vs ${awayTeam}, scheduled for ${matchDate}.`;
}

/**
 * @returns {Promise<string>} Score in 'HomeScore-AwayScore' format, e.g. '2-1'.
 */
export async function predictScore(homeTeam, awayTeam, matchDate) {
    const response = await ai.models.generateContent({
        model,
        contents: createUserPrompt(homeTeam, awayTeam, matchDate),
        config: {
            systemInstruction
        },
    });

    const score = response.text.trim();

    // check if score value contains only score without any other text, example 2-0
    if (!/^\d+-\d+$/.test(score)) {
        console.error("Unexpected format:", score);
        throw new Error("Prediction format error");
    }

    return score;
}
