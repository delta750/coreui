'use strict';

// Inculde our utility object
var _util = require('../utility');

var include = function() {

    var saveAsset = function(rm, assets, type, typeDef, component) {

        var includeDefinitions = rm.includeDefinitions;

        // Check to see if this is an asset array, if not make it one.
        if (_util.kindOf(assets) === "object") {
            assets = [assets];
        }

        // Iterate all assets
        assets.forEach(function(asset) {

            var defintionName;

            // Check to see if a definition already exists
            if (!includeDefinitions[component.name]) {

                // Create the path
                defintionName = component.name;

            // Check to see if the lazy definition tagged with asset type is defined.
            } else if (!includeDefinitions[component.name + _util.uCaseFirst(type)]) {

                defintionName = component.name + _util.uCaseFirst(type);

            }

            var srcPath = asset.srcPath.replace('src/','');

            // Add the include definition to the to master list.
            includeDefinitions[defintionName] = srcPath;


        });

    }

    return {
        saveAsset: saveAsset
    }
}

module.exports = exports = new include();
