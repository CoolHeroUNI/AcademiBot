const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  if (!req.session.logged) {
    res.render('index', {});
  } else {
    req.session.touch();
    res.render('hub', {});
  }
});

module.exports = router;