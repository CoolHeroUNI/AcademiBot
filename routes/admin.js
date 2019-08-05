const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');

const clasificadorRoute = require('./adminClasificador');
const facebookRoute = require('./adminFacebook');
const muestraRoute = require('./adminMuestra');

router.use(middleware.ensureAuth);
router.use('/clasificador', clasificadorRoute);
router.use('/facebook', facebookRoute);
router.use('/muestra', muestraRoute);





module.exports = router;