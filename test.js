const {
  getRandomBreakReminder,
  getRandomStartReminder,
  getTimeToBreak,
  getTimeToStart,
  getBreakMsg,
  getStartMsg,
  getCountdownMsg,
} = require('./utils.js');

console.log(getStartMsg());
console.log('\n');
console.log(getBreakMsg());
console.log('\n');
console.log(getCountdownMsg());
