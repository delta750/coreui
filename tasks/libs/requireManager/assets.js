'use strict';

// Inculde our utility object
var _util = require('../utility');

// Function used to find specific asset files.
var assets = function() {

    function properName() {

    }

    // Function recieved basic component information and will attempt to find addest with the same name.
    var singleFile = function(component, type, typeDef) {

        console.log(component);

        console.log("Requesting component: " + component.name + " is looking for a specifc " + type);

        // Check to see if a user defined a different filename, just in case otherwise use component name
        var requestedFile = (typeDef.differentName) ? typeDef.differentName : component.name;

        // Regular expression for filename
        var re = /(?:\.([^.]+))?$/;


        // Check to make sure this is a valid filename
        if (re.exec(requestedFile)) {

            // Add the default extention to the filename
            requestedFile += "." + typeDef.ext;

        }

        // Attempt to go find the resource.
        var file = _util.singleFile(component.srcPath, requestedFile);

        return

    }


    return {
        singleFile: singleFile
    }

}

module.exports = exports = new assets();
