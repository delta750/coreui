// Native Node Libraries
var path = require('path');
var fs = require('fs');

// Third Party Libraries
var chalk = require('chalk');
var grunt = require('grunt');

// Internal Libraries
var _utility = require('./utility');

// Steps in the execution process
var steps = [];

// Function controls the opening anoynmous function code.
function wrapperBeginning(settings, next) {
    var wrapperText = "(function () {\n";

    //console.log(settings);

    _utility.writeString(settings.file, wrapperText, function() {

        // Move to the next step
        next();

    });
}

// Function controls the baseurl code
function baseURL(settings, next) {

    var baseUrlText = "var scripts = document.getElementById('require'),\n" +
                      "src = scripts.src,\n" +
                      "baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf('/cui'));\n";

      _utility.writeString(settings.file, baseUrlText, function() {

          // Move to the next step
          next();

      });
}

// Function controls the require config code
function requireConfig(settings, next) {

    var requireText = "require.config({ baseUrl: baseUrl, paths:";
    var requireTextClosure = "\n});\n"


    // Add the first part
    _utility.writeString(settings.file, requireText, function() {

        // Create a buffer of the paths object.
        buffer = new Buffer(JSON.stringify(settings.paths, null, 4));

        // Add the ending config
        _utility.writeString(settings.file, buffer, function() {

            // Add the ending config
            _utility.writeString(settings.file, requireTextClosure, function() {

                next();

            });

        });

    });

};

// Merge in the base requirejs fuction that loads on ever page.
function mergeInit(settings, next) {

    _utility.mergeFile(settings.cuiInit, settings.file, function(err) {

        next();

    });

}

// Function controls the ending anoynmous function code.
function wrapperEnding(settings, next) {
    var wrapperText = "}());";

    _utility.writeString(settings.file, wrapperText, function() {

        // Move to the next step
        next();

    });
}

function runSteps(steps, settings) {

    if (steps.length > 0) {

        // Pull the next/first item off of the array
        var step = steps.splice(0,1)[0];

        // Execute this step and pass it all the info it should need.
        step(settings, function() {

            // Call back function to kick off next task.
            runSteps(steps, settings);

        });

    }

}

// Define the module
var writeSettings = module.exports = {};

writeSettings.settingsFile = function(lazyObjs, options, taskOptions) {

  // Write options.
  var writeOptions = {
    wrapper: true,
    baseURL: true,
    tempfolder: 'tasks/libs/temp',
    file: 'tasks/libs/temp/settings.js',
    cuiInit: 'tasks/libs/partials/init.js',
    paths: lazyObjs
  };

  // Check to see if a existing setting file is in place, if so delete it
  if (grunt.file.exists(writeOptions.file)) {

      // Delete the item if we dont need it.
      grunt.file.delete(writeOptions.file);

  } else {

    // Check to see if the setting folder exists so files can be properly made.
    if (!grunt.file.exists(tempfolder)) {
      grunt.file.mkdir(tempfolder);
    }

  }

  // Check to see if we want to include a wrapper
  if (writeOptions.wrapper) {
      steps.push(wrapperBeginning);
  };

  // check to see if we want to include the base URL code.
  if (writeOptions.baseURL) {
      steps.push(baseURL);
  };

  // Add the requireconfig section as that required for all settings files
  steps.push(requireConfig);

  // Merge
  steps.push(mergeInit);

  // Check to see if we needed to include the end wrapper
  if (writeOptions.wrapper) {
      steps.push(wrapperEnding);
  };

  // Piece the settings file together.
  runSteps(steps, writeOptions);

};
