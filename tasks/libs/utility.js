// var path = require('path');
var fs = require('fs');

// Third Party Libs
var grunt = require('grunt');

// Declare this module
var util = module.exports = {};

/***
 * String Functions
 ***/

// Capitialize the first letter of a string
util.uCaseFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};

/***
 * Object Functions
 ***/

// Merge two javascript objects into the first.
util.merge = function(obj1, obj2) {

    for (var p in obj2) {

        try {
            // Property in destination object set; update its value.
            if (obj2[p].constructor === Object) {

                if (obj1[p].constructor !== Object) {
                    obj1[p] = {};
                }
                obj1[p] = util.merge(obj1[p], obj2[p]);

            }
            else {
                obj1[p] = obj2[p];
            }

        }
        catch (e) {

            // Property in destination object not set; create it and set its value.
            obj1[p] = obj2[p];

        }
    }

    return obj1;

};

util.kindOf = function(obj) {

    return grunt.util.kindOf(obj);

}

/***
 * Path Cleanup Utilties
 ***/

// Function converts all paths into a common unix like structure.
util.unixifyPath = function(filepath) {

    if (process.platform === 'win32') {
        return filepath.replace(/\\/g, '/');
    }
    else {
        return filepath;
    }

};

/***
 * Search File Utilities
 ***/

// Function will recursively search for a specific file in a give root directory
util.singleFile = function(haystake, needle, source) {

    // Collect everything from here.
    var results = [];

    // use the grunt utility to find the file being requrest
    grunt.file.recurse(haystake, function(abspath, rootdir, subdir, filename) {

        if (filename === needle) {

            // Add a full object of info to results
            results.push({
                source: source,
                srcPath: abspath,
                subdir: subdir,
                filename: filename
            });
        }

    });

    if (results.length === 1) {
        return results[0];
    }

    return false;

}

/***
 * Write File utilites
 ***/

util.appendToFile = function(filePath, data) {

    var buffer;

    // Create buffer of string
    if (!Buffer.isBuffer(data)) {
        buffer = new Buffer(data, 'utf-8');
    }
    else {
        buffer = data;
    }

    // Fix the pathing
    filePath = this.unixifyPath(filePath);

    // Create or append to the file.
    fs.appendFileSync(filePath, buffer);

}

util.mergeFile = function(target, source) {

    console.log("merge called");

    // Get the source file path and clean it up
    source = this.unixifyPath(source);

    // Pull the content out of the file
    var content = fs.readFileSync(source);

    // Merge by using append.
    this.appendToFile(target, content);

};
