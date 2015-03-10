module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // Flush dist file every build.
        clean: {
            dist: ['dist']
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: "./js/",
                    name: 'testComponent2',
                    optimize: 'none',
                    paths: {
                        jquery: "empty:",
                        cui: "empty:"
                    },
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    out: 'dist/js/testComponent2.js',
                }
            }
        }
    });

    // Load resources locally
    require('load-grunt-tasks')(grunt);

    // Local tasks
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'requirejs']);

};
