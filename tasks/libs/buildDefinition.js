// Node Libraries
var fs = require('fs');

// Third Party Libs
var grunt = require('grunt');

// Internal Libraries
var _utility = require('./utility');

// Define the module
var buildDefinition = module.exports = {};

buildDefinition.buildFile = function(includeObj, options, taskOptions) {

  // Build Settings
  var buildSettings = {
    baseBuild: 'tasks/libs/partials/baseBuild.json',
    output: 'tasks/libs/temp/build.json'
  };

  // Pull the new base build settings into the folder
  var baseBuild = grunt.file.readJSON(buildSettings.baseBuild);

  // Check to see if the include object has content.
  if (includeObj) {

    // Loop through all the requested items
    Object.keys(includeObj).forEach(function(item){

      // check to see if the same key exists in the build already
      if (!baseBuild.libs[item]) {

        // Add the name and path to the libs section
        baseBuild.libs[item] = includeObj[item];

        // Add the name to the include array
        baseBuild.include.push(item);

      }

    });

    buildSettings.output = _utility.unixifyPath(buildSettings.output);

    // Now that the contents have been defined we need to write the file out.
    var buffer = new Buffer(JSON.stringify(baseBuild, null, 4));

    fs.writeFileSync(buildSettings.output, buffer);

    return (baseBuild);

    console.log("Build file created!");

  };

}
