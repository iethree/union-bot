import {
  getTimeToBreak,
  getTimeToStart,
  getBreakMsg,
  getStartMsg,
  getExpansionCountdownMsg,
  getRaidCountdownMsg,
} from './utils.js';

// console.log(getStartMsg());
// console.log('\n');
// console.log(getBreakMsg());
// console.log('\n');
console.log(getExpansionCountdownMsg('Midnight', ':new_moon:'));
console.log('\n');
console.log(getRaidCountdownMsg());
