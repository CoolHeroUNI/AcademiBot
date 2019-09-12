const express = require('express');
const router = express.Router();
const AcademiBot = require('../src/AcademiBot');

router.get('/', (req, res) => {
  const logged = req.session.logged;
  const action = req.query.action;
  if (action === "guarda") {
    AcademiBot.guarda();
    res.sendStatus(200);
  } else if (action === "actualiza") {
    AcademiBot.actualizaDirectorios()
      .then(() => res.sendStatus(200))
      .catch(e => res.sendStatus(500));
  } else if (action === "cierra") {
    res.sendStatus(200);
    setTimeout(() => {
      process.exit(0);
    }, 1000);
  } else if (action === 'zip') {
    res.sendStatus(200);
    AcademiBot.compressFiles()
        .then(() => console.log("Compresion exitosa!"))
        .catch(e => console.log(e))
  } else {
    res.render('adminHosting', {logged, titulo:"Hosting"});
  }

});


module.exports = router;