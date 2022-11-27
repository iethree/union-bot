// require('dotenv').config();
const { Client, Intents } = require('discord.js');
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
const { getBreakMsg, getStartMsg, getCountdownMsg, getRaidCountdownMsg } = require('./utils.js');
const { BOT_TOKEN, PASSCODE } = require('./config.json');

const TEST = false;

let CHANNEL_NAME = TEST ? 'bot-testing' : 'raid'

let msgType = 'break';

const msgFunctions = {
  break: getBreakMsg,
  start: getStartMsg,
  countdown: getCountdownMsg,
  raidCountdown: getRaidCountdownMsg,
};

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await sendMessage(client.channels.cache);
  console.log('✅ message sent', new Date());
  process.exit(0);
});

async function sendMessage(channels) {
  const channel = channels.find(c => c.name === CHANNEL_NAME);

  const msg = TEST ? 'testing' : msgFunctions[msgType]?.();
  console.log('sending to', channel.name, msg);
  if (msg) {
    await channel.send(msg);
  }
}

async function unionBot(req, res) {
  if (req?.body !== PASSCODE) {
    console.error('invalid passcode', req.body);
    res.sendStatus(403);
  }
  msgType = req.query.type ?? 'break';

  if (req.query.channel) {
    CHANNEL_NAME = req.query.channel;
  }
  console.log({ msgType, CHANNEL_NAME });
  client.login(BOT_TOKEN);
  res.sendStatus(202);
}

module.exports = { unionBot };
