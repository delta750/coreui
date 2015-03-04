module.exports = function(grunt) {

    'use strict';

    var path = require('path');

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'subGrunt',
        'This multitaks handles the calling of component that have their own build processes',
        function () {

            var gruntFile = 'Gruntfile.js';

            // Iterate the component folders
            this.files.forEach(function(folders) {

                var sourcePath = folders.cwd;

                folders.src.forEach(function(folder) {

                    var componentFolder = path.join(sourcePath, folder);
                    var gruntFilePath = path.join(componentFolder, gruntFile);

                    if (grunt.file.exists(gruntFilePath)) {
                        grunt.log.ok('Gruntfile file found in component folder: ' + componentFolder);

                        grunt.task.run('componentBuild:' + componentFolder);
                    }

                });

            });

        }
    );

};