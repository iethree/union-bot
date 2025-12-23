import 'dotenv/config';
import { Client, Intents } from 'discord.js';
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });
import { getExpansionCountdownMsg, getRaidCountdownMsg } from './utils.js';
import { breakMessage, raidStartMessage, unionRule, roll } from './chat.js';
import configFile from './config.json' with { type: "json" };
const { BOT_TOKEN, PASSCODE } = configFile;

let CHANNEL_NAME = process.env.TEST
  ? 'bot-testing'
  : 'raid';

let msgType = '';

const msgFunctions = {
  break: breakMessage,
  start: raidStartMessage,
  expansionCountdown: () => getExpansionCountdownMsg('Midnight', ':new_moon:'),
  raidCountdown: getRaidCountdownMsg,
  unionRule,
  roll,
};

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}`);
  await sendMessage(client.channels.cache);
  console.log('✅ message sent', new Date());
  process.exit(0);
});

async function sendMessage(channels) {
  const channel = channels.find(c => c.name === CHANNEL_NAME);

  if (!(msgType in msgFunctions)) {
    console.error('invalid msgType', msgType);
    return;
  }

  const msg = await msgFunctions[msgType]?.() ?? 'Uh oh, something went wrong.';
  console.log('sending to', channel.name, msg);
  if (msg) {
    await channel.send(msg);
  }
}

export async function unionBot(req, res) {
  if (req?.body !== PASSCODE) {
    console.error('invalid passcode', req.body);
    res.sendStatus(403);
    return;
  }
  msgType = req.query.type;

  if (req.query.channel) {
    CHANNEL_NAME = req.query.channel;
  }

  console.log({ msgType, CHANNEL_NAME });
  client.login(BOT_TOKEN);
  res.sendStatus(202);
}

// unionBot({ body: PASSCODE, query: { type: 'roll' } }, { sendStatus: console.log });
