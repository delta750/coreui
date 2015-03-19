/***
 * ===
 *  Find.js
 *  ----------
 *  The find module is responspible locating and iterating the component folder. Creating the component
 *  definitons JSON objects and iterating component folders looking for assets based on component definitions.
 * ===
 ***/

'use strict';

// Native node js modules
var path = require('path');

// Third party modules
var _util = require('../utility');
var _assets = require('./assets');

// Function used to find specific asset files.
var find = function() {

    // Function crawls components folder lookng for important files and setting proper meta data.
    function defineComponent(folder, defaults, options, grunt) {

        // Setup a default component for task definitions
        var component = _util.merge({}, defaults.components);

        // Add a place to store important file metadata.
        component.files = {};

        // Add a place to store folder metadata.
        component.folder = {
            folder: _util.lastPart(folder, "/"),
            path: folder
        }

        // Path to potential settings file
        var settingsFile = path.join(folder, options.components.files.settings.component);

        if (grunt.file.exists(settingsFile)) {
            component = _util.merge(component, grunt.file.readJSON(settingsFile));
            component.settings = true;
            component.files.settings = settingsFile;
        } else {
            component.settings = false;
        }

        // Path to potential GruntFile builds
        var buildFile = path.join(folder, options.components.files.build);

        if (grunt.file.exists(buildFile)) {
            component.build = true;
            component.files.build = buildFile;
            component.folder.build = path.join(folder, options.components.folders.build);

        } else {
            component.build = false;
            component.folder.build = folder;
        }

        // Check to see if the component has a defined name
        if (!component.name) {
            // Fall back to the folder name.
            component.name = _util.lastPart(folder, "/");
        }

        // Now lets get the defaults for assets criteria
        var assets = _util.merge({}, defaults.assets);

        // Check to see if the component has already defined internal asset definitions
        if (component.assets) {

            // Check how it was defined. If its an object, then merge, if its a simple array enhance
            if (_util.kindOf(component.assets) === "array") {

                var tempAsset = {};

                component.assets.forEach(function(type) {

                    // Check to see if this is a known asset type, then add it
                    if (assets[type]) {
                        tempAsset[type] = assets[type];
                    }

                });

                // Override the asset definiton provided
                component.assets = tempAsset;

            } else if (_util.kindOf(component.assets) === "object") {

                var tempAsset = {};

                // Check each asset type defined to determine if it an acceptable kind
                Object.keys(component.assets).forEach(function(type) {

                    // Check to see if its an accepted type
                    if (assets[type]) {

                        // Merge in default configs
                        tempAsset[type] = _util.merge({}, assets[type]);

                        // Now merge in the custom configs
                        tempAsset[type] = _util.merge(tempAsset[type], component.assets[type]);

                    }

                });

                // Override the asset definiton provided
                component.assets = tempAsset;

            } else if (_util.kindOf(component.assets) === "string") {

                var tempAsset = {};

                if (assets[component.assets]) {

                    // Merge in default configs with custom configs.
                    tempAsset[component.assets] = _util.merge({}, assets[component.assets]);
                }

                component.assets = tempAsset;

            }

        } else {

            // Nothing is defined about this components assets, so we will use the inherit definitions
            component.assets = assets;

        }

        // Save the component off
        return component;

    }

    var components = function(rm, next) {

        var options = rm.options;
        var grunt = rm.grunt;
        var task = rm.task;

        // Indicate the step started.
        _util.console("ok", "Find Components Folders");

        // Loop through all of the task files
        var componentDirectory = options.components.cwd;
        var componentGlob = path.join(componentDirectory, options.components.src);

        // Loop all the folders in the provided path
        if (grunt.file.exists(componentDirectory)) {

            var folders = grunt.file.expand({filter: 'isDirectory'}, componentGlob);

            if (folders.length) {

                folders.forEach(function(folder) {

                    var componentDefinition = defineComponent(folder, rm.defaults, options, grunt);

                    // Push thus component to the task object for now
                    rm.definedComponents.push(componentDefinition);

                });

            } else {

                // Nothing was found!
                _util.console("warn", "Component folder: " + componentDirectory + " is empty or glob patterm found no folders.!");

            }

        } else {

            _util.console("warn", "Component folder: " + componentDirectory + " is invalid!");
        }

        // Move to the next step
        next(rm);
    }

    var assets = function(rm, next) {

        var options = rm.options;
        var grunt = rm.grunt;
        var task = rm.task;
        var definedComponents = rm.definedComponents;
        var excludeFiles = rm.excludeFiles;

        function singleSearch(haystack, needle) {

             return _assets.single(haystack, "**/" + needle);

        }

        function createFileArray(name, exts) {

            var temp = [];

            exts.forEach(function(ext){

                temp.push(name + "." + ext);

            });

            return temp;

        }

        // Indicate the step started.
        _util.console("ok", "Find Components Assets");

        definedComponents.forEach(function(component) {

            var fileList = [];

            // Loop through each type of asset the component has listed.
            Object.keys(component.assets).forEach(function(type) {

                var asset = component.assets[type];

                // Look at the asset definition to the type of serach we should perform
                switch (asset.search) {

                    // Search for a single file of this type
                    case "single":

                        // So we are looking for a single file, the file name itself is either going to be spcified in the file attribute for the asset
                        // or its the folder name so lets start with that.
                        var name;

                        if (asset.file) {

                            // Just in case, if this is an array just take the first one
                            // === Glob test ability? ===
                            if (_util.kindOf(asset.file) === "array") {
                                name = asset.file[0];
                            } else {
                                name = asset.file;
                            }

                        } else {

                            // component name is either going to be specified or not (defualt to folder).
                            name = component.name;

                        }

                        // Now that we have the name we need to look at the acceptable extensions
                        var acceptableExt = [];

                        // Check to see if the normal extensions are defined (they should be).
                        if (asset.ext) {

                            if (_util.kindOf(asset.ext) === "array") {
                                acceptableExt.concat(asset.ext);
                            } else {
                                acceptableExt.push(asset.ext);
                            }

                        }

                        // Check for compiled extenstions
                        if (asset.compiledExt) {

                            if (_util.kindOf(asset.compiledExt) === "array") {
                                acceptableExt.concat(asset.compiledExt);
                            } else {
                                acceptableExt.push(asset.compiledExt);
                            }

                        }

                        // Now we need to make the final needle names. First if a name is defined, we should be looking for that specific on first
                        var acceptableFiles = [];

                        if (asset.file) {

                            // We have an array of acceptable files? This is likely and error but we will look for the first on in this array
                             if (_util.kindOf(asset.file) === "array") {

                                acceptableFiles = acceptableFiles.concat(createFileArray(asset.file[0], acceptableExt));

                             } else {

                                acceptableFiles = acceptableFiles.concat(createFileArray(asset.file, acceptableExt));
                             }

                        }

                        // Now add the standard component named file
                        acceptableFiles = acceptableFiles.concat(createFileArray(component.name, acceptableExt));

                        var fileObj = false;

                        // Search through this array of files till we find a winner!
                        for (var i = 0, len = acceptableFiles.length; i < len; i++) {

                            // call the search function
                            var temp = singleSearch(component.folder.build, acceptableFiles[i]);

                            // Check to see if we found anything.
                            if (temp.length > 0) {

                                var fileObj = {
                                    filename: acceptableFiles[i],
                                    type: type,
                                    srcPath: component.folder.build,
                                    filePath: temp[0]
                                }

                                // Break the loop here.
                                break;
                            }

                        }

                        // Make sure something was found
                        if (fileObj) {

                            // Add the file to the file list
                            fileList.push(fileObj);
                        }


                        break;

                    // Search for multile files of this type
                    case "multiple":

                        // Check to see if we have defined filename to look for
                        if (asset.file) {

                            // Make sure we have an array to iterate through.
                            var fileArray = (_util.kindOf(asset.file) === "string") ? [asset.file] : asset.file;

                            var acceptableFiles = [];
                            var acceptableExt = []

                            // Loop though each of the files.
                            fileArray.forEach(function(file) {

                                // Constructe the file names to expect.
                                acceptableFiles.push(file + "." + asset.ext);
                                acceptableExt.push(asset.ext);

                                // if acceptable compiled extensions are defined
                                if (asset.compiledExt) {

                                    var extList = (_util.kindOf(asset.compiledExt) === "string") ? [asset.compiledExt] : asset.file;

                                    // Loop through all the acceptable extension types.
                                    extList.forEach(function(ext){

                                        acceptableFiles.push(file + "." + ext);
                                        acceptableExt.push(ext);

                                    });

                                }

                            });

                            var results = _assets.multiple(component.folder.build, type, excludeFiles, acceptableFiles, acceptableExt);

                            if (results.length > 0) {

                                var resultsList = fileList.concat(results);

                                fileList = resultsList;
                            }

                        } else {

                            var acceptableExt = [];

                            // Check for a defindable extension type
                            if (asset.ext) {
                                acceptableExt.push(asset.ext);
                            }

                            // Check for an compiled asset type
                            if (asset.compiledExt) {

                                var extList = (_util.kindOf(asset.compiledExt) === "string") ? [asset.compiledExt] : asset.file;

                                // Loop through all the acceptable extension types.
                                extList.forEach(function(ext){

                                    acceptableExt.push(ext);

                                });

                            }

                            var results = _assets.multiple(component.folder.build, type, excludeFiles, false, acceptableExt);

                            // Only add if there is a returned file
                            if (results.length > 0) {

                                var resultsList = fileList.concat(results);

                                fileList = resultsList;
                            }

                        }

                        break;

                    default:
                        // How to handled other search parameters?
                        break;

                }


            });

            // Place all the found files in the component definition
            component.files["assets"] = fileList;

            // Now that we have found all the distribution files
            // We need to register all the source, files. These paths will be used for
            // Grunt watch tasks. If this is not a production build.
            var srcFiles = _assets.sourceFiles(component.folder.path, excludeFiles);

            component.files["source"] = srcFiles;

        });

        // Move to the next step
        next(rm);
    }

    // Search for all possible components
    return {
        components: components,
        assets: assets
    }

}

module.exports = exports = new find();