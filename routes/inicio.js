const express = require('express');
const router = express.Router();

const inicio = (req,res) => {
  res.send("Bienvenido a AcademiBot.");
}
router.get('/', inicio);
module.exports = router;