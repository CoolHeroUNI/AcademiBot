const { randomPing, wait, moduleLoad, averageTime } = require('./polyfills');
const { ensureAuth, ensureNoAuth } = require('./middlewares');
const compare = require('./SorensenDice');
const creaTicket = require('./creadorTicket');

module.exports = {
  randomPing,
  ensureAuth,
  ensureNoAuth,
  wait,
  moduleLoad,
  averageTime,
  creaTicket,
  compare
};