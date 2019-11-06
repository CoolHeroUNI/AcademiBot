const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');

router.get('/', middleware.ensureNoAuth, (req, res) => {
  if (req.query.redirect) {
    req.session.returnTo = encodeURIComponent(req.query.redirect);
  } else if (!req.session.returnTo && req.header('Referer')) {
    req.session.returnTo = encodeURIComponent(req.header('Referer'));
  }
  res.render('login', {});
});
router.post('/', middleware.ensureNoAuth, (req, res) => {
  const pass = req.body.password;
  if (!req.session.logged && pass === process.env.PROCESS_KEY) {
    req.session.logged = true;
    console.log("logged in");
    if (req.session.returnTo) req.session.returnTo = decodeURIComponent(req.session.returnTo);
    res.redirect(req.session.returnTo || '/');
    delete req.session.returnTo;
  } else {
    console.log("incorrect pass");
    res.redirect("/login");
  }
});
module.exports = router;