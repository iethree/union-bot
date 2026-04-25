import 'dotenv/config';
import dayjs from 'dayjs';
import OpenAI from 'openai';
import config from './config.json' with { type: "json" };
import { generateImage } from './image-gen.js';
import places from "./places.json" with { type: "json" };
import { xalatathBio } from './context.js';
import { getTimeToStartText } from './utils.js';
const { SYSTEM_MESSAGE, RAIDER_ID, GUILD_NAME, tz } = config;
import fs from 'fs';

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const chat = async (msg) => {
  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    messages: [
      { role: 'system', content: SYSTEM_MESSAGE },
      { role: 'user', content: msg },
    ]
  });
  return res.choices[0].message.content;
}

export async function breakMessage() {
  return chat('Please respond with a very short message telling raiders that it is time for a 5 minute raid break.')
}

export async function raidStartMessage() {
  // const res = await chat('Please respond with a very short message telling raiders that raid will start in 20 minutes.')

  const raidRelease = dayjs().tz(tz)
    .month(2).date(17).hour(18).year(2026);

  const timeToRaidStart = getTimeToStartText(raidRelease);

  const imagePrompt = `create a silly meme for a world of warcraft guild named ${GUILD_NAME}, reminding everyone that raid starts in ${timeToRaidStart}. do not mention specific raiders in the image`;
  const res = await generateImage(imagePrompt);
  console.log(res);
  return res;
}

export async function generateXal() {
  const place = places[Math.floor(Math.random() * places.length)];
  const placeName = place.name;
  const prompt = `create a funny cartoon image that places the pictured character, Xalatath, in ${placeName} with clothing appropriate to the location. her bare feet should always be visible. xalatath should have a speech bubble saying something funny, but consistent with her character and appropriate to the location. the text response should simply be captioned with "Xalatath in ${placeName}" without any other commentary. Xalatath's backstory is: ${xalatathBio}`;

  const res = await generateImage(prompt, './xalatath.jpg');
  console.log(res);
  return res;
}

export async function roll() {
  return chat(`Pretend that you are carefully and sincerely calculating the optimal gear allocations for the raid, and explain your logic, but always award the gear to <@${RAIDER_ID}>`)
}

export async function unionRule() {
  const res = await chat('Respond with a fun rule for the guild raid team. Do not create rules involving dancing, or include a rule number"');
  const number = Math.floor(Math.random() * 1000);
  const hasRulePrefix = res.text.match(/Rule:/i);
  const rulePrefix = `**Union Rule #${number}:**`;
  return hasRulePrefix
    ? res.text.replace(/Rule(\d)*(:)*/i, rulePrefix)
    : `${rulePrefix} ${res.text}`;
}

const generate8D = () => {
  return `8${Array.from({ length: Math.ceil(Math.random() * 10) }, () => '=').join('')}D`;
}

const file = './ids.txt';

export async function handleLengthCommand(message) {
  const idFileExists = fs.existsSync(file);
  if (!idFileExists) {
    fs.writeFileSync(file, '', 'utf-8');
  }
  const idStore = fs.readFileSync(file, 'utf-8').split('\n').filter(Boolean);
  const senderId = message.author.id;
  if (!idStore.includes(senderId)) {
    idStore.push(senderId);
    fs.writeFileSync(file, idStore.join('\n'), 'utf-8');
  }

  const rows = await Promise.all(idStore.map(async (id) => {
    let name = id;
    try {
      const member = await message.guild?.members.fetch(id);
      name = member?.displayName ?? name;
    } catch {
      const user = await message.client.users.fetch(id).catch(() => null);
      name = user?.username ?? name;
    }
    return { name, graphic: generate8D() };
  }));

  const nameWidth = Math.max('Name'.length, ...rows.map(r => r.name.length));
  const graphicWidth = Math.max('Length'.length, ...rows.map(r => r.graphic.length));

  const header = `${'Name'.padEnd(nameWidth)}  ${'Length'.padEnd(graphicWidth)}`;
  const sep = `${'-'.repeat(nameWidth)}  ${'-'.repeat(graphicWidth)}`;
  const body = rows.map(r =>
    `${r.name.padEnd(nameWidth)}  ${r.graphic.padEnd(graphicWidth)}`
  ).join('\n');

  await message.channel.send('```\n' + [header, sep, body].join('\n') + '\n```');
}
