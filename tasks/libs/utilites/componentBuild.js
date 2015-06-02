module.exports = function(grunt) {

    'use strict';

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerTask(
        'componentBuild',
        'Special task used to link component builds to main CUI resources.',
        function () {

            // Get passed arguments found in the option flags
            var path = grunt.option.flags()[0].split('--path=')[1];

            // Need to change the base path to match where the actual project root is located
            grunt.file.setBase('../../../../');

            // Load all its node modules so we dont have to do it in the sub directory.
            require('load-grunt-tasks')(grunt);

            // Reset the path for internal actions
            grunt.file.setBase(path);

            // Execute the default tasks again.
            grunt.task.run('default');

        }
    );

};