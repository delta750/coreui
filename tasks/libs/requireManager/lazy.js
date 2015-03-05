'use strict';

// Include our asset finder utility
var assets = require('./assets');

// Inculde our utility object
var _util = require('../utility');

var process = function() {

    // Function to handle
    var components = function(rm, next) {

        // Pull the lazy components out
        var lazy = rm.lazyComponents;

        // Loop through each component and process the best way possible
        Object.keys(lazy).forEach(function(component) {

            // Pull out an array of all the asset types we need to find/process
            var assets = (_util.kindOf(lazy[component].assets) === "object") ? Object.keys(lazy[component].assets) : lazy[component].assets;

            // Loop through each asset type.
            assets.forEach(function(type) {

                console.log("Processing: " + component + " " + type + " asset.");

                var processMethod = lazy[component].assets[type].process;

                // Check to see if the process method exists
                if (assets[processMethod]) {



                } else {

                }

            });

        });

    }


    return {
        components: components
    }
}

module.exports = exports = new lazyHandler();
