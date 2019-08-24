const express = require('express');
const router = express.Router();
const AcademiBot = require('../src/AcademiBot');

router.get('/', (req, res) => {
  res.render('adminFacebook', {})
});

router.post('/', (req, res) => {
  const action = req.query.action;
  if (action === 'global') {
    const texto = req.body.texto;
    AcademiBot.enviaMensajeGlobal(texto)
      .then(() => res.sendStatus(200))
      .catch(e => {
        console.log(e);
        res.render('error', e);
      });
    res.sendStatus(200);
  } else {
    res.sendStatus(404);
  }
});

module.exports = router;