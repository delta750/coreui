module.exports = function(grunt) {
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
                    'dist/scss/sampleAdvanced.scss': ['src/scss/sampleAdvanced.scss']
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

        // https://github.com/treasonx/grunt-markdown
        // md2html: {
        //     options: {
        //         highlight: 'auto',
        //         template: '../../../cui/docs/src/assets/templates/default.html',
        //         markdownOptions: {
        //             highlight: 'manual', // Other options: 'auto'
        //             gfm: true,
        //         },
        //     },
        //     docs: {
        //         files: [{
        //             expand: true,
        //             cwd: 'src/docs/',
        //             src: ['**/*.md'],
        //             dest: 'dist/docs',
        //             ext: '.html',
        //         }],
        //     },
        // },

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
        },

    });

    // Load the plugin that provides the "uglify" task
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['clean', 'sass', 'jshint', 'copy']);

    // Development
    grunt.registerTask('dev', ['default', 'watch']);
};
