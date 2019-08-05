const express = require('express');
const router = express.Router();
const clasificacionRoute = require('./clasificacion');
router.use('/clasificacion', clasificacionRoute);






module.exports = router;