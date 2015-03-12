'use strict';

var path = require('path');

// Inculde our utility object
// var _util = require('../utility');

var build = function() {

    var requireConfigs = function(rm, next) {

        console.log("Building RequireJS Configs for Grunt:");

        var grunt = rm.grunt;

        var baseBuildFile = path.join(rm.options.partialFolder, rm.options.baseBuild);

        // pull the prod/dev flag used to determine proper tasks.
        var buildType = grunt.config.get('prodBuild');

        // Read in the basic build requirements
        var base = grunt.file.readJSON(baseBuildFile);

        var customIncludes = Object.keys(rm.includeDefinitions);

        // Check to see if we have additional build defintions to include
        if (customIncludes.length > 0) {

            // Loop through all of the includes
            customIncludes.forEach(function (include) {

                // Pull the extension out of the module path
                var modulePath = rm.includeDefinitions[include].split('.')[0];

                // Add the library to the include paths
                base.libs[include] = modulePath;

                // Add the library to the include array
                base.include.push(include);

            });

        }

        // Get the base requireJS options
        var requireOptions = grunt.config.get('requirejs.compile.options');

        // Add the library and include definitions
        requireOptions.paths = base.libs;
        requireOptions.include = base.include;

        // Check to see if the build type is production, if so turn off the source map item and turn on
        if (buildType) {
            requireOptions.generateSourceMaps = false;
        }

        //console.log(rm.options.tempFolder, rm.options.requireSettings.fileName);
        var settingsFile = path.join('../', rm.options.tempFolder, rm.options.requireSettings.fileName).split('.js')[0];


        // Update settings path location
        requireOptions.name = settingsFile;

        // Reset options for the build.
        grunt.config.set('requirejs.compile.options', requireOptions);

        // Move to the next;
        next(rm);
    };

    // Functionm handles updating the uglify task so only components that are reconized as actual componets are shipped to the dist folder.
    // Only used on JS files right now.
    var assetConfigs = function(rm, next) {

        console.log("Building Asset Configs for Grunt:");

        // Lazy components are the problem here, so lets get the object
        var lazyComponents = rm.lazyComponents;

        // pull the prod/dev flag used to determine proper tasks.
        var buildType = rm.grunt.config.get('prodBuild');

        // Variables to hold all the different asset types
        var jsTask = [];

        Object.keys(lazyComponents).forEach(function(component) {

            // verify that compont has files.
            if (lazyComponents[component].files.length > 0) {
                var componentFiles = lazyComponents[component].files;

                // Loop through all the differnt files.
                componentFiles.forEach(function(file) {

                    // pull apart file paths for testing
                    // var filepath = file.substring(0, file.lastIndexOf('/'));
                    var filename = file.substring(file.lastIndexOf('/')+1);
                    var extension = filename.substring(filename.lastIndexOf('.')+1);

                    //console.log(extension);

                    switch (extension) {
                        case 'js':

                            jsTask.push(file);

                            break;

                        default:
                            break;
                    }

                });

            }

        });

        // Check to see if js task has any item
        if (jsTask.length > 0) {

            var gruntTask;

            // Based on the build type, pull the right configs.
            if (buildType) {
                gruntTask = rm.grunt.config.get('uglify.prodComponents');
            }
            else {
                gruntTask = rm.grunt.config.get('uglify.devComponents');
            }

            // Add the file to the config
            gruntTask.files[0].src = jsTask;

            // Now put the new configs in place.
            if (buildType) {
                rm.grunt.config.set('uglify.prodComponents', gruntTask);
            }
            else {
                rm.grunt.config.set('uglify.devComponents', gruntTask);
            }

        }

        // Move to next step.
        next(rm);

    };

    return {
        requireConfigs: requireConfigs,
        assetConfigs: assetConfigs
    };
};

module.exports = exports = new build();