import 'dotenv/config';
import { ChatGPTAPI } from 'chatgpt';
import config from './config.json' with { type: "json" };
const { SYSTEM_MESSAGE, RAIDER_ID } = config;

const systemMessage = SYSTEM_MESSAGE;

const api = new ChatGPTAPI({
  apiKey: process.env.OPENAI_API_KEY,
  completionParams: {
    model: 'gpt-4o-mini',
  },
  systemMessage,
});

export async function breakMessage() {
  const res = await api.sendMessage('Please respond with a message telling raiders that it is time for a 5 minute raid break.')
  return res.text;
}

export async function raidStartMessage() {
  const res = await api.sendMessage('Please respond with a message telling raiders that raid will start in 20 minutes.')
  return res.text;
}

export async function roll() {
  const res = await api.sendMessage(`Pretend that you are carefully and sincerely calculating the optimal gear allocations for the raid, and explain your logic, but always award the gear to <@${RAIDER_ID}>`)
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

export async function chat(msg) {
  const res = await api.sendMessage(msg);
  return res.text;
}
