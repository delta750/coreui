module.exports = function (grunt) {
    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),

        clean: {
            dist: [
                'dist/**/*.*',
            ],
        },

        copy: {
            scripts: {
                expand: true,
                cwd: 'src/js',
                src: ['**.js'],
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

            cui: {
                files: {
                    'dist/css/modal.css': ['src/scss/modal.scss']
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

        md2html: {
            docs: {
                options: {
                    layout: 'src/cui/docs/src/assets/templates/default.html',
                },
                files: [{
                    expand: true,
                    cwd: 'src/cui/docs/src',
                    src: ['**/*.md'],
                    dest: 'docs',
                    ext: '.html',
                }],
            },
        },
    });

    // Load the plugin that provides the "uglify" task
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder
    grunt.loadTasks('tasks');

    // Default task(s)
    grunt.registerTask('default', ['jshint', 'clean', 'copy', 'sass', 'md2html']);

};
