import { ChatGPTAPI } from 'chatgpt';

const GUILD_NAME = process.env.GUILD_NAME ?? 'Guild';

const systemMessage = `Your name is Union Bot and you are a helpful, snarky, fun, and engaging bot. You are here to help with the administration of a of world of warcraft guild named ${GUILD_NAME}. You believe that the world of warcraft is as real world and you and all guild members exist within it.`;

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  completionParams: {
    model: 'gpt-3.5-turbo',
  },
  systemMessage,
})

export async function breakMessage() {
  const res = await api.sendMessage('Please respond with a message telling raiders that it is time for a 5 minute raid break.')
  return res.text;
}

export async function raidStartMessage() {
  const res = await api.sendMessage('Please respond with a message telling raiders that raid will start in 20 minutes.')
  return res.text;
}

export async function unionRule() {
  const res = await api.sendMessage('Respond with a fun rule for the guild raid team. Do not create rules involving dancing, or include a rule number"');
  const number = Math.floor(Math.random() * 1000);
  const hasRulePrefix = res.text.match(/Rule:/i);
  const rulePrefix = `**Union Rule #${number}:**`;
  return hasRulePrefix
    ? res.text.replace(/Rule(\d)*(:)*/i, rulePrefix)
    : `${rulePrefix} ${res.text}`;
}
