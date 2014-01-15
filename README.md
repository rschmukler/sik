sik
===

Opinionated project structuring for the MEAN stack. Handy generators available
with [sik-tools](http://github.com/rschmukler/sik-tools).


## What is the Project Structure?

```
 - appName.js
 - component.json
 - config/
 - lib/
     - apis/
     - components/
     - pages/
     - express-pages/
     - models/
 - test/
     - test-helper.js
     - apis/
     - components/
     - factories/
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

##### config/

Config is used for storing credentials and configurations used by your
application. Some examples might be:

- Amazon EC2 Credentials (`config/aws.js`);
- Facebook API Credentials (`config/facebook.js`)
- Database credentials (`config/db.js`).



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

Example: `lib/components/some-component/`

```
  some-component/
    - component.json
    - some-component.js
    - some-component.styl
    - template.jade

```


The components define the following:

- `component.json` - *required* - Manifest file for the component.
- `component-name.js` - *optional* - Javascript related to the component. Can
  also require other js. These are compiled and passed into `public/app.js`
- `component-name.styl` - *optional* - Required styl definitions. These are
  compiled and passed into `public/app.css`
- `template.jade` - *optional* - Jade file for any templates/partials that may
  be necessary to render the component. These are compiled and served under
  `public/component-name/template.html`.

##### lib/express-pages/

Express pages are stand-alone express applications that get loaded as modules
into the main express application. They are like APIs, however can have
associated Jade, css, etc. They define their express application in `routes.js`.


Example: `lib/pages/example-page/site-wide`

```
lib/
  express-pages/
    site-wide/
      routes.js
      layout.jade
      layout.styl
```

`lib/pages/example-page/site-wide/routes.js
```
app.get('/*', function(req, res, next) {
  debug("Load angular template");
  res.render('layout.jade');
}
```

##### lib/pages/

Pages are very similar to components. They are collections of javascript,
templates, and styling. The difference is that they also have associated angular routes. 
They are high-level application destinations.

Example: `lib/pages/example-page`

```
lib/
  pages/
    example-page/
      - component.json
      - example-page.js
      - example-page.styl
      - template.jade
```

The structuring is very similar to a component. The difference is that
`example-page.js` defines a route/end point.

Example: `example-page/example-page.js`

```js
var ExamplePage = angular.module('myApp.example-page', []);

ExamplePage.config(['$routeProvider', function($routeProvider) {
  $routeProvider.when('/hello-world', {
    controller: 'ExamplePageController',
    templateUrl: '/assets-example-page/template.html'
  });
}]);

ExamplePage.controller('ExamplePageController', ['$scope', function($scope) {
  // Do something cool
}]);
```

##### lib/models/

Models represent application objects. They may be stored in the database, but
may also just be JS objects that help keep application logic (specifically for
the API). By default, sik includes [modella](http://github.com/modella/modella)
as its preferred model provider. You can access it through `sik.modella`.

Example: `lib/models/todo-model/index.js`

```js
var Todo = module.exports = require('sik').modella('Todo');

Todo.attr('description', { required: true })
    .attr('done', { type: 'boolean' })
    .attr('userId');
```


###### Presenters

Often it is necessary to mutate an object before sending it out through the API.
Examples include sanitizing it, or looking up relations. To do this, sik
encourages the use of presenter plugins for your models.

Example (continued from above): `lib/models/todo-model/index.js`

```js
Todo.use(require('./presenter.js'));
```

Example: `lib/models/todo-model/presenter.js`

```js
module.exports = function(Todo) {
  Todo.on('initialize', generatePresenter);

  function generatePresenter(todo) {
    todo.presenter = {
      smallApiSummary: function() {
        return { 
          description: todo.description(),
          done: todo.done()
        };
      },
      largeApiSummary: function(forUser) {
        var result = this.smallApiSummary();
        result.isOwner = todo.userId().toString() == forUser.primary().toString();
        return result;
      }
    };
  }
}
```

Example: `lib/api/todo-api.js`

```js
var app = module.exports = require('sik')(),
    Todo = require('todo-model');

app.get('/api/v1/todos', function(req, res, next) {
  Todo.all({}, function(err, todos) {
    if(err) return res.send(500, {msg: err.message});
    res.send(200, todos.map(function(t) { return t.present().smallApiSummary(); }));
  })
});

app.get('/api/v1/todos/:id', function(req, res, next) {
  var user = req.user;
  Todo.get(req.params.id, function(err, todo) {
    if(err) return res.send(500, {msg: err.message});
    res.send(200, todo.present().largeApiSummary(user));
  })
});
```
