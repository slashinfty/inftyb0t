const tmi = require("tmi.js");
const Twitter = require('twitter');
const config = require("./config.js");
const src = require("./src-commands.js");
const rando = require("./randomizer.js");
const rtgg = require("./racetime.js");
const dadjoke = require("./dadjoke.js");

const client = new tmi.client(config.twitch);
const twit = new Twitter(config.twitter);
client.connect();

let jokeCooldown = false;

client.on("chat", (channel, userstate, message, self) => {
    if (self) return;
    
    if (message.startsWith('!src')) {
        const args = message.match(/^(\S+)\s(.*)/).slice(2);
        let terms = args[0].split(';');
        terms.forEach((term, index, array) => { array[index] = term.trim() });
        
        if (terms.length === 0 || terms.length > 3) {
            client.say(channel, `@${userstate.username} invalid number of commands - try !help`);
        } else {
            try {
                if (terms.length === 1) {
                    src.gameOnly(client, channel, terms);
                } else if (terms.length === 2) {
                    if (terms[1].slice(-2).search(/\*/) !== -1) {
                        src.allCategories(client, channel, terms);
                    } else {
                        src.gameCat(client, channel, terms);
                    }
                } else if (terms.length === 3) {
                    src.runnerpb(client, channel, terms, userstate.username);
                }
            } catch (error) {
                console.error(error);
                client.say(channel, `@${userstate.username} sorry, there was a problem - try later?`);
            }
        }
    }

    if (message.startsWith('!race')) {
        rtgg.getLink(client, channel);
    }
    
    if (message.startsWith('!sml2 race')) {
        const reply = rando.raceFlags(message === '!sml2 race+dx');
        client.say(channel, reply);
    }
    
    if (message === '!sml2 hard') {
        const reply = rando.hardFlags();
        client.say(channel, reply);
    }

    if (message === '!joke') {
        if (jokeCooldown) return;
        dadjoke.dadJoke(client, channel);
        jokeCooldown = true;
        setTimeout(() => {
            jokeCooldown = false;
        }, 9e4);
    }
      
    if (message === '!help' || message === '!commands') {
        client.say(channel, `@${userstate.username} https://gist.github.com/slashinfty/1bf0ae88b4c7bb6556229ed44f05b351`);
    }
    
    if (userstate.mod || '#' + userstate.username === channel) {
        try {
            if (message.startsWith('!b')) { //ban = !b name
                const nameArr = message.match(/^(\S+)\s(.*)/).slice(2);
                client.ban(channel, nameArr[0]);
            } else if (message.startsWith('!to')) { //timeout = !t name;time
                const array = message.match(/^(\S+)\s(.*)/).slice(2);
                let terms = array[0].split(';');
                terms.forEach((term, index, array) => { array[index] = term.trim() });
                client.timeout(channel, terms[0], terms[1] * 60);
            } else if (message.startsWith('!e')) { //emotes only = !e on/off
                const modeArr = message.match(/^(\S+)\s(.*)/).slice(2);
                if (modeArr[0] === 'on') client.emoteonly(channel);
                else if (modeArr[0] === 'off') client.emoteonlyoff(channel);
            }
        } catch (error) {
            console.error(error);
            client.say(channel, `@${userstate.username} sorry, I can not do that - am I mod?`);
        }
    }
    
    if (userstate.username === 'dadinfinitum') {
        try {
            if (message.startsWith('!j') && message !== '!joke') { //bot join = !j name
                const nameArr = message.match(/^(\S+)\s(.*)/).slice(2);
                if (message.startsWith('!j*') && config.channels.indexOf(nameArr[0]) === -1) config.channels.push(nameArr[0]);
                try {
                    client.join(nameArr[0]);
                    client.say(channel, 'joining ' + nameArr[0]);
                } catch (error) {
                    console.error(error);
                    client.say(channel, 'hey dad, I am already there!');
                }
            } else if (message.startsWith('!l')) { //bot leave = !l name
                const nameArr = message.match(/^(\S+)\s(.*)/).slice(2);
                if (message.startsWith('!l*') && config.channels.indexOf(nameArr[0]) > -1) config.channels.splice(config.channels.indexOf(nameArr[0]), 1);
                try{
                    client.part(nameArr[0]);
                    client.say(channel, 'leaving ' + nameArr[0]);
                } catch (error) {
                    console.error(error);
                    client.say(channel, 'dad, I am not even there!');
                }
            } else if (message.startsWith('!tweetgame')) { //tweet out a game
				const gameArr = message.match(/^(\S+)\s(.*)/).slice(2);
				let tweet = '[LIVE] Now streaming ' + gameArr[0] + ' - tune in at twitch.tv/dadinfinitum';
				twit.post('statuses/update', {status: tweet})
				.then(() => client.say(channel, 'tweet sent'))
				.catch(error => {client.say(channel, 'tweet failed'); throw error;})
			} else if (message.startsWith('!tweetstatus')) { //tweet out a status
				const statusArr = message.match(/^(\S+)\s(.*)/).slice(2);
				let tweet = '[LIVE] ' + statusArr[0] + ' - tune in at twitch.tv/dadinfinitum';
				twit.post('statuses/update', {status: tweet})
				.then(() => client.say(channel, 'tweet sent'))
				.catch(error => {client.say(channel, 'tweet failed'); throw error;})
			} else if (message.startsWith('!tweetrace')) {
                rtgg.tweetLink(twit, client, channel);
            }
        } catch (error) {
            console.error(error);
            client.say(channel, 'sorry dad, I have failed you');
        }
    }
});
