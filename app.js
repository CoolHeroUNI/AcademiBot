'use strict';
// Librerias y polyfills
require('./src/metodos');
const randomPing = require('./src/randomPing');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const createError = require('http-errors');
// creacion de la aplicacion
const app = express();
// Definir puerto y
app.set('port', (process.env.PORT || 5000));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  name: "AcademiBot",
  secret: process.env.COOKIE_SECRET,
  resave: true,
  saveUninitialized: true,
  cookie: {
    maxAge: 1000*60*5
  }
}));
// Importar rutas
const indexRoute = require('./routes/index');
const webhookRoute = require('./routes/webhook');
const cierraRoute = require('./routes/cierra');
const muestraRoute = require('./routes/muestra');
const loginRoute = require('./routes/login');
const clasificacionRoute = require('./routes/clasificacion');

app.use('/', indexRoute);
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/images/favicon.ico')));

app.use('/webhook', webhookRoute);
app.use('/login', loginRoute);
app.use('/clasificacion', clasificacionRoute);
app.use('/cierra', cierraRoute);
app.use('/muestra', muestraRoute);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(app.get('port'), () => {
  console.log("running");
  randomPing(process.env.URL);
});