/***
 * ===
 *  Include.js
 *  ----------
 *  The build module is responspible building include asset tasks
 * ===
 ***/

'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');

var include = function() {

    var component = function(component, grunt) {

        var styleTask = false;
        var copyTasks = [];

        // Loop through all of the component files
        component.files.assets.forEach(function(file) {

            // Filter out scripts
            if (file.type !== 'script') {

                switch (file.type) {

                    case 'style':

                        var scssFile;

                        // Check to see if we have a css file to handle
                        if (file.filename.indexOf('.css') !== -1) {

                            // first thing first, we cant actuall us CSS files, so let make a copy of the file into a .cui folder
                            var src = file.filePath;
                            var dest = path.join(component.folder.build, '.cui-temp', file.filename.replace('.css', '.scss'));

                            // Save off the copy tasks
                            copyTasks.push({
                                filename: _util.removeSpecialChar(file.filename),
                                src: src,
                                dest: dest});

                            scssFile = dest;

                        }
                        else {

                            // We can use the file in place.
                            scssFile = file.filePath;
                        }

                        // Lets create the import rule
                        var importRule = '@import "' + scssFile + '";\n';

                        // Append to the component rule;
                        _util.appendToFile('src/cui/scss/_utilities/_components.scss', importRule);

                        // Mark style task as true
                        styleTask = true;

                        break;

                }

            }

        });

        var name;
        var tasks = [];

        // Check to see if any copy tasks are listd (they will be one off tasks)
        // These task need to be added no mater what.
        if (copyTasks.length > 0) {

            var copy = grunt.config.get('copy');

            // Loop through all the tasks
            copyTasks.forEach(function(copyObj) {

                // Create the name with the filename in the name
                name = component.name + '-' + copyObj.filename;

                // Bootstrap the task
                copy[name] = {files: {}};

                // Add the config
                copy[name].files[copyObj.dest] = copyObj.src;

                // Add the task to the task array for watch
                tasks.push('copy:' + name);

            });

            // Save the copy task
            grunt.config.set('copy', copy);

        }

        // Check to see if this is a developer build
        if (!grunt.config.get('prodBuild')) {

            // Check to see if we need to include a build task.
            // If so put it on top!
            if (component.build) {
                tasks.unshift('componentBuild:' + component.folder.path);
            }

            // Style includes build off of the cui style build so we only need to build the dev tasks
            if (styleTask) {

                // Include style task are easy, just rebuild the cui file
                tasks.push('sass:cui');

            }

            if (tasks.length > 0) {

                // Add the requireJS build task as the last peice.
                tasks.push('requirejs');

                var watch = grunt.config.get('watch');

                if (!watch[component.name]) {

                    // Bootstrap the watch task
                    watch[component.name] = {
                        files: [],
                        tasks: []
                    };

                    watch[component.name].files = component.files.source;
                    watch[component.name].tasks = tasks;
                }

                // Save the watch task
                grunt.config.set('watch', watch);

            }

        }

    }

    return {
        component:component,
    };

}

module.exports = exports = new include();