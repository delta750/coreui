module.exports = function (grunt) {
    // Project configuration
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: ['dist/**/*.*'],
        },

        copy: {
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**/*.*'],
                dest: 'dist/js',
                filter: 'isFile',
                flatten: true,
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
                outputStyle: 'nested', // Options: nested, compressed
            },

            main: {
                files: {
                    'dist/scss/dropdown.scss': ['src/scss/dropdown.scss']
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
                loopfunc: true,
            },
            files: [
                'src/js/**/*.js',
            ],
        },

        md2html: {
            docs: {
                options: {
                    layout: 'src/cui/docs/src/assets/templates/default.html',
                    highlightjs: {
                        enabled: true,
                        style: 'github',
                        compressStyle: true,
                    },
                    gfm: true,
                },
                files: [{
                    expand: true,
                    cwd: 'src/docs/',
                    src: ['**/*.md'],
                    dest: 'dist/docs',
                    ext: '.html',
                }],
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
                    'src/**/*.js',
                ],
                tasks: [
                    'jshint',
                    'copy',
                ],
            },

            docs: {
                files: [
                    'src/docs/**/*.*',
                ],
                tasks: [
                    'markdown',
                    'copy',
                ],
            },
        },

    });

    // Load all grunt tasks
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['jshint', 'clean', 'sass', 'markdown', 'copy']);

    // Development
    grunt.registerTask('dev', ['default', 'watch']);
};
