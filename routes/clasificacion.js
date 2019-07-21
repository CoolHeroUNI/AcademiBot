const express = require('express');
const router = express.Router();
const request = require('request');
const middleware = require('../src/middleware');

router.get('/', middleware.activeSession, (req, res) => {
  request(process.env.URL + "webhook/muestra/facultades/"+process.env.PROCESS_KEY, (err, response, body) => {
    const facultades = JSON.parse(body);
    res.render('clasificacion', {directorio: JSON.stringify(facultades[0].directorio)});
  })
});

module.exports = router;