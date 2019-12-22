const { randomPing, wait, moduleLoad, averageTime } = require('./polyfills');
const { ensureAuth, ensureNoAuth } = require('./middlewares');

module.exports = {
  randomPing,
  ensureAuth,
  ensureNoAuth,
  wait,
  moduleLoad,
  averageTime
};