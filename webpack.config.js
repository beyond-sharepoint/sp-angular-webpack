'use strict';

//Determine the app webpack configuration to use based on environment.
const ENV = process.env.npm_lifecycle_event;

let appConfig;

if (ENV === 'test' || ENV === 'test-watch') {
  appConfig = require('./webpack-app-test.config.js');
} else if (ENV === 'build') {
  appConfig = require('./webpack-app-prod.config.js');
} else {
  appConfig = require('./webpack-app-dev.config.js');
}

module.exports = appConfig;