/**
 * @param data - Data from API.
 * @returns {{id: number, name: string, shortName: string, crest: string}[]}
 */
export const getTeamsDTO = (data) => {
    return data.map(item => {
        const {id, name, shortName, crest} = item;
        return {id, name, shortName, crest};
    })
}

/**
 * @param matches - Array of matches.
 * @returns {{id: number, utcDate: string, lastUpdated: string, homeTeam: {}, awayTeam: {}}[]}
 */
export const getFixturesDTO = (matches) => {
    return matches.map(match => {
        const {id, utcDate, lastUpdated, homeTeam, awayTeam} = match;
        const uuid = id + '-' + homeTeam.id + '-' + awayTeam.id; // match id alone sometimes is not unique
        return {id, uuid, utcDate, lastUpdated, homeTeam, awayTeam}
    });
}