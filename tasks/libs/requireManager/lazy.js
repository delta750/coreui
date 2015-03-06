'use strict';

// Inculde our utility object
var _util = require('../utility');

var lazy = function() {

    // Function to handle
    var saveAsset = function(rm, assets, type, component) {

        var lazyDefinitions = rm.lazyDefinitions;

        // Check to see if this is an asset array, if not make it one.
        if (_util.kindOf(assets) === "object") {
            assets = [assets];
        }

        // Iterate all assets
        assets.forEach(function(asset) {

            if (!lazyDefinitions[component.name]) {

                lazyDefinitions[component.name] = type.lazyLoadPath;

            }

        });

        console.log(lazyDefinitions);

    }


    return {
        saveAsset: saveAsset
    }
}

module.exports = exports = new lazy();
