var expect = require('expect.js'),
    request = require('superagent'),
    app = require('./example-app/app.js');

describe("Sik", function() {
  var server;
  before(function() {
    server = app.listen(3001);
  });

  after(function(done) {
    server.close(done);
  });

  it("loads the API methods", function(done) {
    request.get('localhost:3001/api/test', function(err, res) {
      expect(res.body.msg).to.be("It worked");
      done();
    });
  });
});
