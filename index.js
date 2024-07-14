import 'dotenv/config';
import { Client, Intents } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
import { getExpansionCountdownMsg, getRaidCountdownMsg } from './utils.js';
import { breakMessage, raidStartMessage } from './chat.js';
import configFile from './config.json' with { type: "json" };
const { BOT_TOKEN, PASSCODE } = configFile;

const TEST = true;

let CHANNEL_NAME = TEST ? 'bot-testing' : 'raid'

let msgType = 'break';

const msgFunctions = {
  break: breakMessage,
  start: raidStartMessage,
  expansionCountdown: () => getExpansionCountdownMsg('The War Within', ':crossed_swords:'),
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

  const msg = TEST ? 'testing' : await msgFunctions[msgType]?.();
  console.log('sending to', channel.name, msg);
  if (msg) {
    await channel.send(msg);
  }
}

export async function unionBot(req, res) {
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
