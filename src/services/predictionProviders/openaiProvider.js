import "dotenv/config";
import OpenAI from "openai";
import {zodTextFormat} from "openai/helpers/zod";
import {z} from "zod";

const API_KEY = process.env.OPENAI_API_KEY;
if (!API_KEY) {
    throw new Error("OPENAI_API_KEY environment variable not set.");
}

const openai = new OpenAI({
    apiKey: API_KEY,
});

const ScoreSchema = z.object({
    homeTeam: z.number().int().min(0),
    awayTeam: z.number().int().min(0)
});

const isPredictionResponseValid = (data) => {
    return (
        data &&
        Number.isInteger(data.homeTeam) &&
        Number.isInteger(data.awayTeam) &&
        data.homeTeam >= 0 &&
        data.awayTeam >= 0
    );
};

const systemPrompt =
    "You are an expert football analyst and score predictor. " +
    "Base your predictions on team form, historical head-to-head data, " +
    "and home/away performance trends.";

const MODEL = "gpt-4.1-mini";

export const name = "OpenAI";

function createUserPrompt(homeTeam, awayTeam, matchDate) {
    return `Predict the final score for the football match: ${homeTeam} vs ${awayTeam}, scheduled for ${matchDate}.`;
}

/**
 * @returns {Promise<string>} Score in 'HomeScore-AwayScore' format, e.g. '2-1'.
 */
export async function predictScore(homeTeam, awayTeam, matchDate) {
    const response = await openai.responses.parse({
        model: MODEL,
        input: [
            {role: "system", content: systemPrompt},
            {
                role: "user",
                content: createUserPrompt(homeTeam, awayTeam, matchDate),
            },
        ],
        text: {
            format: zodTextFormat(ScoreSchema, "event"),
        },
    });

    const data = response.output_parsed;

    if (!isPredictionResponseValid(data)) {
        console.error("Unexpected format:", data);
        throw new Error("Prediction format error");
    }

    return `${data.homeTeam}-${data.awayTeam}`;
}
