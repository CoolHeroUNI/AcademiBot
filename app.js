'use strict';
// Librerias y polyfills
const {randomPing} = require('./libs/metodos');

const express = require('express')
const bodyParser = require('body-parser')
// creacion de la aplicacion
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
// Importar rutas
const inicio = require('./routes/inicio');
const webhookRoute = require('./routes/webhook');
//const reinicioRoute = require('./routes/reinicio');
const cierraRoute = require('./routes/cierra');
const muestraRoute = require('./routes/muestra');

app.use('/', inicio);
app.use('/webhook', webhookRoute);
//app.use('/reinicio', reinicioRoute);
app.use('/cierra', cierraRoute);
app.use('/muestra', muestraRoute);

// Definir puerto
app.set('port', (process.env.PORT || 5000));

app.listen(app.get('port'), () => {
  console.log("running");
  randomPing(process.env.URL);
});