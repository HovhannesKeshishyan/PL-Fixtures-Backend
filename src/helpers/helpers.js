/**
 * @param data - Data from API.
 * @returns {{id: number, name: string, shortName: string, crest: string}[]}
 */
const getTeamsDTO = (data) => {
    return data.map(item => {
        const {id, name, shortName, crest} = item;
        return {id, name, shortName, crest};
    })
}

/**
 * @param data - Data from API.
 * @returns {{id: number, utcDate: string, lastUpdated: string, homeTeam: {}, awayTeam: {}}[]}
 */
const getFixturesDTO = (data) => {
    return data.matches.map(match => {
        const {id, utcDate, lastUpdated, homeTeam, awayTeam} = match;
        return {id, utcDate, lastUpdated, homeTeam, awayTeam}
    });
}

module.exports = {getTeamsDTO, getFixturesDTO}