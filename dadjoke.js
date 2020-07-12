module.exports = {
  dadJoke: async function (client, channel) {
    const fetch = require('node-fetch');
    const url = "https://icanhazdadjoke.com/";
    const options = { headers: { 'Accept': 'application/json' } };
    const jokeQuery = await fetch(url, options);
    const jokeObject = await jokeQuery.json();
    client.say(channel, jokeObject.joke);
  }
}
