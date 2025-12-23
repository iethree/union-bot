import 'dotenv/config';
import { Client, Intents } from 'discord.js';
import { getLastRaidReport } from './summarize.js';

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
import { chat, raidStartMessage, generateXal } from './chat.js';
const { BOT_TOKEN } = configFile;

client.login(BOT_TOKEN);

client.on('ready', async () => {
  console.log(`Logged in as ${client.user.tag}, ${client.user.id}`);
});

client.on('messageCreate', async (message) => {
  console.log(`💬 ${message.content}`);

  const isBot = message.author.bot;
  if (isBot) return;

  const isMentioned = message.content.includes(`<@${client.user.id}>`);
  const isDm = message.channel.type === 'DM';

  if (!isMentioned && !isDm && !message.content.startsWith('/')) {
    return;
  }

  try {
    if (message.content == "/raid-report") {
      const { summary, fights, title, date } = await getLastRaidReport();
      const res = await message.channel.send(
        `**${title} - ${date}**\n`
        + "```ansi\n" + summary + "\n```"
      );

      if (!isDm) {
        // create thread from this message
        const thread = await res.startThread({
          name: `${title} - ${date}`,
        });

        for (const fight of fights) {
          await thread.send("```ansi\n" + fight + "\n```");
        }
      }
      return;
    }

    if (message.content.startsWith("/raid-start")) {
      const { image, text } = await raidStartMessage();
      // send image response
      await message.channel.send({ files: [image], content: text });
      return;
    }

    if (message.content.startsWith("/xal")) {
      const { text, image } = await generateXal();
      await message.channel.send({ files: [image], content: text || undefined });
      return;
    }

    const response = await chat(message.content);
    await message.channel.send(response);
  } catch (err) {
    console.error('Error handling message:', err);
    await message.react('😵‍💫');
  }
});
