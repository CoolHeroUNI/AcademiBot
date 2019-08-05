const express = require('express');
const router = express.Router();
const AcademiBot = require('../src/AcademiBot');

router.get('/', (req, res) => {
  /*
    peticicion esta referido al tipo de archivo que se busca servir, mientras que ubicacion
    puede tomar dos posibles estados: "local" o "S3", dependiendo de esto se puede servir archivos distintos
   */
  const peticion = req.query.peticion;
  const ubicacion = req.query.ubicacion;

  if (!peticion || !ubicacion) {
    return res.render('adminMuestra', {});
  } else if (peticion === "facultades") {
    if (ubicacion === "local") {
      res.json(AcademiBot.UNI.getFacultadesObject());
    } else if (ubicacion === "S3") {
      AcademiBot.leeFacultades()
        .then(facultades => res.json(facultades))
        .catch(e => res.render('error', e));
    }
  } else if (peticion === "usuarios") {
    if (ubicacion === "local") {
      res.json(AcademiBot.UNI.getUsuarios().map(usuario => usuario.toJSON()));
    } else if (ubicacion === "S3") {
      AcademiBot.leeUsuarios()
        .then(usuarios => res.json(usuarios))
        .catch(e => res.render('error', e));
    }
  } else if (peticion === "archivador") {
    if (ubicacion === "local") {
      res.json(AcademiBot.archivos.toJSON());
    } else if (ubicacion === "S3") {
      AcademiBot.leeArchivador()
        .then(archivos => res.json(archivos))
        .catch(e => res.render('error', e));
    }
  }

});

module.exports = router;