const querystring = require('querystring');
const fetch = require('node-fetch');
const time = require("./seconds.js");

module.exports = {
    gameOnly: async function (client, channel, args) {
        const filter = args[0].charAt(0) === '/' ? querystring.stringify({ abbreviation: args[0].slice(1) }) : querystring.stringify({ name: args[0] });
        
        const respInitial = await fetch(`https://www.speedrun.com/api/v1/games?${filter}`);
        const initial = await respInitial.json();
        if (initial.data.length === 0) {
            client.say(channel, 'no game found for ' + args[0]);
        } else {
            let gameID = initial.data[0].id;
        
            const response = await fetch(`https://www.speedrun.com/api/v1/games/${gameID}/records?miscellaneous=no&scope=full-game&top=1&embed=game,category,players,platforms,regions`);
            const body = await response.json();
            
            if (body.data[0].runs.length === 0) {
                client.say(channel, args[0] + ' has no runs');
            } else {
                let runnerName = body.data[0].players.data[0].rel === 'user' ? body.data[0].players.data[0].names.international : body.data[0].players.data[0].name;
        
                const reply = body.data[0].game.data.names.international + ' - ' + body.data[0].category.data.name + ' in ' + time.convert(body.data[0].runs[0].run.times.primary_t) + ' by ' + runnerName + ' - ' + body.data[0].runs[0].run.weblink;
                
                client.say(channel, reply);
            }
        }
    },
    gameCat: async function (client, channel, args) {
        const filter = args[0].charAt(0) === '/' ? querystring.stringify({ abbreviation: args[0].slice(1) }) : querystring.stringify({ name: args[0] });
        const terms = args[1].split('|');
        terms.forEach((term, index, array) => { array[index] = term.trim() });
        
        const respInitial = await fetch(`https://www.speedrun.com/api/v1/games?${filter}&embed=categories.variables`);
        const initial = await respInitial.json();
        if (initial.data.length === 0) {
            client.say(channel, 'no game found for ' + args[0]);
        } else {
            let gameID = initial.data[0].id;
            let categoryID;
            for (i = 0; i < initial.data[0].categories.data.length; i++) {
                if (initial.data[0].categories.data[i].name.toLowerCase() == terms[0].toLowerCase()) {
                    categoryID = initial.data[0].categories.data[i].id;
                    break;
                }
            }
            if (categoryID === undefined) {
                client.say(channel, 'no category found for ' + terms[0]);
            } else {
                var varFilter = '';
                var variableName;
                if (terms.length > 1) {
                    let variableID, variableVal;
                    for (i = 0; i < initial.data[0].categories.data[0].variables.data.length; i++) {
                        if (initial.data[0].categories.data[0].variables.data[i]['is-subcategory']) {
                            Object.keys(initial.data[0].categories.data[0].variables.data[i].values.values).forEach((key, index) => {
                                if (initial.data[0].categories.data[0].variables.data[i].values.values[key].label.toLowerCase() === terms[1].toLowerCase()) {
                                    variableVal = key;
                                    variableID = initial.data[0].categories.data[0].variables.data[i].id;
                                    variableName = initial.data[0].categories.data[0].variables.data[i].values.values[key].label;
                                }
                            });
                        }
                    }
                    if (variableVal === undefined || variableID === undefined) {
                        client.say(channel, 'no sub-category found for ' + terms[1]);
                    } else {
                        varFilter = varFilter + '&var-' + variableID + '=' + variableVal;
                    }
                }
                const response = await fetch(`https://www.speedrun.com/api/v1/leaderboards/${gameID}/category/${categoryID}?top=1${varFilter}&embed=game,category.variables,players,regions,platforms`);
                const body = await response.json();
                
                if (body.data.runs.length === 0) {
                    let catMsg = terms.length === 2 ? terms[0] + ' ' + terms[1] : terms[0];
                    client.say(channel, args[0] + ' has no runs in ' + catMsg);
                } else {
                    let subCategory = variableName === undefined ? '' : ' (' + variableName + ')';
                    let runnerName = body.data.players.data[0].rel === 'user' ? body.data.players.data[0].names.international : body.data.players.data[0].name;
        
                    const reply = body.data.game.data.names.international + ' - ' + body.data.category.data.name + subCategory + ' in ' + time.convert(body.data.runs[0].run.times.primary_t) + ' by ' + runnerName + ' - ' + body.data.runs[0].run.weblink;
                    
                    client.say(channel, reply);
                }
            }
        }
    },
    allCategories: async function (client, channel, args) {
        const filter = args[0].charAt(0) === '/' ? querystring.stringify({ abbreviation: args[0].slice(1) }) : querystring.stringify({ name: args[0] });
        const terms = args[1].split('|');
        terms.forEach((term, index, array) => { array[index] = term.trim() });
        
        const response = await fetch(`https://www.speedrun.com/api/v1/games?${filter}&embed=categories`);
        const body = await response.json();
        if (body.data.length === 0) {
            client.say(channel, 'no game found for ' + args[0]);
        } else {
            if (terms.length === 2 && terms[1] !== '') {
                let categoryID;
                    for (i = 0; i < body.data[0].categories.data.length; i++) {
                        if (body.data[0].categories.data[i].name.toLowerCase() == terms[0].toLowerCase()) {
                            categoryID = body.data[0].categories.data[i].id;
                            var categoryURL = body.data[0].categories.data[i].weblink;
                            var categoryName = body.data[0].categories.data[i].name;
                            break;
                        }
                    }
                if (categoryID === undefined) {
                    client.say(channel, 'no category found for ' + terms[0]);
                } else {
                    const respSec = await fetch(`https://www.speedrun.com/api/v1/categories/${categoryID}/variables`);
                    const secondary = await respSec.json();
                    if (secondary.data.length === 0) {
                        client.say(channel, 'no sub-categories found for ' + terms[0]);
                    } else {
                        const reply = 'For a list of sub-categories for ' + body.data[0].names.international + ' - ' + categoryName + ', visit ' + categoryURL;
                        
                        client.say(channel, reply);
                    }
                }
            } else {
                const reply = 'For a list of categories for ' + body.data[0].names.international + ', visit ' + body.data[0].weblink;
                
                client.say(channel, reply);
            }   
        }
    },
    runnerpb: async function (client, channel, args, sender) {
        const filter = args[0].charAt(0) === '/' ? querystring.stringify({ abbreviation: args[0].slice(1) }) : querystring.stringify({ name: args[0] });
        const terms = args[1].split('|');
        terms.forEach((term, index, array) => { array[index] = term.trim() });
        
        const respInitial = await fetch(`https://www.speedrun.com/api/v1/games?${filter}&embed=categories.variables,regions,platforms`);
        const initial = await respInitial.json();
        if (initial.data.length === 0) {
            client.say(channel, 'no game found for ' + args[0]);
        } else {
            let gameID = initial.data[0].id;
            let categoryID;
            for (i = 0; i < initial.data[0].categories.data.length; i++) {
                if (initial.data[0].categories.data[i].name.toLowerCase() == terms[0].toLowerCase()) {
                    categoryID = initial.data[0].categories.data[i].id;
                    break;
                }
            }
            if (categoryID === undefined) {
                client.say(channel, 'no category found for ' + terms[0]);
            } else {
                var varFilter = '';
                var variableName;
                if (terms.length > 1) {
                    var variableID, variableVal;
                    for (i = 0; i < initial.data[0].categories.data[0].variables.data.length; i++) {
                        if (initial.data[0].categories.data[0].variables.data[i]['is-subcategory']) {
                            Object.keys(initial.data[0].categories.data[0].variables.data[i].values.values).forEach((key, index) => {
                                if (initial.data[0].categories.data[0].variables.data[i].values.values[key].label.toLowerCase() === terms[1].toLowerCase()) {
                                    variableVal = key;
                                    variableID = initial.data[0].categories.data[0].variables.data[i].id;
                                    variableName = initial.data[0].categories.data[0].variables.data[i].values.values[key].label;
                                }
                            });
                        }
                    }
                    if (variableVal === undefined || variableID === undefined) {
                        client.say(channel, 'no sub-category found for ' + terms[1]);
                    } else {
                        varFilter = varFilter + '&var-' + variableID + '=' + variableVal;
                    }
                }
                let search;
                if (args[2].slice(-1) === '*') {
                    search = args[2] === '*' ? querystring.stringify({ twitch: sender }) : querystring.stringify({ twitch: args[2].slice(0, -1) });
                } else {
                    search = querystring.stringify({ name: args[2] });
                }
                const respNext = await fetch(`https://www.speedrun.com/api/v1/users?${search}`);
                const next = await respNext.json();
                if (next.data.length === 0) {
                    client.say(channel, 'no runner found for ' + args[2]);
                } else {
                    let userID = next.data[0].id;
                    const response = await fetch(`https://www.speedrun.com/api/v1/users/${userID}/personal-bests?game=${gameID}&embed=game,players,category`);
                    const body = await response.json();
                    if (body.data.length === 0) {
                        client.say(channel, args[2] + ' has no PB in ' + args[0]);
                    } else {
                        let data;
                        for (i = 0; i < body.data.length; i++) {
                            if (terms.length > 1) {
                                if (body.data[i].run.category === categoryID && body.data[i].run.values[variableID] === variableVal) {
                                    data = body.data[i];
                                    break;
                                }
                            } else {
                                if (body.data[i].run.category === categoryID) {
                                    data = body.data[i];
                                    break;
                                }
                            }
                        }
                        if (data === undefined) {
                            let catMsg = terms.length === 2 ? terms[0] + ' ' + terms[1] : terms[0];
                            client.say(channel, args[2] + ' has no PB in ' + catMsg);
                        } else {
                            let subCategory = variableName === undefined ? '' : ' (' + variableName + ')';
        
                            const reply = data.game.data.names.international + ' - ' + data.category.data.name + subCategory + ' in ' + time.convert(data.run.times.primary_t) + ' by ' + data.players.data[0].names.international + ' (rank: ' + data.place + ') - ' + data.run.weblink;
                            
                            client.say(channel, reply);
                        }
                    }
                }
            }
        }
	}
}