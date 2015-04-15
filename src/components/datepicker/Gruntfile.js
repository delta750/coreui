module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // Flush dist file every build.
        clean: {
            dist: ['dist']
        },

        uglify: {
            component: {
                options: {
                    sourceMap: false,
                    compress: {
                        drop_console: true,
                    },
                },
                files: {
                    'dist/js/datepicker.js': ['js/datepicker.js'],
                },
            },
        },

        sass: {
            // Global options
            options: {
                sourceMap: false, // No source maps by default

                // Cannot use "compressed" until this bug is resolved, otherwise media queries will be empty: https://github.com/sindresorhus/grunt-sass/issues/152
                // That's fixed in v0.17.0, but that version introduces another Windows 7-related bug
                outputStyle: 'nested', // Options: nested, compressed
            },

            // Production task
            component: {
                files: {
                    'dist/css/datepicker.css': 'scss/datepicker.scss',
                },
            },
        },

        copy: {
            images: {
                expand: true,
                cwd: 'images/',
                src: [
                        '*.*',
                    ],
                dest: 'dist/images/component/datepicker',
                filter: 'isFile',
                flatten: false,
            },
        },
    });

    // Load resources locally
    require('load-grunt-tasks')(grunt);

    // Local tasks
    grunt.loadTasks('tasks');

    // Default task(s).
    grunt.registerTask('default', ['clean', 'uglify', 'sass', 'copy']);

};