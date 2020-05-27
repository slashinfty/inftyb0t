const fetch = require('node-fetch');

module.exports = {
    getLink: async function(client, channel) {
        const siteRoot = 'https://racetime.gg';
        async function asyncForEach(array, callback) {
            for (let i = 0; i < array.length; i++) {
                await callback(array[i], i, array);
            }
        }
        const raceSearch = await fetch(`${siteRoot}/races/data`);
        const races = await raceSearch.json();
        if (races.races.length === 0) client.say(channel, 'No active races');
        else {
            const foundRace = null;
            races.races.forEach(async (race) => {
                const raceUrl = race.data_url;
                const lookupSearch = await fetch(`${siteRoot}${raceUrl}`);
                const lookup = await lookupSearch.json();
                for (let i = 0; i < lookup.entrants.length; i++) {
                    if (lookup.entrants[i].user.name === "dad infinitum") {
                        foundRace = lookup.data_url;
                        break;
                    }
                }
            });
            if (foundRace === null) client.say(channel, 'dad infinitum is not in any races');
            else {
                const game = foundRace.category.name + ' - ' + foundRace.goal.name;
                const link = 'https://racetime.gg' + foundRace.url + '/spectate';
                return [game, link];
            }
        }
    }
}