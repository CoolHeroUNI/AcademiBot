const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const logged = req.session.logged;
  const action = req.query.action;
  if (action === "guarda") {
    return res.sendStatus(200);
  } else if (action === "actualiza") {
    return res.sendStatus(200);
  } else if (action === "cierra") {
    res.sendStatus(200);
    return setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else if (action === 'zip') {
    return res.sendStatus(200);
  } else {
    return res.render('adminHosting', {logged, titulo:"Hosting"});
  }
});


module.exports = router;