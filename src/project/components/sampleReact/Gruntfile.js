module.exports = function (grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: [
                'dist/**/*.*',
            ],
            jsCompiled: [
                'src/js-compiled/**/*.*',
            ],
        },

        copy: {
            maps: {
                expand: true,
                cwd: 'src/js-compiled',
                src: ['**/*.map'],
                dest: 'dist/js',
                filter: 'isFile',
            },
            tests: {
                expand: true,
                cwd: 'src/tests',
                src: ['**/*.*'],
                dest: 'dist/tests',
                filter: 'isFile',
            },
        },

        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'nested', // Options: 'nested', 'compressed' (minified)
            },

            main: {
                files: {
                    'dist/scss/timer.scss': ['src/scss/timer.scss']
                },
            },
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        // Supported options: http://jshint.com/docs/
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
            },
            files: [
                'src/js/**/*.js',
            ],
        },

        babel: {
            options: {
                sourceMap: 'inline',
            },
            dist: {
                files: [{
                    'expand': true,
                    'cwd': 'src/jsx',
                    'src': ['**/*.jsx'],
                    'dest': 'src/js-compiled',
                    'ext': '.js',
                }],
            },
        },

        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/js',
                    name: 'timer',
                    paths: {
                        'App': '../js-compiled/App',
                        'TimeMessage': '../js-compiled/TimeMessage',
                        'cui': 'empty:',
                        'jquery': 'empty:',
                        'react': 'empty:',
                        'react-dom': 'empty:',
                        'reactdom': 'empty:',
                    },
                    optimize: 'none',
                    out: 'dist/js/timer.js',
                },
            },
        },

        watch: {
            options: {
                livereload: 35728,
                interrupt: true,
            },

            styles: {
                files: [
                    '*.scss', // Settings file
                    'src/**/*.scss',
                ],
                tasks: [
                    'sass',
                    'copy',
                ],
            },

            scripts: {
                files: [
                    'src/js/**/*.js',
                ],
                tasks: [
                    'jshint',
                    'copy',
                ],
            },
        },

    });

    // Load all Grunt plugins
    require('load-grunt-tasks')(grunt);

    // Default task
    grunt.registerTask('default', ['jshint', 'clean', 'sass', 'babel', 'requirejs', 'copy', 'clean:jsCompiled', 'jshint']);

    // Development task
    grunt.registerTask('dev', ['default', 'watch']);
};
