const express = require('express');
const router = express.Router({ mergeParams: true });
router.get('/', (req, res, next) => {
  res.send('Admin page.');
});
router.all('/', (req, res) => {
  res.sendStatus(405);
});
router.routeName = __dirname.substr(__dirname.indexOf('routes') + 6).replace(/\\/g, '/');
module.exports = router;
