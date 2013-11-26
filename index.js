var sik = module.exports = function() {
  return sik.app();
};

sik.app = require('./lib/app.js');
sik.express = require('express');
