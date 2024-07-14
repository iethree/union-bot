const breakReminders = require('./breakReminders.json');
const startReminders = require('./startReminders.json');
const { breakTimes, startTimes, tz } = require('./config.json');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const getBreakMsg = () => {
  const minsToBreak = getTimeToBreak();
  const reminder = getRandomReminder(breakReminders);

  return `${reminder} \n(${minsToBreak.toLocaleString()} minutes to break)`;
};

const getStartMsg = () => {
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

const getExpansionCountdownMsg = (name, emoji ) => {
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

const getRaidCountdownMsg = () => {
  const now = dayjs().tz(tz);
  const raidRelease = dayjs().tz(tz).month(11).date(13).hour(18);
  const daysToRelease = raidRelease.diff(now, 'day');

  if (daysToRelease > 5) {
    return `:fist:  **${daysToRelease} days to Vault of the Incarnates!**  :fist:`;
  }

  const hoursToRelease = raidRelease.diff(now, 'hour');

  if (hoursToRelease > 0) {
    return `:fist:  **${hoursToRelease} hours to Vault of the Incarnates!**  :fist:`;
  }

  return null;
}

module.exports = {
  getBreakMsg, getStartMsg,
  getTimeToBreak,
  getTimeToStart,
  getRandomBreakReminder: () => getRandomReminder(breakReminders),
  getRandomStartReminder: () => getRandomReminder(startReminders),
  getExpansionCountdownMsg,
  getRaidCountdownMsg,
};
