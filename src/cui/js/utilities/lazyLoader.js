define(['require'], function (require) {

  var lazyLoader = {};

  lazyLoader.load = function(request) {
    console.log('request');
  };

  return lazyLoader;

});
