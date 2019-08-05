const express = require('express');
const router = express.Router();
const clasificadorRoute = require('./clasificador');
router.use('/clasificador', clasificadorRoute);






module.exports = router;