const express = require('express');
const router = express.Router();
const request = require('request');
const middleware = require('../src/middleware');

router.get('/', middleware.activeSession, (req, res) => {
  request(process.env.URL + "webhook/muestra/facultades/"+process.env.PROCESS_KEY, (err, response, body) => {
    const raw = JSON.parse(body);
    const facultades = raw.map(facu => {
      return {
        id: facu.id,
        directorio: facu.directorio
      };
    });

    res.render('collapsible', {facultades: JSON.stringify(facultades), Material:""});
  })
});

module.exports = router;