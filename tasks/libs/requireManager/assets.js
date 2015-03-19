/***
 * ===
 *  Assets.js
 *  ----------
 *  The assets module is responsible for preforming the search functions to identify asset files.
 * ===
 ***/

'use strict';
var path = require('path');

// Inculde our utility object
var grunt = require('grunt');
var _util = require('../utility');

// Function used to find specific asset files.
var assets = function () {

    // Function recieved basic component information and will attempt to find addest with the same name.
    var single = function (haystack, needle) {

        // Check to see if the haystack has the needle
        //return grunt.file.expandMapping(path.join(haystack, needle), '');
        return grunt.file.expand({filter: 'isFile'}, path.join(haystack, needle));

    };

    var multiple = function(haystack, type, excludeFiles, includeFile, acceptableExt) {

        // Returnable results array.
        var results = [];

        // Recursively search the component build directory
        grunt.file.recurse(haystack, function(abspath, rootdir, subdir, filename) {

            // Make sure the current file is not part of the exclude list or part of the node_module subfolder
            if (excludeFiles.indexOf(filename) === -1 && subdir !== undefined && subdir.indexOf('node_modules/') === -1) {

                // Pull the extension off the compiled filetype
                var fileExt = _util.lastPart(filename, '.');

                // Make sure this is an acceptable file type
                if (acceptableExt.indexOf(fileExt) !== -1) {

                    // Check to see if we should be used include list (true/object)
                    if (includeFile) {

                        // We need to check to see if the include files is in the array
                        if (includeFile.indexOf(filename) !== -1) {

                            var fileObj = {
                                filename: filename,
                                type: type,
                                srcPath: path.join(rootdir, subdir),
                                filePath: abspath
                            };

                        }

                    } else {

                        // Not using the include list so go ahead and include
                        var fileObj = {
                            filename: filename,
                            type: type,
                            srcPath: path.join(rootdir, subdir),
                            filePath: abspath
                        };


                    }

                    // Save the item off!
                    results.push(fileObj);
                }

            }

        });

        return results;

    };

    var sourceFiles = function(haystack, excludeFiles) {

        // Returnable results array.
        var results = [];

        // Recursively search the component build directory
        grunt.file.recurse(haystack, function(abspath, rootdir, subdir, filename) {

            // Make sure the current file is not part of the exclude list or part of the node_module subfolder
            if (excludeFiles.indexOf(filename) === -1) {

                if (subdir !== undefined) {

                    // Make sure to ignore the dist and task folders
                    if (subdir.indexOf('dist') === -1 && subdir.indexOf('task') === -1 && subdir.indexOf('node_modules') === -1) {
                        results.push(abspath);
                    }

                } else {

                    results.push(abspath);
                }

            }

        });

        return results;

    }

    return {
        single: single,
        multiple: multiple,
        sourceFiles: sourceFiles
    };

};

module.exports = exports = new assets();