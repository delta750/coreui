'use strict';
var path = require('path');

// Inculde our utility object
var _util = require('../utility');

var lazy = function() {

    // Function to handle
    var saveAsset = function(rm, assets, type, typeDef, component) {

        var lazyDefinitions = rm.lazyDefinitions;

        // Check to see if this is an asset array, if not make it one.
        if (_util.kindOf(assets) === "object") {
            assets = [assets];
        }

        // Iterate all assets
        assets.forEach(function(asset) {

            var defintionName;

            // Check to see if a definition already exists
            if (!lazyDefinitions[component.name]) {

                // Create the path
                defintionName = component.name;

            // Check to see if the lazy definition tagged with asset type is defined.
            } else if (!lazyDefinitions[componnet.name + type]) {

                defintionName = componnet.name + _util.uCaseFirst(type);

            }

            lazyDefinitions[defintionName] = path.join(typeDef.lazyLoadPath, component.name);

        });

        console.log(lazyDefinitions);

    }


    return {
        saveAsset: saveAsset
    }
}

module.exports = exports = new lazy();
