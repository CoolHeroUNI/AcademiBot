const express = require('express');
const router = express.Router();
const AcademiBot = require('../model/AcademiBot');


const muestra = async (req, res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;
  if (intentoClave === claveSecreta) {
    const peticion = req.params.peticion;
    if (!peticion) res.send("Especifica un objeto a mostrar");
    const amazondata = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
      region: "us-east-1", 
      nombre: process.env.S3_BUCKET_NAME
    };
    const academibot = new AcademiBot(amazondata, "", "DONT USE");
    try {
      if (peticion === "facultades") {
        const facultades = await academibot.leeFacultades();
        res.json(facultades);
      }
      if (peticion === "usuarios") {
        const usuarios = await academibot.leeUsuarios();
        res.json(usuarios);
      }
      if (peticion === "archivador") {
        const archivador = await academibot.leeArchivador();
        res.json(archivador);
      }
    } catch (error) {
      res.send(error);
    }
  } else {
    res.send("Clave incorrecta.")
  }
}

router.get('/:clave/:peticion', muestra);
module.exports = router;