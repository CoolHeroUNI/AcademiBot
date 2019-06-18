const express = require('express');
const router = express.Router();
const AcademiBot = require('../model/AcademiBot');

const reincia = async (req, res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;

  if (intentoClave === claveSecreta) {
    const amazondata = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID, 
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY, 
      region: "us-east-1", 
      nombre: process.env.S3_BUCKET_NAME
    };
    const academibot = new AcademiBot(amazondata, "", "DONT USE");
    try {
      const facultades = await academibot.leeFacultades();
      academibot.UNI.cargaFacultades(facultades);
      academibot.actualizaDirectorios()
    } catch (error) {
      res.send(error);
    }
    res.send("Actualizacion exitosa.")
  } else {
    res.send("Clave incorrecta.")
  }
}
router.get("/:clave", reincia);

module.exports = router;