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
  const autenticado = req.query.clave === process.env.PROCESS_KEY;
  if (peticion === "facultades") {
    if (ubicacion === "local") {
      res.json(AcademiBot.UNI.getFacultadesObject());
    } else if (ubicacion === "S3" && autenticado) {
      AcademiBot.leeFacultades()
        .then(facultades => res.json(facultades))
        .catch(e => res.render('error', e));
    }
  }
  if (peticion === "usuarios") {
    if (ubicacion === "local") {
      res.json(AcademiBot.UNI.getUsuarios().map(usuario => usuario.toJSON()));
    } else if (ubicacion === "S3" && autenticado) {
      AcademiBot.leeUsuarios()
        .then(usuarios => res.json(usuarios))
        .catch(e => res.render('error', e));
    }
  }
  if (peticion === "archivador") {
    if (ubicacion === "local") {
      res.json(AcademiBot.archivos.toJSON());
    } else if (ubicacion === "S3" && autenticado) {
      AcademiBot.leeArchivador()
        .then(archivos => res.json(archivos))
        .catch(e => res.render('error', e));
    }
  }
  res.sendStatus(404);
});

const muestra = async (req, res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;
  if (intentoClave === claveSecreta) {
    const peticion = req.params.peticion;
    if (!peticion) res.send("Especifica un objeto a mostrar");
    try {
      if (peticion === "facultades") {
        const facultades = await AcademiBot.leeFacultades();
        res.json(facultades);
      }
      if (peticion === "usuarios") {
        const usuarios = await AcademiBot.leeUsuarios();
        res.json(usuarios);
      }
      if (peticion === "archivador") {
        const archivador = await AcademiBot.leeArchivador();
        res.json(archivador);
      }
    } catch (error) {
      res.send(error);
    }
  } else {
    res.send("Clave incorrecta.")
  }
};

router.get('/:clave/:peticion', muestra);
module.exports = router;