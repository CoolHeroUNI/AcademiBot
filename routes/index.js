const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const tab = req.query.tab;
  const logged = req.session.logged;

  if (tab === "amazon") {
    res.render('indexAmazon', {logged, titulo:"Amazon"});
  } else if (tab === "facebook") {
    res.render('indexFacebook', {logged, titulo:"Facebook"});
  } else if (tab === "hosting") {
    res.render('indexHosting', {logged, titulo:"Hosting"});
  } else if (tab === "historia") {
    res.render('indexHistoria', {logged, titulo:"Historia"});
  } else {
    res.render('index', {logged});
  }
});

module.exports = router;