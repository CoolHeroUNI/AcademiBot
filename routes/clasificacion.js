const express = require('express');
const router = express.Router();
const request = require('request');
const middleware = require('../src/middleware');
const AcademiBot = require('../src/AcademiBot');

router.get('/', middleware.activeSession, (req, res) => {
  const facultades = AcademiBot.UNI.getFacultadesObject().map(facu => {
    return {
      id: facu.id,
      directorio: facu.directorio
    };
  });
  AcademiBot.obtieneArchivoDeEnvios('image')
    .then(archivo => {
      res.render('clasificacion', {
        facultades : JSON.stringify(facultades),
        Material : "data:image;base64," + archivo.body.toString('base64'),
        Ruta : archivo.ruta
      });
    })
    .catch(e => console.log(e));
});

router.post('/', middleware.activeSession, (req, res) => {
  const action = req.query.action;
  if (!action) {
    res.send(404);
  }

  if (action === 'move') {
    console.log(req.body);
  }

  if (action === 'delete') {
    console.log(req.body);
  }
  res.send("Fin :3");
});
module.exports = router;