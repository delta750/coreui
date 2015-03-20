/***
 * ===
 *  Lazy.js
 *  ----------
 *  The build module is responspible building lazy loadable asset tasks
 * ===
 ***/

'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');

var lazy = function() {

    var component = function(component, grunt) {

        var styleTask = [];
        var scriptTask = [];
        var copyTasks = [];

        component.files.assets.forEach(function(file) {

            switch (file.type) {

                case "script":

                    // Add the task object
                    scriptTask.push({
                        filename: _util.removeSpecialChar(file.filename),
                        dest: path.join('dist/js/components', file.filename),
                        src: file.filePath
                    })

                    break;

                case "style":

                    var scssFile;

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
                    } else {

                        scssFile = file.filePath;
                    }

                    // Add the task object
                    styleTask.push({
                        filename: _util.removeSpecialChar(file.filename),
                        dest: path.join('dist/css/components', file.filename.replace('.scss', '.css')),
                        src: file.filePath
                    })


                    break;

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
                name = component.name + "-" + copyObj.filename;

                // Bootstrap the task
                copy[name] = {files: {}};

                // Add the config
                copy[name].files[copyObj.dest] = copyObj.src;

                // Add the task to the task array for watch
                tasks.push("copy:" + name);

            });

            // Save the copy task
            grunt.config.set('copy', copy);

        }

        if (scriptTask.length > 0) {

            var uglify = grunt.config.get('uglify');

            scriptTask.forEach(function(scriptObjt) {

                name = component.name + "-" + scriptObjt.filename;

                uglify[name] = {files: {}};

                uglify[name].files[scriptObjt.dest] = scriptObjt.src;

                tasks.push("uglify:" + name);

            });

            // Save the copy task
            grunt.config.set('uglify', uglify);

        }


        // Check to see if we have style tasks
        if (styleTask.length > 0) {

            var sass = grunt.config.get('sass');

            styleTask.forEach(function(styleObj) {

                name = component.name + "-" + styleObj.filename;

                sass[name] = {files: {}};

                sass[name].files[styleObj.dest] = styleObj.src;

                tasks.push("sass:" + name);

            });


            // Save the copy task
            grunt.config.set('sass', sass);

        }

        // Check to see if this is a developer build
        if (!grunt.config.get('prodBuild')) {

            // Check to see if we need to include a build task.
            // If so put it on top!
            if (component.build) {
                tasks.unshift("componentBuild:" + component.folder.path);
            }

            if (tasks.length > 0) {

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
        component: component
    }

}

module.exports = exports = new lazy();