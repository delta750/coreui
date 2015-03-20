module.exports = function(grunt) {

    'use strict';

    var path = require('path');
    var _util = require('./libs/utility');

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

                        grunt.log.ok('Gruntfile file found in component folder: ' + componentFolder);

                        // We know we have a component build process, now we need to check for the componentBuild task
                        if (grunt.file.exists(taskFolder)) {

                            runComponentBuild(componentFolder);

                        } else {

                            var source = _util.unixifyPath('tasks/libs/componentBuild.js');
                            var dest = _util.unixifyPath(componentBuild);

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