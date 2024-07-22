import 'dotenv/config';
import { Client, Intents } from 'discord.js';

const client = new Client({ intents: [
  Intents.FLAGS.GUILDS,
  Intents.FLAGS.GUILD_MESSAGES,
  Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  Intents.FLAGS.DIRECT_MESSAGES,
  Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
],
  partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
});

// import { respond } from './chat.js';
import configFile from './config.json' with { type: "json" };
import { chat } from './chat.js';
const { BOT_TOKEN } = configFile;

client.login(BOT_TOKEN);

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}, ${client.user.id}`);
});

client.on('messageCreate', async (message) => {
  const isBot = message.author.bot;
  if (isBot) return;

  const isMentioned = message.content.includes(`<@${client.user.id}>`);
  const isDm = message.channel.type === 'DM';

  if (!isMentioned && !isDm) return;

  const response = await chat(message.content);

  await message.channel.send(response);
});
