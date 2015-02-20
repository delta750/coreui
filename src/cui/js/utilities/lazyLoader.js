define(['require'], function (require) {

  // Module Object
  var lazyLoader = {};

  // Place to store request
  lazyLoader.loadQueue = {};

  // Create the function used to load scripts inline.
  lazyLoader.load = function(request, requestCb) {

    var que = {};

    var processor = function(request, requestCb) {

      // Function to handle callbacks in the order they are recieved.
      var requestFunctions = function(arrayCb) {

        if (arrayCb.length > 0) {

          var nextFunc = arrayCb[0];
          arrayCb.shift();

          // Make sure the item is a function, if not skip it.
          if (typeof(nextFunc) === 'function') {
            nextFunc();
          }

          requestFunctions(arrayCb);

        } else {

          return;

        }

      };


      // Check to see if the requested library is already been defined in requirejs
      if (require.defined(request)) {

        // The item being requested already exists in requie. Just call its callback

        if (typeof(requestCb) === 'function') {
          requestCb();
        }

      } else {

        // Check for the item que already exits
        if (que[request]) {

          que[request].push(requestCb);
        } else {

          // Create a que for this request
          que[request] = [requestCb];

          // Request the item
          require([request], function() {
            requestFunctions(que[request]);
          });

        }

      }

    };

    // Check what type of request we have
    if (typeof(request) === "string") {

      // Handle the one off request.
      processor(request, requestCallBack);

    } else {

      for (var i = 0, len = request.length; i < len; i++) {
        processor(request[i]);
      }

    }


  };

  return lazyLoader;

});
