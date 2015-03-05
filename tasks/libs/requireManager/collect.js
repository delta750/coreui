'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');

var collectComponents = function() {

    var findAll = function(rm, next) {

        //console.log(rm.task);
        var options = rm.options;
        var grunt = rm.grunt;

        // Loop through all the file folder specified in the Grunt task.
        rm.task.files.forEach(function(folders) {

            // Save off the component root folder
            var crf = folders.cwd;

            // Loop each folder inside
            folders.src.forEach(function(folder) {

                // Create the full folder path
                var folderPath = path.join(crf, folder);

                // Check to make sure this is a folder
                if (grunt.file.isDir(folderPath)) {

                    var componentFile = path.join(folderPath, options.settingFileName);
                    var componentBuild = path.join(folderPath, options.buildFileName);

                    // Check to see if a component settings file exists, if it does, load it,
                    // if not load a default object from the task options
                    if (grunt.file.exists(componentFile)) {

                        // Get a copy of the default settings JSON
                        var temp = grunt.file.readJSON(componentFile);

                        // Merge our settings with the component settings
                        var component = _util.merge({}, options.defaultSetting);

                        component = _util.merge(component, temp);

                        // Indicate settings file was found
                        component.settings = true;

                    } else {

                        // No setting file so pull in a default object from settings
                        var component = _util.merge({}, options.defaultSetting);

                        // Set the component name to match the name.
                        component.name = folder;

                    }

                    // Add some additional object information into the component
                    component.folder = folder;
                    component.srcPath = folderPath;

                    // Check to see if the component has its own build
                    component.build = (grunt.file.exists(componentBuild)) ? true : false;

                    // Check for an assets property.
                    if (component.assets) {

                        if (_util.kindOf(component.assets) === "object") {

                            // Copy of the defaults
                            var temp = _util.merge({}, rm.assets);

                        } else {

                            var temp = {};

                            // user defined what they needed by nothing else (Array)
                            component.assets.forEach(function(type) {

                                // Pull this specific definition out
                                temp[type] = rm.assets[type];

                            });

                        }

                        // Merge back in the correct asset definitions
                        component.assets = _util.merge(temp, rm.assets);

                    } else {

                        // Merge in default asset information.
                        component.assets = _util.merge({}, rm.assets);

                    }

                    // Save the component off to the manager object
                    rm.components[component.name] = component;

                }

            });

        });

        // Move to next task
        next(rm);

    }

    var sortComponents = function(rm, next) {

      // Get all of the components
      var components = rm.components;

      // Loop through all of the components based on load status
      Object.keys(components).forEach(function(component) {

        // Sort based on lazy load status.
        if (components[component].lazy) {

          rm.lazyComponents[component] = components[component];

        } else {

          rm.includeComponents[component] = components[component];
        }

      });

      // Move to next task
      next(rm);
    }

    return {
      findAll: findAll,
      sortComponents: sortComponents
    }

}

module.exports = exports = new collectComponents();
