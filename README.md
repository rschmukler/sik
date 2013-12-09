sik
===

Opinionated project structuring for the MEAN stack. Handy generators available
with [sik-tools](http://github.com/rschmukler/sik-tools).


## What is the Project Structure?

```
 - appName.js
 - component.json
 - lib/
     - apis/
     - components/
     - pages/
     - models/
 - config/
 - test/
     - apis/
     - components/
     - pages/
     - models/
```

### Project Layout Definitions

##### appName.js

The root application file. Exports an angular application which will load the
project structure / auto-mount the appropriate files.

Example: `appName.js`

```js
var sik = require('sik');

var app = module.exports = sik({
  root: __dirname
});
```

##### lib/apis/

Express-based applications that are mounted by a master express-server
(`appName.js`). Shortcut to instantiate: `var app = sik()` or `var app = sik.app()`.

Example: `lib/api/hello-world.js`

```js
var app = module.exports = require('sik')();

app.get('/api/hello-world', function(req, res, next) {
  res.send(200, {msg: "Hello world!"});
});
```

##### lib/components/

Packaged components for use on the front-end. Currently, these are packaged with
[component](http://github.com/component/component), but this may change soon.
The components define the following:

- `component.json` - *required* - Manifest file for the component.
- `component-name.js` - *optional* - Javascript related to the component. Can
  also require other js. These are compiled and passed into `public/app.js`
- `component-name.styl` - *optional* - Required styl definitions. These are
  compiled and passed into `public/app.css`
- `template.jade` - *optional* - Jade file for any templates/partials that may
  be necessary to render the component. These are compiled and served under
  `public/component-name/template.html`.
