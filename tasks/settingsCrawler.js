'use strict';

var path = require('path');
//var fs = require('fs');

// Require Libraries

module.exports = function(grunt) {

  var componentPaths = {};
  var defaultSettings = {};
  var requireBuild = {
    "libs": {
        "requireLib": "vendor/requirejs",
        "jquery": "vendor/jquery",
        "domReady": "vendor/domReady",
        "text": "vendor/text",
        "lazyLoader": "utilities/lazyLoader",
        "json": "vendor/json",
        "css": "vendor/css",
        "cui": "cui"
    },
    "include": ["requireLib", "jquery", "domReady", "text", "lazyLoader", "json", "css"]
  };

  grunt.registerMultiTask('settingsCrawler', 'Crawl folder structure looking for settings JSON files', function(){

    var options = this.options({
      distLocation: 'components/',
      buildFile: 'src/cui/js/build.json',
      pathsFile: 'src/cui/js/paths.json'
    });

    function writeJSON(data, dest, cb) {

      var jsonStr = JSON.stringify(data, null, 4);

      grunt.file.write(dest, jsonStr + '\n');

      cb();

    }

    function buildPath(base, asset, css) {

      if (css) {
        return path.join('../css', base, asset);
      } else {
        return path.join(base, asset);
      }

    }

    // Loop through all of the different settings files based on path given
    this.filesSrc.forEach(function(f) {

      console.log(f);

      // Read the current file in
      var settingsFile = grunt.file.readJSON(f);

      if (settingsFile.lazyLoadable) {

        var script = settingsFile.script,
            style = settingsFile.style;

        // Script check
        if (script !== undefined) {
          componentPaths[settingsFile.name] = buildPath(options.distLocation, script, false);
        }

        // Style check
        if (style !== undefined) {
          componentPaths[settingsFile.name + "Style"] = buildPath(options.distLocation, style, true);
        }

      }

    });

    // Create the components path file
    writeJSON(componentPaths, options.pathsFile, function() {

      grunt.log.ok("paths.json has been written");

    });


    // Create the json file used by the requirejs grunt task
    writeJSON(requireBuild, options.buildFile, function() {

      grunt.log.ok("build.json has been written");

    });

  });

};
