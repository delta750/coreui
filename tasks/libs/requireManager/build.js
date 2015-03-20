/***
 * ===
 *  Build.js
 *  ----------
 *  The build module is responspible for creating all the dynamic grunt task that are part of the component
 *  integration process.
 * ===
 ***/

'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');
var _include = require('./include');
var _lazy = require('./lazy');

var build = function() {

    // This function creates all the specific asset task for the lazy loaded resources.
    var assets = function(rm, next) {

        var grunt = rm.grunt;

        _util.console('ok', 'Building Grunt Tasks for Assets');

        // Loop the components again
        rm.definedComponents.forEach(function(component) {

            // Check to see if we are handleing lazy load components or include components.
            if (!component.lazy) {

                _include.component(component, grunt);

            }
            else {

                _lazy.component(component, grunt);
            }

        });

        var watch = grunt.config.get('watch');

        _util.writeJSON(path.join(rm.options.components.folders.temp, 'watch.json'), watch);

        next(rm);
    }

    var require = function(rm, next) {

        var grunt = rm.grunt;
        var options = rm.options;

        _util.console('ok', 'Building Grunt Tasks for Require');

        // Load in the base file from the default location unless the user has indicated an override.
        if (!options.components.requireJS.customBase) {
            var baseJSON = path.join(options.components.folders.partial, options.components.requireJS.baseFile);
        }
        else {

            // Custom base, just use the basefile defined
            var baseJSON = options.components.requireJS.baseFile;
        }

        var baseJSON = grunt.file.readJSON(baseJSON);

        // Check to see if we have addtional definitions to include
        if (Object.keys(rm.includeComponent).length > 0) {

            Object.keys(rm.includeComponent).forEach(function(include) {

                baseJSON.libs[include] = rm.includeComponent[include];
                baseJSON.include.push(include);

            });

        }

        // Get the base requireJS options
        var requireOptions = grunt.config.get('requirejs.compile.options');

        // Add the library and include definitions
        requireOptions.paths = baseJSON.libs;
        requireOptions.include = baseJSON.include;

        // Check to see if the build type is production, if so turn off the source map item and turn on
        if (grunt.config.get('prodBuild')) {
            requireOptions.generateSourceMaps = false;
        }

        var settingsFile = path.join('../', options.components.folders.temp, options.components.requireJS.filename.split('.js')[0]);

        // Update settings path location
        requireOptions.name = settingsFile;

        // Reset options for the build.
        grunt.config.set('requirejs.compile.options', requireOptions);

        // For debug purposes write this build file out
        var jsonFile = path.join(options.components.folders.temp, 'build.json');

        _util.writeJSON(jsonFile, baseJSON);

        next(rm);
    }

    return {
        assets: assets,
        require: require
    };
}

module.exports = exports = new build();