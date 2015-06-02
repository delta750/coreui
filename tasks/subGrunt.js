module.exports = function(grunt) {

    'use strict';

    // Native modules
    var path = require('path');

    // Custome modules
    var fs = require('./libs/utilites/fs');
    var verbose = require('./libs/utilites/verbose');

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'subGrunt',
        'This multitaks handles the calling of component that have their own build processes',
        function () {

            var gruntFile = 'Gruntfile.js';
            var componentBuildTask = 'componentBuild.js'

            // Function to run the components default task
            function runComponentBuild(folder) {
                grunt.task.run('componentBuild:' + folder);
            }

            // Iterate the component folders
            this.files.forEach(function(folders) {

                var sourcePath = folders.cwd;

                // Loop through all of the component folders
                folders.src.forEach(function(folder) {

                    // Create paths for the future.
                    var componentFolder = path.join(sourcePath, folder);
                    var gruntFilePath = path.join(componentFolder, gruntFile);
                    var taskFolder = path.join(componentFolder, 'tasks');
                    var componentBuild = path.join(taskFolder, componentBuildTask);

                    if (grunt.file.exists(gruntFilePath)) {

                        grunt.log.ok('Gruntfile file found in asset folder: ' + componentFolder);

                        // We know we have a component build process, now we need to check for the componentBuild task
                        if (grunt.file.exists(taskFolder)) {

                            runComponentBuild(componentFolder);

                        } else {

                            verbose.log(0, "Asset build file found in: " + componentFolder + ", but its missing the componement build task." , "warn");

                            var source = fs.unixifyPath('tasks/libs/utilites/componentBuild.js');
                            var dest = fs.unixifyPath(componentBuild);

                            // component needs the extra task, so lets manually inject it into that project.
                            grunt.file.copy(source, dest);

                            // Now run the build task.
                            runComponentBuild(componentFolder);

                        }


                    }

                });

            });

        }
    );

};