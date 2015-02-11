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
        'core': 'core'
    },

    // Libraries that need to be exposed in the global scope.
    shim: {
        'jquery': {
            exports: '$'
        }
    }
});
