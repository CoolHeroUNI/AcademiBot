const express = require('express');
const router = express.Router();
const middleware = require('../public/javascripts/middleware');

router.get('/', middleware.unactiveSession, (req, res) => {
  res.render('login', {});
});
router.post('/', (req, res) => {
  const pass = req.body.password;
  if (!req.session.logged && pass == process.env.PROCESS_KEY) {
    req.session.logged = true;
    console.log("logged in");
    res.redirect("/clasificacion")
  }
  else {
    res.send("INCORRECTO");
  }
});
module.exports = router;