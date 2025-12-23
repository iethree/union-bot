import breakReminders from './breakReminders.json' with { type: "json" };
import startReminders from './startReminders.json' with { type: "json" };
import configFile  from './config.json' with { type: "json" };
const { breakTimes, startTimes, tz } = configFile;
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import timezone from 'dayjs/plugin/timezone.js';
dayjs.extend(utc);
dayjs.extend(timezone);

export const getBreakMsg = () => {
  const minsToBreak = getTimeToBreak();
  const reminder = getRandomReminder(breakReminders);

  return `${reminder} \n(${minsToBreak.toLocaleString()} minutes to break)`;
};

export const getStartMsg = () => {
  const minsttoStart = getTimeToStart();
  const reminder = getRandomReminder(startReminders);

  return `${reminder} \n(${minsttoStart.toLocaleString()} minutes to raid)`;
};

export const getTimeToBreak = () => {
  const now = dayjs().tz(tz);

  const minsToBreak = breakTimes.reduce((lowest, thisOne) => {
    const [h, m] = thisOne.time.split(':');

    const breakTime = dayjs().tz(tz).day(thisOne.day).hour(h).minute(m);
    const diff = breakTime.diff(now, 'minute') > 0
      ? breakTime.diff(now, 'minute')
      : breakTime.add(1, 'week').diff(now, 'minute');

    if (diff < lowest) return diff;

    return lowest;
  }, Infinity);

  return minsToBreak;
};

export const getTimeToStart = () => {
  const now = dayjs().tz(tz);

  const minsToStart = startTimes.reduce((lowest, thisOne) => {
    const [h, m] = thisOne.time.split(':');

    const startTime = dayjs().tz(tz).day(thisOne.day).hour(h).minute(m);
    const diff = startTime.diff(now, 'minute') > 0
      ? startTime.diff(now, 'minute')
      : startTime.add(1, 'week').diff(now, 'minute');

    if (diff < lowest) return diff;

    return lowest;
  }, Infinity);

  return minsToStart;
};

const getRandomReminder = (reminders) => {
  return reminders[Math.floor(Math.random() * reminders.length)];
};

export const getTimeToStartText = (eventTime) => {
  const now = dayjs().tz(tz);

  const diff = eventTime.diff(now, 'minute');

  if (diff < 120) {
    return `${diff} minutes`;
  }

  if (diff < 1600) {
    const hours = Math.round(diff / 60);
    return `${hours} hours`;
  }

  const days = Math.round(diff / 1440);
  return `${days} days`;
}

export const getCountdownMessage = ({ name, emoji, eventTime }) => {
  const timeToEvent = getTimeToStartText(eventTime);

  return `${emoji}  **${timeToEvent} to ${name}!**  ${emoji}`;
}

export const getExpansionCountdownMsg = (name, emoji ) => {
  const releaseTime = dayjs().tz(tz)
    .month(2).date(3).hour(15).year(2026);

  return getCountdownMessage({
    name,
    emoji,
    eventTime: releaseTime
  });
};

export const getRaidCountdownMsg = () => {
  const raidRelease = dayjs().tz(tz)
    .month(2).date(17).hour(18).year(2026);

  return getCountdownMessage({
    name: 'raid',
    emoji: ':fist:',
    eventTime: raidRelease
  });
}

// module.exports = {
//   getBreakMsg, getStartMsg,
//   getTimeToBreak,
//   getTimeToStart,
//   getRandomBreakReminder: () => getRandomReminder(breakReminders),
//   getRandomStartReminder: () => getRandomReminder(startReminders),
//   getExpansionCountdownMsg,
//   getRaidCountdownMsg,
// };
