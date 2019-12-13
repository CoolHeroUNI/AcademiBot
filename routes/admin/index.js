const express = require('express');
const { ensureAuth, moduleLoad } = require('../../lib');
const router = express.Router({ mergeParams: true });
router.use('/', ensureAuth);
module.exports = moduleLoad(__dirname);