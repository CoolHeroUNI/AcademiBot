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
    const archivo = AcademiBot.obtieneArchivoDeEnvios('image');
    console.log(archivo.url);
    res.render('clasificacion', {facultades: JSON.stringify(facultades), Material: archivo.url, Ruta: archivo.ruta});
  })
});

router.post('/', middleware.activeSession, (req, res) => {
  console.log(req.body);
});
module.exports = router;