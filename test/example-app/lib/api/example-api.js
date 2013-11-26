var app = module.exports = require('../../../../')();

app.get('/api/test', function(req, res, next) {
  res.send(200, {msg: "It worked"});
});
