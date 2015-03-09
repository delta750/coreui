'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');

var build = function() {

    var configs = function(rm, next) {

        var grunt = rm.grunt;

        var baseBuildFile = path.join(rm.options.partialFolder, rm.options.baseBuild);

        // Read in the basic build requirements
        var base = grunt.file.readJSON(baseBuildFile);

        var customIncludes = Object.keys(rm.includeDefinitions);

        // Check to see if we have additional build defintions to include
        if (customIncludes.length > 0) {

            // Loop through all of the includes
            customIncludes.forEach(function(include) {

                // Pull the extension out of the module path
                var modulePath = rm.includeDefinitions[include].split('.')[0];

                // Add the library to the include paths
                base.libs[include] = modulePath;

                // Add the library to the include array
                base.include.push(include);

            })

        }

        // Get the base requireJS options
        var requireOptions = grunt.config.get('requirejs.compile.options');

        // Add the library and include definitions
        requireOptions.paths = base.libs;
        requireOptions.include = base.include;

        //console.log(requireOptions);

        //console.log(rm.options.tempFolder, rm.options.requireSettings.fileName);
        var settingsFile = path.join('../', rm.options.tempFolder, rm.options.requireSettings.fileName).split('.js')[0];


        // Update settings path location
        requireOptions.name = settingsFile;

        // Reset options for the build.
        grunt.config.set('requirejs.compile.options', requireOptions);

        // Move to the next;
        next(rm);
    }

    return {
        configs: configs
    }
}

module.exports = exports = new build();
