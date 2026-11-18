import {cache} from "../cache/index.js";
import {getPredictionDTO} from "../helpers/helpers.js";

/**
 * @typedef {Object} PredictionProvider
 * @property {string} name - Provider name used in logs.
 * @property {(homeTeam: string, awayTeam: string, matchDate: string) => Promise<string>} predictScore
 */

/**
 * Returns the cached prediction for the match, or requests a new one from the provider and caches it.
 * @param {PredictionProvider} provider
 * @param {{matchUUID: string, homeTeam: string, awayTeam: string, matchDate: string}} match
 * @returns {Promise<{score: string}>}
 */
export async function getPrediction(provider, {matchUUID, homeTeam, awayTeam, matchDate}) {
    const predictionFromCache = cache.getPrediction(matchUUID);
    if (predictionFromCache) {
        console.log(`Prediction for ${homeTeam} - ${awayTeam} returned from cache, match uuid is ${matchUUID}`);
        return getPredictionDTO(predictionFromCache);
    }

    try {
        const score = await provider.predictScore(homeTeam, awayTeam, matchDate);

        const newPrediction = {
            homeTeam,
            awayTeam,
            matchDate,
            score,
            lastUpdated: new Date(),
        };

        cache.setPrediction(matchUUID, newPrediction);
        return getPredictionDTO(newPrediction);
    } catch (error) {
        console.error(`${provider.name} API call failed:`, error);
        throw error;
    }
}
