const express = require('express');
const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  const tab = req.query.tab;
  if (tab === "amazon") {
    res.render('amazon', {});
  } else if (tab === "facebook") {
    res.render('facebook', {});
  } else if (tab === "hosting") {
    res.render('hosting', {});
  } else if (tab === "historia") {
    res.render('historia', {});
  } else {
    res.render('index', {});
  }
});

module.exports = router;