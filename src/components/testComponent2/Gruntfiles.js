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
                dest: 'dist/js/testComponent2.js',
            }

        }
    });

    // Default task(s).
    grunt.registerTask('default', ['clean', 'concat']);

};
