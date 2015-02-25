var async = require('async');
var path = require('path');
var fs = require('fs');

exports.init = function(grunt) {
    'use strict';

    // Global Export Variables
    var globalPaths = {};
    var includeComponents = {};

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

    // Function is used to manually lookup files of a specified extension type.
    var manualLookup = function(type, componentPath) {

        // Setup the results return array
        var results = [];

        // Create th proper path
        var componentPath = path.join(componentPath, type);

        // Check to see if the search path exists
        if (grunt.file.exists(componentPath)) {

            // since the asset folder exists check to see if any files with the same name exists.
            grunt.file.recurse(componentPath, function(abspath, rootdir, subdir, filename) {

                // Check to make sure the file has the right extension type, just in case.
                if (filename.indexOf('.' + type) !== -1) {

                    var file = (subdir !== undefined) ? path.join(subdir, filename) : filename;
                    results.push(file);
                }

            });

        }

        // Return results array
        return results;

    };

    var getFilePath = function(componentPath, file, type) {

        // Generate the full name for comparison
        var fullname = file + "." + type;

        // Create th proper path
        var componentPath = path.join(componentPath, type);

        // Storage variable
        var filePath;

        // Singe we know the filename 100% we just need to look for it.
        grunt.file.recurse(componentPath, function(abspath, rootdir, subdir, filename) {

            //console.log(filename + ":" + fullname);

            // Check to make sure the file has the right extension type, just in case.
            if (filename === fullname) {

                filePath = (subdir !== undefined) ? path.join(subdir, filename) : filename;

            }

        });

        return filePath;


    };

    var checkComponents = function(assetSettings, componentName, componentFolder, options, type) {

        function assetPath(type, options, lazyLoad, currentPath) {

            var temp;

            // Check if lazyload to verify correct pathing
            if (lazyLoad) {

                // Check to see if its a style as relative pathing needs to be added.
                if (type === "scss") {

                    // First add Realtive Pathing
                    temp = path.relative(options.destDir, 'css');

                    // Now add back on absolute (this order is required)
                    temp = path.join(temp, options.destDir, currentPath);
                    
                } else {
                    temp = path.join(options.destDir, currentPath);
                }

            } else {

            }

            // return path with no extension.
            return temp.replace(/\.[^/.]+$/, "")

        }


        if (type === "js") {
            var assetDefine = assetSettings.script;
        } else {
            var assetDefine = assetSettings.style;
        }

        var lazyloadable = assetSettings.lazyLoadable;

        // Check to see if asset setting were defined.
        if (assetDefine) {

            // Asset of some kind was defined, so if it was a JS file lets look it up.
            if (type === "js") {

                var filePath = getFilePath(componentFolder, assetDefine, type)

                // Make sure the filepath is not defined
                if (filePath !== undefined) {

                    // Check the components loading status.
                    if (lazyloadable) {

                        // Its lazyloadable so the path is from the dest directory.
                        globalPaths[componentName] = assetPath(type, options, lazyloadable, filePath);

                    } else {

                        // Its not lazy loadable, so we are going to assume its part of the setting file.
                        includeComponents[componentName] = path.join(option.internalPath, '../css');

                    }

                } else {
                    grunt.log.error("Missing component file: " + componentName );
                }

            } else {

                // A style was defined. Under the current structure that means we will simply assume that file will be in place

                // Simplye check if we need to make a globalPath for it
                if (lazyloadable) {
                    globalPaths[componentName] = assetPath(type, options, lazyloadable, componentName);
                }

            }


        } else {

            // Either the script property is missing or underifned, so lets double check to see if there is a singlar
            // Javascript file in the js directory with the same name as the component. If not we will assume it does not exists.
            var temp = manualLookup(type, componentFolder);

            // Check to make sure only one result exists. If more exists, error and skip to next. If none exist do nothing it could be lazy styles.
            if (temp.length === 1) {


                // Check the components loading status.
                if (lazyloadable) {

                    // Its lazyloadable so the path is from the dest directory.
                    globalPaths[componentName] = path.join(options.destDir, temp[0]);

                }  else {

                    // Its not lazy loadable, so we are going to assume its part of the setting file.
                    includeComponents[componentName] = path.join(option.internalPath, temp[0]);

                }


            } else if (temp.length > 1) {

                grunt.log.error("Could not identify files proper component javascript file for component: " + componentName + "SKIPPING");

            }

        }

    }

    // This is the main function used to look for components
    exports.buildComponentList = function(components, done) {

        var options = {
            settingsFile: "settings.json", // Default Settings file path and name
            destDir: "components/",
            internalPath: "../../components/"
        }

        // Loop through all of the component sources.
        components.forEach(function(f) {

            var componentSrc = f.src.filter(function(filepath) {

                var componentFolder = path.join(f.cwd, filepath);

                // Check to make sure we are looking at component directories and
                // not files in the root component folder
                if (grunt.file.isDir(componentFolder)) {

                    // Create a variable for were the settings file should be found
                    var settingFile = path.join(componentFolder, options.settingsFile);

                    // Check the component settings file
                    if (grunt.file.exists(settingFile)) {

                        // Load the component settings file.
                        var componentSettings = grunt.file.readJSON(settingFile);

                        // Now that we have a setting file we need to check for some
                        // overrideable settings

                        // Check to see if the component has a preferred name property in settings or use the folder name
                        var componentName = (componentSettings.name) ? componentSettings.name : filepath;

                        // Now check for known asset files (we allow for one script file and one style asset per component)
                        var scriptPath, stylePath;

                        // ===
                        // Script Assets
                        // ===
                        checkComponents(componentSettings, componentName, componentFolder, options, 'js');

                        // Check if the componentName is already being used by a script, if so add "Styles" to the end, otherwise the component name is fine.
                        if (globalPaths.hasOwnProperty(componentName) || includeComponents.hasOwnProperty(componentName)) {
                            var componentStyleName = componentName + "Style";
                        } else {
                            var componentStyleName = componentName
                        }

                        // ===
                        // Style Assets
                        // ===
                        checkComponents(componentSettings, componentStyleName, componentFolder, options, 'scss');

                        console.log(globalPaths);


                    } else {

                        console.log(filepath + " is missing a settings file");
                    }
                }

            })

        });


    };

    // Return all public functions
    return exports;
};
