const express = require('express');
const router = express.Router();

const inicio = (req,res) => {
  console.log(req.get('host'), req.hostname);
  res.send("Bienvenido a AcademiBot.");
};
router.get('/', inicio);
module.exports = router;