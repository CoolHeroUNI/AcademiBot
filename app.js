'use strict';
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const createError = require('http-errors');
const cors = require('cors');
const app = express();
const routes = require('./routes');

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
  name: process.env.COOKIE_NAME,
  secret: process.env.COOKIE_SECRET,
  resave: true,
  saveUninitialized: true,
  rolling: true,
  cookie: {
    maxAge: 1000*60*30
  }
}));

for (let router of routes) {
  const routeName = router.routeName;
  app.use(routeName, router);
}
app.use('/public', express.static(path.join(__dirname, 'public')));
app.use('/favicon.ico', express.static(path.join(__dirname, 'public/images/favicon.ico')));

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;