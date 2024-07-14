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

const getTimeToBreak = () => {
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

const getTimeToStart = () => {
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

export const getExpansionCountdownMsg = (name, emoji ) => {
  const now = dayjs().tz(tz);
  const releaseTime = dayjs().tz(tz).month(7).date(22).hour(15);
  const daysToRelease = releaseTime.diff(now, 'day');

  if (daysToRelease > 5) {
    return `${emoji}  **${daysToRelease} days to ${name}!**  ${emoji}`;
  }

  const hoursToRelease = releaseTime.diff(now, 'hour');

  if (hoursToRelease > 0) {
    return `${emoji}  **${hoursToRelease} hours to The War Within!**  ${emoji}`;
  }

  const minutesToRelease = releaseTime.diff(now, 'minute');

  if (minutesToRelease > 0) {
    return `${emoji}  **${minutesToRelease} minutes to The War Within!**  ${emoji}`;
  }

  return null;
}

export const getRaidCountdownMsg = () => {
  const now = dayjs().tz(tz);
  const raidRelease = dayjs().tz(tz).month(8).date(10).hour(18);
  const daysToRelease = raidRelease.diff(now, 'day');

  if (daysToRelease > 5) {
    return `:fist:  **${daysToRelease} days to Nerub-ar Palace!**  :fist:`;
  }

  const hoursToRelease = raidRelease.diff(now, 'hour');

  if (hoursToRelease > 0) {
    return `:fist:  **${hoursToRelease} hours to Nerub-ar Palace!**  :fist:`;
  }

  return null;
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
