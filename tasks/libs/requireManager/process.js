'use strict';
var path = require('path');

// Inculde our utility object
var _util = require('../utility');

// Function used to find specific asset files.
var process = function () {

    function formatName(string) {

        // Since it multiple, we will use the name as out base
        // Remove all extensions and min names parts
        var string = string.split('.')[0];

        // split the name on any hypens
        var stringParts = string.split('-');

        for (var i = 0, len = stringParts.length; i < len; i++) {

            if (i !== 0) {
                stringParts[i] = _util.uCaseFirst(stringParts[i]);
            }

        }

        return stringParts.join('');

    }

    function cleanUpFilename(fileDef) {

        // Check if the filetype is a script
        if (fileDef.type === 'script') {

            return fileDef.filename.substr(0, fileDef.filename.lastIndexOf('.'));

        }
        else if (fileDef.type === 'style') {

            return fileDef.filename.replace('.scss', '.css');

        }
        else {

            return fileDef.filename;
        }

    }

    function cleanUpFilePath(fileDef) {

        // Clean up the filename first

        var filePath = "";

        // Check if the filetype is a script
        if (fileDef.type === 'script') {

            filePath = fileDef.filePath.substr(0, fileDef.filePath.lastIndexOf('.'));

        }
        else {

            filePath = fileDef.filePath;
        }

        // Remove souce from the path if it exists

        if (filePath.indexOf('src/') !== -1) {
            filePath = filePath.replace('src/', '');
        }

        return filePath;

    }

    // This function uses the component definition information to construct the proper lazy path definitions.
    // These definitions are used later inside of the settings.js file created by requireManager.
    function lazyComponent(component, rm) {

        // Loop through and process the indivdual files.
        component.files.assets.forEach(function(file) {

            // Pull the load path
            var loadDirectory = component.assets[file.type].lazyPath;

            // Depending on the search type we change how the load string is formed
            if (component.assets[file.type].search === 'single') {

                // Check to see if the component name is used yet.
                if (rm.lazyComponent[component.name]) {

                    var tempName = component.name + _util.uCaseFirst(file.type);

                    // Check to see if the component name with the asset type included is used
                    if (!rm.lazyComponent[tempName]) {

                        // Use the component name and the asset type
                        rm.lazyComponent[tempName] = _util.unixifyPath(path.join(loadDirectory, cleanUpFilename(file)));
                    }

                }
                else {

                    // The component name is not in use
                    rm.lazyComponent[component.name] = _util.unixifyPath(path.join(loadDirectory, cleanUpFilename(file)));

                }

            }
            else {

                var filename = formatName(file.filename);

                if (rm.lazyComponent[filename]) {

                    var tempName = filename + _util.uCaseFirst(file.type);

                    if (!rm.lazyComponent[tempName]) {

                        // Use the component name and the asset type
                        rm.lazyComponent[tempName] = _util.unixifyPath(path.join(loadDirectory, cleanUpFilename(file)));
                    }

                }
                else {

                    rm.lazyComponent[filename] = _util.unixifyPath(path.join(loadDirectory, cleanUpFilename(file)));
                }

            }

        });

    }

    // This function uses the component definition to create the internal path defintions for the resource used
    // during the requireJS grunt task build.
    function includeComponent(component, rm) {

        // Loop through each file
        component.files.assets.forEach(function(file) {

            // We will use the component name for the include name
            var includeName = component.name;

            // Filter out only scripts here. We need to handle other files differently.
            if (file.type === 'script') {

                // Depending on the search type we change how the load string is formed
                if (component.assets[file.type].search === 'single') {

                    // Check to see if the component name is used yet.
                    if (rm.includeComponent[component.name]) {

                        var tempName = component.name + _util.uCaseFirst(file.type);

                        // Check to see if the component name with the asset type included is used
                        if (!rm.includeComponent[tempName]) {

                            // Use the component name and the asset type
                            rm.includeComponent[tempName] = cleanUpFilePath(file);
                        }

                    }
                    else {

                        // The component name is not in use
                        rm.includeComponent[component.name] = cleanUpFilePath(file);

                    }

                }
                else {

                    var filename = formatName(file.filename);

                    if (rm.includeComponent[filename]) {

                        var tempName = filename + _util.uCaseFirst(file.type);

                        if (!rm.includeComponent[tempName]) {

                            // Use the component name and the asset type
                            rm.includeComponent[tempName] = cleanUpFilePath(file);
                        }

                    }
                    else {

                        rm.includeComponent[filename] = cleanUpFilePath(file);
                    }

                }

            }

        });

    }

    // Function recieved basic component information and will attempt to find addest with the same name.
    var components = function (rm, next) {

        var options = rm.options;
        var grunt = rm.grunt;
        var task = rm.task;

        // Indicate the step started.
        _util.console('ok', 'Process Component Files');

        // Loop through the component folders
        rm.definedComponents.forEach(function(component) {

            // We neeed to determine what action are going to happen based of the component
            // Load type
            if (component.lazy) {

                lazyComponent(component, rm);

            }
            else {

                includeComponent(component, rm);

            }

        });

        next(rm);
    };

    return {
        components: components,
    };

};

module.exports = exports = new process();