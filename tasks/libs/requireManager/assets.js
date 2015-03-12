'use strict';

// Inculde our utility object
var _util = require('../utility');

// Function used to find specific asset files.
var assets = function () {

    // function properName() {

    // }

    // Function recieved basic component information and will attempt to find addest with the same name.
    var singleFile = function (component, type, typeDef) {

        // Check to see if a user defined a different filename, just in case otherwise use component name
        var sourceFile = (typeDef.differentName) ? typeDef.differentName : component.name;

        // Regular expression for filename
        var re = /(?:\.([^.]+))?$/;

        var requestedFile;

        // Check to make sure this is a valid filename
        if (re.exec(sourceFile)) {

            // Add the default extention to the filename
            requestedFile = sourceFile + '.' + typeDef.ext;

        }
        else {

            requestedFile = sourceFile;

            // We want to preserve the name of the file without the
            sourceFile = sourceFile.split('.')[0];

        }

        // Attempt to go find the resource.
        var file = _util.singleFile(component.srcPath, requestedFile, sourceFile);

        return file;
    };

    return {
        singleFile: singleFile
    };

};

module.exports = exports = new assets();