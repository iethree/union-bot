// require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { getMsg } = require('./utils.js');
const { BOT_TOKEN } = require('./config.json');

const CHANNEL_NAME = process.env.TEST ? 'bot-testing' : 'raid'

if (process.env.TEST) {
  client.login(BOT_TOKEN); // FIXME
}

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await sendMessage(client.channels.cache);
  console.log('✅ message sent', new Date());
  process.exit(0);
});


async function sendMessage(channels) {
  const channel = channels.find(c => c.name === CHANNEL_NAME);
  console.log('sending to', channel.name);
  await channel.send(getMsg());
  process.exit(0);
}

async function reminder(req, res) {
  if (req.body && req.body === process.env.PASSCODE) {
    client.login(BOT_TOKEN);
    res.sendStatus(200);
  } else {
    console.error('invalid passcode', req.body);
    res.sendStatus(403);
  }
}

module.exports = { reminder };
