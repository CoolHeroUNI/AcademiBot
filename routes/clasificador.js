const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');
const AcademiBot = require('../src/AcademiBot');

router.get('/', middleware.ensureAuth, (req, res) => {
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

router.post('/', middleware.ensureAuth, (req, res) => {
  const action = req.query.action;
  console.log(req.body);
  if (!action) {
    res.send(404);
  }

  if (action === 'move') {
    const origen = req.body.ruta;
    const curso = req.body.curso_opcional ? req.body.curso_opcional : req.body.curso;
    const carpeta = req.body.carpeta_opcional ? req.body.carpeta_opcional : req.body.carpeta;
    const archivo = `${req.body.archivo}-${req.body.pagina}${req.body.extension}`;
    const destino = `${req.body.facultad}/${curso}/${carpeta}/${archivo}`;
    AcademiBot.mueveArchivo(origen, destino)
      .catch(e => console.log(e));
  }

  if (action === 'delete') {
    AcademiBot.borraArchivo(req.body.ruta)
      .catch(e => console.log(e));
  }
  AcademiBot.submissions.eliminaArchivo(req.body.ruta);
  res.redirect('/admin/clasificacion');
});
module.exports = router;