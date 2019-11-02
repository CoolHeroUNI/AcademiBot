const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  /*
    peticicion esta referido al tipo de archivo que se busca servir, mientras que ubicacion
    puede tomar dos posibles estados: "local" o "S3", dependiendo de esto se puede servir archivos distintos
   */
  const peticion = req.query.peticion;
  const ubicacion = req.query.ubicacion;
  const logged =  req.session.logged;

  if (!peticion || !ubicacion) {
    return res.render('adminMuestra', {logged, titulo:"Archivos"});
  } else if (peticion === "facultades") {
    if (ubicacion === "local") {
      res.json([]);
    } else if (ubicacion === "S3") {
      res.json([]);
    }
  } else if (peticion === "usuarios") {
    if (ubicacion === "local") {
      res.json([]);
    } else if (ubicacion === "S3") {
      res.json([]);
    }
  } else if (peticion === "archivador") {
    if (ubicacion === "local") {
      res.json([]);
    } else if (ubicacion === "S3") {
      res.json([]);
    }
  }
});

module.exports = router;