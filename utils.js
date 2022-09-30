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

const getCountdownMsg = () => {
  const now = dayjs().tz(tz);
  const dragonflightRelease = dayjs().tz(tz).month(10).date(28).hour(15);
  const daysToRelease = dragonflightRelease.diff(now, 'day');

  if (daysToRelease > 5) {
    return `:dragon:  **${daysToRelease} days to Dragonflight!**  :dragon:`;
  }

  const hoursToRelease = dragonflightRelease.diff(now, 'hour');
  return `:dragon:  **${hoursToRelease} hours to Dragonflight!**  :dragon:`;
}

module.exports = {
  getBreakMsg, getStartMsg,
  getTimeToBreak,
  getTimeToStart,
  getRandomBreakReminder: () => getRandomReminder(breakReminders),
  getRandomStartReminder: () => getRandomReminder(startReminders),
  getCountdownMsg,
};
