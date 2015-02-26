// Node native libs
var path = require('path');

// Node third party libs
var chalk = require('chalk');

exports.init = function(grunt) {
    'use strict';

    // Object to hold lazy component paths
    var lazyComponents = {};

    // Function to handle defined assets
    function findAsset(assetName, componentDef, options) {

      // Function will recursively search a path until it files a filename that matches the search criteria.
      function recursiveSearch(name, path) {

        // Array results
        var results = [];

        grunt.file.recurse(path, function(abspath, rootdir, subdir, filename) {

          if (filename === name) {
            results.push(abspath);
          }

        });

        // Return the results.
        return results;

      }

      // Check to see if we have one conponent or multiple to lookup
      if (typeof(assetName) === "string") {

        // Specific file lookup
        var file = recursiveSearch(assetName, componentDef.rootPath);

        // Recursivly search for the rootPath
        if (file.length === 1) {
            return file[0];
        }

      } else {

        // Loop throught the name array
        var results = [];

        // Loop through all the other names ( we take the first one we can get!)
        assetName.every(function(name){

          // Search each iteration
          var file = recursiveSearch(name, componentDef.rootPath);

          // Check for value
          if (file.length === 1) {

            // We found something, so go with it.
            results.push(file[0]);
            return;
          }

        });

        return results[0];

      }

    }

    // Function to construct the defineable asset names from component settings and the folder name.
    function generateAssetName(componentDef, assetObject, type) {

      var assetName;

      // Check to see if the asset type had object defined name and construct it.
      if (componentDef.settings && componentDef.settings.definedAssets[type]) {

        // A seconday name was defined, so look for that
        assetName = componentDef.settings.definedAssets[type] + assetObject.extension;

        // Check to see if a override name was applied
      } else if (componentDef.name) {

        assetName = componentDef.name + assetObject.extension;

        // Result to the folder name
      } else {

        // There was not a defined name so we can assume its the folder name first.
        assetName = componentDef.rootFolder + assetObject.extension;

      };

      return assetName;
    }

    // Simple copy function
    function moveComponent(src, dest, name) {

      function copyCommand(src, destFolder, destFile) {

        // Check if dest folder exists
        if (grunt.file.exists(dest)) {
          grunt.file.mkdir(dest)
        }

        grunt.file.copy(src, dest);

      };

      if (typeof(src) === "string") {

        console.log(name);

        copyCommand(src, destFolder, destFile);

      } else {

      }

    };

    // Function for fixing paths
    var unixifyPath = function(filepath) {
        if (process.platform === 'win32') {
            return filepath.replace(/\\/g, '/');
        } else {
            return filepath;
        }
    };

    // Simple functio to help merge objects
    var mergeObject = function(obj1, obj2) {

      for (var p in obj2) {

        try {
          // Property in destination object set; update its value.
          if ( obj2[p].constructor === Object ) {

            if (obj1[p].constructor !== Object) {
                obj1[p] = {};
            }
            obj1[p] = mergeObject(obj1[p], obj2[p]);

          } else {
            obj1[p] = obj2[p];
          }

        } catch(e) {

          // Property in destination object not set; create it and set its value.
          obj1[p] = obj2[p];

        }
      }

      return obj1;
    };


    // This is the main function used to look for components
    exports.components = function(components, done) {

      // Component Manager Options
      var options = {
        settingsFile: 'component.json',
        acceptableAssets: {
          script: {
            extension: '.js',
            alternativeNames: ['script.js', 'main.js'],
            distFolder: "/dist/js/components",
            pathFromBase: "components/"
          },
          style: {
            extension: '.scss',
            alternativeNames: ['styles.scss', 'main.scss']
          }
        },
        destDirectory: {
          js: 'dist/js',
          css: 'dist/css'
        }
      }

      // Storage location for all confirmed components.
      var definedComponents = {};

      // Loop through all of the component folders
      components.forEach(function(c) {
        c.src.filter(function(componentName) {

          // Component Definition
          var componentDef =  {
            rootFolder: componentName,
            rootPath: path.join(c.cwd, componentName),
            files: {}
          };

          // ===
          // Check for component settings file
          // ===

          // Check for settings file on in the component root.
          if (grunt.file.exists(path.join(componentDef.rootPath, options.settingsFile))) {

            // We have a setting file so read it in
            componentDef['settings'] = grunt.file.readJSON(path.join(componentDef.rootPath, options.settingsFile));

          } else {

            // We have no setting file for the component.
            grunt.log.warn(chalk.yellow("Component folder " + componentDef.rootPath + " does not contain a setting file."));;

          }

          // ===
          // Set Component Demographics
          // ===

          // Save off the proper component name if the setting has an override, otherwise use the rootFolder as the name
          componentDef.name = (componentDef.settings && componentDef.settings.name) ? componentDef.settings.name : componentDef.rootFolder;

          // Lets check to see if the developer defined a array or object for assets they want to inlude
          if (componentDef.settings && componentDef.settings.definedAssets) {

              // Developer defined an object, so get its keys
              var assetTypes = (grunt.util.kindOf(componentDef.settings.definedAssets) === "array") ? componentDef.settings.definedAssets : Object.keys(componentDef.settings.definedAssets);

          } else {

            // The setting did not define any specific asset types, so we need to assume all are present and find out otherwise
            var assetTypes = Object.keys(options.acceptableAssets);
          }

          // ===
          // Lookup potential assets
          // ===

          // Loop through and look for all the different asset types that could exist.
          assetTypes.forEach(function(type) {

            var typeOptions = options.acceptableAssets[type];

            // Get a shortcut to acceptable asset type object
            var assetName = generateAssetName(componentDef, typeOptions, type);

            // Now that we have the default name of the file go look for it
            var assetFile = findAsset(assetName, componentDef, options);

            // Check to see if the predefined name retures a path is so we have all we need to know here
            if (!assetFile) {

              // Check to see if the file was defined asset and let them know of the error.
              if (componentDef.settings && componentDef.settings.definedAssets[type]) {
                grunt.log.warn(chalk.yellow("Component " + componentDef.name + " defined " + type + " file: " + assetName + " does not exist. Check your component.json"));
              }

              // Stange, we couldnt find anything with the defined names, lets check for other good defaults, just in case, if defined.
              if (typeOptions.alternativeNames) {
                  assetFile = findAsset(typeOptions.alternativeNames, componentDef, options);
              }

            }

            // Check the assetFile one last time after the alterative search
            if (assetFile) {

              // We have something so we should save it off.
              componentDef.files[type] = assetFile;
            }

          });

          // Save off the defined object it assets were found
          if (Object.keys(componentDef.files).length > 0) {

            definedComponents[componentDef.name] = componentDef;

          }

        });

      });

      // ===
      // Processing Components
      // ===

      Object.keys(definedComponents).forEach(function(componentName) {

        // Make a shortcut to this component definition
        var component = definedComponents[componentName];

        // loop through the different asset types
        Object.keys(component.files).forEach(function(type) {

          console.log(type);

          switch (type) {

            case "script":
              console.log(component.files[type]);
              break;

          }

        });

      });

      //console.log(definedComponents);

    };

    // Return all public functions
    return exports;
};
