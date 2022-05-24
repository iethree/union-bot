// require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { getBreakMsg, getStartMsg } = require('./utils.js');
const { BOT_TOKEN, PASSCODE } = require('./config.json');

const TEST = false;

const CHANNEL_NAME = TEST ? 'bot-testing' : 'raid'

let msgType = 'break';

const msgFunctions = {
  break: getBreakMsg,
  start: getStartMsg,
};

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await sendMessage(client.channels.cache);
  console.log('✅ message sent', new Date());
  process.exit(0);
});

async function sendMessage(channels) {
  const channel = channels.find(c => c.name === CHANNEL_NAME);
  console.log('sending to', channel.name);
  TEST
    ? await channel.send('testing')
    : await channel.send(msgFunctions[msgType]());
}

async function unionBot(req, res) {
  if (req.body && req.body === PASSCODE) {
    msgType = req.query.type ?? 'break';
    client.login(BOT_TOKEN);
    res.sendStatus(200);
  } else {
    console.error('invalid passcode', req.body);
    res.sendStatus(403);
  }
}

module.exports = { unionBot };
