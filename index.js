var sik = module.exports = function(options) {
  return sik.app(options);
};

sik.app = require('./lib/app.js');
sik.express = require('express');
sik.modella = require('modella');
