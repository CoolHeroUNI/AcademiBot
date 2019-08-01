const express = require('express');
const router = express.Router();
const AcademiBot = require('../scr/AcademiBot');

const reincia = async (req, res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;

  if (intentoClave === claveSecreta) {
    try {
      AcademiBot.actualizaDirectorios()
        .catch(e => console.log(e));
    } catch (error) {
      res.send(error);
    }
    res.send("Actualizacion exitosa.")
  } else {
    res.send("Clave incorrecta.")
  }
};
router.get("/:clave", reincia);

module.exports = router;