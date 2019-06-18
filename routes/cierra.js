const express = require('express');
const router = express.Router();
const cierra = (req, res) => {
  const intentoClave = req.params.clave;
  const claveSecreta = process.env.PROCESS_KEY;
  if (intentoClave === claveSecreta) {
    res.send("Abortando proceso...");
    process.exit(0);
  } else {
    res.send("Clave incorrecta.")
  }
}
router.get('/:clave', cierra);
module.exports = router;