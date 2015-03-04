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
var lazy = module.exports = {};

// This task handles when we know the output should be a single file reference
lazy.singleFile = function(type, taskOptions, component, assetOptions, cb) {

  // A place to save off the results
  var returnObj = {};

  // First lets pull the type assets settings out for easier reference
  var compSettings = (grunt.util.kindOf(component.settings.assets) === "object") ? component.settings.assets[type] : false;

  // Check to see if the developer defined a hard name otherwise per standards the folder name will be used.
  var srcFilename = (compSettings.name) ? compSettings.name : component.rootFolder;

  // Holding area for potential files.
  var potentialFiles = [];

  // Loop through all the possible extensions and get all the files that could be right
  assetOptions.extension.forEach(function(ext){

    var tempName = srcFilename + "." + ext;

    // Go find the needle
    var returnList = findSingleFile(component.rootFolderPath, tempName)

    if (returnList.length > 0) {

        // Merge the arrays for later processing.
        potentialFiles.push.apply( potentialFiles, returnList )
    }

  });

  // Check to see if we got any files back
  if (potentialFiles.length > 0) {

      // Check to make sure only one item came back.
      if (potentialFiles.length === 1) {

          // Pull the result out of the array.
          potentialFiles = potentialFiles[0];

          // Check to see if the end destination is a flat location.
          if (assetOptions.flatten || potentialFiles.subdir.length === 0) {

             var destPath = taskOptions.baseDest;

          } else {

             // We need to keep the subpath, plus we are adding the component folder
             var destPath = path.join(taskOptions.baseDest, assetOptions.loadSource, component.rootFolder, potentialFiles.subdir );

          }

          // Correct the pathing based on the type
          if (type !== "script") {

            // Need to step back one folder because how the distrubution is served.
            returnObj[component.name] = path.join("../", assetOptions.loadSource, component.rootFolder);
          } else {
            returnObj[component.name] = path.join(assetOptions.loadSource, component.rootFolder);
          }

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
      cb("lazy", type, returnObj);
  }

};
