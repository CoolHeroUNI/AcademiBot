const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');

const clasificadorRoute = require('./adminClasificador');
const facebookRoute = require('./adminFacebook');
const muestraRoute = require('./adminMuestra');
const hostingRoute = require('./adminHosting');
const API = require('./API');


router.use(middleware.ensureAuth);
router.use('/clasificador', clasificadorRoute);
router.use('/facebook', facebookRoute);
router.use('/muestra', muestraRoute);
router.use('/hosting', hostingRoute);
router.use('/API', API);




module.exports = router;