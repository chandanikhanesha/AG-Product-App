// const path = require('path')
const cors = require('cors');
const express = require('express');
const compression = require('compression');

module.exports = function (app, passport) {
  // app.set('views', path.join(__dirname, '..', 'views'))
  // app.set('view engine', 'ejs')

  app.set('port', 3001);
  app.set('host', '0.0.0.0');

  app.disable('x-powered-by');

  app.use(cors());
  app.use(express.json({ limit: '10mb' }));

  app.use(compression());

  console.log('--------------------------');
  console.log('===> 😊  Starting Server . . .');
  console.log('===>  Environment: ' + process.env.NODE_ENV);

  app.use(passport.initialize());
};
