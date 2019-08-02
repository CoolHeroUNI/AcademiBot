const express = require('express');
const router = express.Router();
const AcademiBot = require('../src/AcademiBot');


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