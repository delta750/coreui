// Native Node Libraries
var path = require('path');

// Third Party Libraries
var chalk = require('chalk');
var grunt = require('grunt');

// Internal Libraries
var _utility = require('./utility');

// Function will recursively search for a specific file in a give root directory
function findSingleFile(haystake, needle) {

  var results = [];

  grunt.file.recurse(haystake, function(abspath, rootdir, subdir, filename) {

      if (filename === needle) {

          // Return a full object of info
          var temp = {
              srcPath: abspath,
              subdir: subdir,
              filename: filename
          }

          // Add object to results
          results.push(temp);

      }

  });

  return results;

}


// Define the module
var include = module.exports = {};

// This task handles when we know the output should be a single file reference
include.singleFile = function(type, taskOptions, component, assetOptions, cb) {

    var includeSettings = {
      trimPath: "src/"
    };

    // A place to save off the results
    var returnObj = {};

    // First lets pull the type assets settings out for easier reference
    var compSettings = (grunt.util.kindOf(component.settings.assets) === "object") ? component.settings.assets[type] : false;

    // Check to see if the developer defined a hard name otherwise per standards the folder name will be used.
    var srcFilename = (compSettings.name) ? compSettings.name : component.rootFolder;

    // Holding area for potential files.
    var includeFiles = [];

    // Loop through all the possible extensions and get all the files that could be right
    assetOptions.extension.forEach(function(ext){

      var tempName = srcFilename + "." + ext;

      // Go find the needle
      var returnList = findSingleFile(component.rootFolderPath, tempName)

      if (returnList.length > 0) {

          // Merge the arrays for later processing.
          includeFiles.push.apply( includeFiles, returnList )
      }

    });

    // Check to see if we got any files back
    if (includeFiles.length > 0) {

        // Check to make sure only one item came back.
        if (includeFiles.length === 1) {

            // Pull the result out of the array.
            includeFiles = includeFiles[0];

            var srcPath = includeFiles.srcPath.replace(includeSettings.trimPath, "");

            // Now we only care about the proper name and source
            returnObj[component.name] = srcPath;


        } else {

            // In this case too many files returned!
            // === Enhancement determine which is correct ===
            grunt.log.warn( chalk.yellow("Detected too many (" + potentialFiles.length + ") potential " + type + " files under " + component.name + " folder") );

            returnObj = false;
        }

    } else {

        // No files returned error out to the screen. But only show them if settings were defined.
        // === Enhancement Add default filenames back ===
        if (compSettings){
            grunt.log.warn( chalk.yellow("No source " + type + " files found under " + component.name + " folder") );
        }

        returnObj = false;
    }

    if (typeof(cb) === "function") {;
        cb("include", type, returnObj);
    }

}
