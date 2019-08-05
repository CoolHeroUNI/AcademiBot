const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');

router.get('/', middleware.ensureNoAuth, (req, res) => {
  req.session.returnTo = req.query.redirect ? req.query.redirect : req.header('Referer');
  res.render('login', {});
});
router.post('/', middleware.ensureNoAuth, (req, res) => {
  const pass = req.body.password;
  if (!req.session.logged && pass === process.env.PROCESS_KEY) {
    req.session.logged = true;
    console.log("logged in");
    res.redirect(req.session.returnTo || '/');
    delete res.session.returnTo;
  }  else {
    console.log("incorrect pass");
    res.redirect("/login");
  }
});
module.exports = router;