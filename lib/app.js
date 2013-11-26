var express = require('express'),
    fs = require('fs'),
    RedisStore = require('connect-redis')(express);

module.exports = function(config) {
  var app = express();
  if(!config) return app;

  // Validate Config
  if(!config.root) throw new Error("No project root specified in config.");

  if(process.env.NODE_ENV == 'production') {
    if(!config.cookieSecret) throw new Error("Cookie secret not specified. Default not allowed in production");
    if(!config.sessionSecret) throw new Error("Session secret not specified. Default not allowed in production");
  }

  config.paths = config.paths || {};

  // Configure Some Basic Middlewares
  app.use(express.methodOverride());
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.cookieParser(config.cookieSecret || 'sik-default'));
  app.use(express.session({ store: new RedisStore(), secret: config.sessionSecret || 'sik-default'}));

  app.configure('development', function() {
    var publicPath = config.paths.public || (config.root + '/public');
    if(fs.existsSync(publicPath)) {
      app.use('/assets', express.static(publicPath));
      if(fs.existsSync(publicPath + '/favicon.ico')) {
        app.use(express.favicon(publicPath + '/favicon.ico'));
      }
    }
  });

  // Read Sik Project Structure
  loadApis(config.paths.api || ''+ config.root + '/lib/api');


  return app;

  function loadApis(path) {
    var apiPaths = loadDirectoryContents('API', path, {onlyFiles: true});
    apiPaths.forEach(function(api) {
      app.use(require(api));
    });
  }

  function loadDirectoryContents(name, dir, options) {
    var paths;
    options = options || {};

    try {
      paths = fs.readdirSync(dir).map(function(s) { return dir + '/' + s;});
    } catch(e) {
      throw new Error(name + " Directory (" + dir + ") does not exist.");
    }

    return paths.filter(function(p) {
      if(options.onlyFiles || options.onlyDirs) {
        var stat = fs.statSync(p);
        if(options.onlyFiles)
          return stat.isFile();
        else if(options.onlyDirs)
          return stat.isDirectory();
      }
    });
  }
};
