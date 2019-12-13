const express = require('express');
const router = express.Router({ mergeParams: true });

router.get('/', (req, res, next) => {
  res.send('Page in progress.');
});
router.all('/', (req, res, next) => {
  res.sendStatus(405);
});
router.routeName = '/';

module.exports = router;