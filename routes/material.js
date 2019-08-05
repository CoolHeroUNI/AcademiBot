const express = require('express');
const router = express.Router();
const middleware = require('../src/middleware');
const AcademiBot = require('../src/AcademiBot');


router.get('/', (req, res) => {
  req.get('host');
});