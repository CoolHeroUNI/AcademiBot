const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const autenticado = req.session.logged || req.query.clave === process.env.PROCESS_KEY;
  if (autenticado) {
    res.sendStatus(200);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else {
    res.sendStatus(403);
  }
});

module.exports = router;