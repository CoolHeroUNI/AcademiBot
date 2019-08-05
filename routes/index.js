const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const tab = req.query.tab;
  const logged = req.session.logged;

  if (tab === "amazon") {
    res.render('amazon', {logged});
  } else if (tab === "facebook") {
    res.render('facebook', {logged});
  } else if (tab === "hosting") {
    res.render('hosting', {logged});
  } else if (tab === "historia") {
    res.render('historia', {logged});
  } else {
    res.render('index', {logged});
  }
});

module.exports = router;