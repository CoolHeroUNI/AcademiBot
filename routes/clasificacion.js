const express = require('express');
const router = express.Router();
const request = require('request');
const middleware = require('../src/middleware');
const AcademiBot = require('../src/AcademiBot');

router.get('/', middleware.activeSession, (req, res) => {
  request(process.env.URL + "webhook/muestra/facultades/"+process.env.PROCESS_KEY, (err, response, body) => {
    const raw = JSON.parse(body);
    const facultades = raw.map(facu => {
      return {
        id: facu.id,
        directorio: facu.directorio
      };
    });
    AcademiBot.obtieneArchivoDeEnvios('image')
      .then(archivo => {
        res.render('clasificacion', {facultades: JSON.stringify(facultades), Material: "data:image;base64," + archivo.body.toString('base64'), Ruta: archivo.ruta});
      })
      .catch(e => console.log(e));
  })
});

router.post('/', middleware.activeSession, (req, res) => {
  console.log(req.body);
});
module.exports = router;