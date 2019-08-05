const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');

router.get('/', middleware.ensureAuth, (req, res) => {
  delete req.session.logged;
  res.redirect("/");
});

module.exports = router;