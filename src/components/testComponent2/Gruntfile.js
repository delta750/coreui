module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // Flush dist file every build.
        clean: {
            dist: ['dist']
        },

        concat: {
            // Development only
            devJS: {
                src: [
                        'js/partial2.js',
                        'js/partial1.js'
                    ],
                dest: 'dist/js/components/testComponent2.js',
            }

        }
    });

    // Default task(s).
    grunt.registerTask('default', ['clean', 'concat']);

    // Special grunt task that should be used only when this component is being called by core ui.
    grunt.registerTask('componentBuild', 'This task is called only when main gruntfile calls for it.', function() {

        // Get passed arguments found in the option flags
        var path = grunt.option.flags()[0].split('--path=')[1];

        // Need to change the base path to match where the actual project root is located
        grunt.file.setBase('../../../');

        // Load all its node modules so we dont have to do it in the sub directory.
        require('load-grunt-tasks')(grunt);


        // Reset the path for internal actions
        grunt.file.setBase(path);

        // Execute the default tasks again.
        grunt.task.run('default');

    });

};
