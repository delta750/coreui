module.exports = function (grunt) {
    // Project configuration
    grunt.initConfig({
        // Remove temporary development files
        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            options: {
                force: true,
            },
            compiled: [
                'assets/**/*.*',
                'core/**/*.html',
                'components/**/*.html',
                'project/**/*.html',
                '!src/**/*.html',
            ],
        },

        copy: {
            docs: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/assets/css',
                        src: ['**/*.css'],
                        dest: 'assets/css',
                        filter: 'isFile',
                        flatten: true,
                    },
                    {
                        expand: true,
                        cwd: 'src/assets/images',
                        src: ['**/*.*'],
                        dest: 'assets/images',
                        filter: 'isFile',
                        flatten: true,
                    },
                ],
            },
        },

        // Local server at http://localhost:8888
        // https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            server: {
                options: {
                    livereload: true,
                    port: 8888,
                    hostname: 'localhost',
                },
            },
        },

        md2html: {
            options: {
                highlightjs: {
                    enabled: true,
                    style: 'github',
                    compressStyle: true,
                },
            },
            docs: {
                options: {
                    layout: 'src/assets/templates/default.html',
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    src: ['**/*.md'],
                    dest: '',
                    ext: '.html',
                }],
            },
        },

        watch: {
            options: {
                livereload: true,
                interrupt: true,
                spawn: false
            },

            // Docs
            docs: {
                files: [
                    'src/**/*.*',
                ],
                tasks: [
                    'md2html',
                    'copy',
                ],
            },

            // Task is used with development builds to keep the connect server running
            noop: {
                files: [
                    'README.md',
                ],
            },
        },
    });

    ///////////
    // Tasks //
    ///////////

    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    // Development
    grunt.registerTask('dev', 'Development', function (args) {
        grunt.task.run([
            'clean',
            'md2html',
            'copy',
            'connect',
            'watch',
        ]);
    });

    // Build documentation
    grunt.registerTask('dist', 'Build documentation', function (args) {
        grunt.task.run([
            'clean',
            'md2html',
            'copy',
        ]);
    });

    // Simple web server
    grunt.registerTask('server', 'Server', ['connect', 'watch:noop']);

    // Set the default task to the documentation build
    grunt.registerTask('default', 'dev');
};
