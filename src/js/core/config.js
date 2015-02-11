// Get the required script as the reliable path
var scripts = document.getElementById("require"),
    src = scripts.src,
    baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf('/'));

// The basic require config.
require.config({
    baseUrl: baseUrl, // Set the baseURL path to where the requireJS is being served.

    // Included libraries
    paths: {
        'jquery': 'jquery',
    },

    // Libraries that need to be exposed in the global scope.
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});

require(['core'], function(cui) {

  // Execute it right away!
  cui.init();

});
