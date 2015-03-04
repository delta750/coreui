// Node native libs
var path = require('path');

// Node third party libs
var chalk = require('chalk');


exports.init = (function(grunt) {

  var exports = {};

  exports.components = function(options, taskSrc) {

     // Internal Libraries
    var _utility = require('./utility');
    var writeSettings = require('./writeSettings');
    var buildDefinition = require('./buildDefinition');

    var lazyComponents = [];
    var includeComponents = [];
    var excludedComponents = [];

    var processOrder = {
        "lazy": {
            processor: require('./lazyProcessor')
        },
        "include": {
            processor: require('./includeProcessor')
        },
        "exclude": {
            // Nothing defined yet!
        }
    }

    // Objects to hold final definitions
    var lazyLoadDefinitions = {};
    var includeLoadDefinitions = {};

    // Settings developer can not change for now.
    var requireSettings = {
      assetTypes: {
        script: {
          process: "singleFile", // Marks that process type allowed
          loadSource: "components/", // Location where lazy load components should appear
          flatten: true // Tell the load path to ignore sub directorys
        },
        style: {
          process: "singleFile",
          loadSource: "css/components/",
          flatten: true
        },
      },
      requireOutput: {
        settingsFile: 'cui.js'
      }
    }

    // Global task options and values
    var taskOptions = {};

    // Merge the public and private settings.
    var options = _utility.merge(options, requireSettings);

    // Function to sort the different components according to settings and detection
    function sortComponents(def, loc) {

      switch (loc) {
        case "lazy":
          lazyComponents.push(def);
          break;

        case "include":
          includeComponents.push(def);
          break;

        default:
          excludedComponents.push(def);
          break;
      }

    }

    // Function handles saving off all valid results
    function saveComponent(type, kind, results) {

        var refObj;

        // Check for results
        if (results) {

            // Get a reference to the correct object.
            switch (type) {

              case "lazy":
                refObj = lazyLoadDefinitions;
                break;

              case "include":
                refObj = includeLoadDefinitions;
                break;

            }

            // Loop through all the keys and correct where needed
            Object.keys(results).forEach(function(k) {

                // Look for this key
                if (!refObj.hasOwnProperty(k)) {
                  refObj[k] = results[k];
                } else {
                  var kindStr = kind.charAt(0).toUpperCase() + kind.substring(1, kind.length);
                  refObj[k+kindStr] = results[k];
                }

            });

        }
    }

    // Loop through all folder and idenify the component base information
    taskSrc.forEach(function(folders) {

      // Save off task options.
      taskOptions.baseSrc = folders.cwd;
      taskOptions.baseDest = folders.dest;

      // Loop through all the individual folders
      folders.src.forEach(function(component) {

        // Setup the component definition
        var compDefinition = {
          rootFolder: component, // Just the folder name
          rootFolderPath: path.join(taskOptions.baseSrc, component), // The component source folder from the root
          settingsPath: path.join(taskOptions.baseSrc, component, options.configName) // Location where the settings file should exist
        }

        // Pull component setting in if they exist
        if (grunt.file.exists(compDefinition.settingsPath)) {

          // We have a settings file so attempt to pull it in
          compDefinition.settings = grunt.file.readJSON(compDefinition.settingsPath);

          // Setup the actual component make based on the name property
          compDefinition.name = (compDefinition.settings.name) ? compDefinition.settings.name : component;

        } else {

          // We dont have setting so set it to false
          compDefinition.settings = false,

          // Generate the component default name
          compDefinition.name = component;

        }

        // Now we need to seperate the component list based on what is going to happen to the data.
        if (compDefinition.settings) {

          if (compDefinition.settings.lazy) {
            sortComponents(compDefinition, "lazy");
          } else {
            sortComponents(compDefinition, "include");
          }

        } else {

          // Not config file was specified for the component. Check to see it they are required, otherwise assume they
          // can be lazy loaded
          if (!options.requiredConfig) {
            sortComponents(compDefinition, "lazy");
          } else {
            sortComponents(compDefinition, "exclude");
          }

        }

      });

    });

    // Loop through the process order
    Object.keys(processOrder).forEach(function (step) {

        var workArray;

        switch (step) {

            case "lazy":
                workArray = lazyComponents;
                break;

            case "include":
                workArray = includeComponents;
                break;

            case "exclude":
                workArray = excludedComponents;
                break;
        }

        // Pull the processor local.
        var processor = processOrder[step].processor;

        // Check to see if anything is to be done.
        if (workArray.length && processor) {

            // Handle asset lookup.
            workArray.forEach(function(component) {

              // So for each component we need to process assets according to the proper definitions
              // First lets see if assets have defined a definition
              if (component.settings.assets) {

                // Since assets were defined, we will only process the assets listed.
                var assets = (grunt.util.kindOf(component.settings.assets) === "array") ? component.settings.assets : Object.keys(component.settings.assets);

                // Loop all the defined asset types.
                assets.forEach(function(type) {

                  // Check to see if this specific component had defined a specific process method
                  if (grunt.util.kindOf(component.settings.assets[type]) === "object" && component.settings.assets[type].process) {

                      processor[component.settings.assets[type].process].call(this, type, taskOptions, component, options.assetTypes[type], saveComponent);

                  } else {

                    // No defined process method was picked, default to the default option
                    processor[options.assetTypes[type].process].call(this, type, taskOptions, component, options.assetTypes[type], saveComponent);

                  }

                });

              } else {

                // Specific types were not defined, so we will use the default method defined in options
                // Loop all the defined asset types.
                Object.keys(options.assetTypes).forEach(function(type) {

                    // Since nothing was defined about the component its automatically a lazy load item.
                    processor[options.assetTypes[type].process].call(this, type, taskOptions, component, options.assetTypes[type], saveComponent);

                });

              }

            });

        }

    });

    // Write Settings File and pass it the paths of all the lazy load components
    writeSettings.settingsFile(lazyLoadDefinitions, options, taskOptions);

    // Write the r.js build definition json file. (for debugging)
    var build = buildDefinition.buildFile(includeLoadDefinitions, options, taskOptions);

    // Get the base requireJS options
    var requireOptions = grunt.config.get('requirejs.compile.options');

    // Add the library and include definitions
    requireOptions.paths = build.libs;
    requireOptions.include = build.include;

    // Reset options for the build.
    grunt.config.set('requirejs.compile.options', requireOptions);

  };

  // Return the module
  return exports;

});
