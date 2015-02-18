define(['require'], function (require) {

  var lazyLoader = {};

  lazyLoader.load = function(request) {
    console.log(request);

    function processor(request) {

      if (require.defined(request)) {

        console.log('Item has been defined');

      } else {

        console.log('Item needs to be defined');

        require([request]);

      }

    }

    if (typeof(request) === 'string') {

      processor(request);

    } else {

      for (var i = 0, len = request.length; i < len; i++) {

        processor(request[i]);

      }

    }

  };

  return lazyLoader;

});
