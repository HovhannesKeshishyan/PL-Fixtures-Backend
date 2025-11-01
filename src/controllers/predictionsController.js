const {GoogleGenAI} = require("@google/genai");
const {CACHED_DATA} = require("../cache/index");

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

function createUserPrompt(homeTeam, awayTeam) {
    return `Predict the final score for the match: ${homeTeam} - ${awayTeam}`;
}

async function predictScores(req, res, next) {
    const {matchID, homeTeam, awayTeam} = req.body;
    if(CACHED_DATA.predictions[matchID]) {
        console.log(`Prediction for ${homeTeam} - ${awayTeam} returned from cache, match id is ${matchID}`);
        return res.json({score: CACHED_DATA.predictions[matchID].score});
    }

    try {
        const response = await ai.models.generateContent({
            model,
            contents: createUserPrompt(homeTeam, awayTeam),
            config: {
                systemInstruction
            },
        });

        const score = response.text.trim();

        if (/^\d+-\d+$/.test(score)) {
            CACHED_DATA.predictions[matchID] = {
                score,
                lastUpdated: new Date(),
            };
            return res.json({score});
        } else {
            console.error("Unexpected format:", score);
            return next(new Error("Prediction format error"));
        }
    } catch (error) {
        console.error("Gemini API call failed:", error);
        return next(error);
    }
}

module.exports = {predictScores};
