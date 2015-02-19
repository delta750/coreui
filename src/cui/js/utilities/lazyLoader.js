define(['require'], function (require) {

  // Module Object
  var lazyLoader = {};

  // Module Load States
  lazyLoader.states = {
    unloaded: 0,
    loading: 1,
    loaded: 2
  };

  // Place to store request
  lazyLoader.loadQueue = {};

  // Create the function used to load scripts inline.
  lazyLoader.load = function(request, requestCallBack) {

    //var ll = this;

    var processor = function(request) {

      // Check to see if the requested library is already been defined in requirejs
      if (require.defined(request)) {

        console.log('request was already defined');

      } else {

        console.log('request was not already defined');

      }

    };

    // Check what type of request we have
    if (typeof(request) === "string") {

      // Handle the one off request.
      processor(request);

    } else {

      for (var i = 0, len = request.length; i < len; i++) {
        processor(request[i]);
      }

    }


  };

  return lazyLoader;

});
