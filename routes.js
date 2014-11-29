var inflection = require('inflection'),
    _ = require('underscore');

var Routes = (function() {

  var Resources = function(resourcesName, app, controllers, routes) {

    // Make sure controller is defined
    if (!controllers[resourcesName]) {
      throw('Controller "' + resourcesName + '" not defined!');
    }

    var resourceName = inflection.singularize(resourcesName),
        self = this;


    // Fallback function for routes that are not defined
    var routeNotDefined = function(routeName) {
      return function(req, res) {
        res.send(500, 'No function defined for ' + resourcesName + '#' + routeName + '.');
      }
    };

    // Define a route and add the corresponding controller function
    this.defineRoute = function(routeName, routeType, route) {
      if (typeof(controllers[resourcesName][routeName]) == 'function') {
        app[routeType](route, controllers[resourcesName][routeName]);
      } else {
        app[routeType](route, routeNotDefined(routeName));
      }
    },

    /*
     * Standard rails routes
     */
    this.show = function() {
      this.defineRoute('show', 'get', '/'+resourceName+'/:id');
    },

    this.new = function() {
      this.defineRoute('new', 'get', '/'+resourcesName+'/new');
    },

    this.create = function() {
      this.defineRoute('create', 'post', '/'+resourcesName);
    },

    this.edit = function() {
      this.defineRoute('edit', 'get', '/'+resourcesName+'/:id/edit');
    },

    this.update = function() {
      this.defineRoute('update', 'post', '/'+resourcesName+'/:id');
    },

    this.index = function() {
      this.defineRoute('index', 'get', '/'+resourcesName);
    }

    _.each(routes, function(route) {
      self[route]();
    });
  };


  return {
    draw: function(app, controllers, block) {

      if (arguments.length < 3) {
        throw('Call with app, controllers and block as parameters!');
      }

      var resources = function(resourcesName) {

        // Handling of arguments is a bit messy
        // but we want to allow all combinations
        if (arguments.length >= 3) {
          var options = (typeof(arguments[1]) == 'function' ? arguments[2] : arguments[1]);
          var block = (typeof(arguments[1]) == 'function' ? arguments[1] : arguments[2]);
        } else if (arguments.length == 2) {
          var options = (typeof(arguments[1]) == 'function' ? undefined : arguments[1]);
          var block = (typeof(arguments[1]) == 'function' ? arguments[1] : undefined);
        } else {
          throw('This function needs at least 2 parameters!');
        }

        var routes = ['show', 'new', 'create', 'edit', 'update', 'index'];

        if (options) {
          if (options.only) {
            routes = options.only;
          }
          else if (options.not) {
            routes = _.reject(options.not, function(element) {
              return _.contains(routes, element);
            });
          }
        }

        var r = new Resources(resourcesName, app, controllers, routes);

      }

      if (block) {
        block(resources);
      }
    }
  };
})();


// Export routes
module.exports = Routes;
