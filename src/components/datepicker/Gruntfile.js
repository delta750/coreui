module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({

        // Flush dist file every build.
        clean: {
            dist: ['dist']
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
            prod: {
                files: {
                    'dist/css/datepicker.css': 'scss/datepicker.scss',
                },
            },

        }
    });

    // Default task(s).
    grunt.registerTask('default', ['clean', 'sass']);

};
