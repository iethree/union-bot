const reminders = require('./reminders.json');
const { breakTimes, tz } = require('./config.json');

const dayjs = require('dayjs');
const utc = require('dayjs/plugin/utc')
const timezone = require('dayjs/plugin/timezone');
dayjs.extend(utc);
dayjs.extend(timezone);

const getMsg = () => {
  const minsToBreak = getTimeToBreak();
  const reminder = getRandomReminder();

  return `${reminder} (${minsToBreak.toLocaleString()} minutes to break)`;
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

const getRandomReminder = () => {
  return reminders[Math.floor(Math.random() * reminders.length)];
};

module.exports = { getMsg, getTimeToBreak, getRandomReminder };
