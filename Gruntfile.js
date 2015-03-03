module.exports = function(grunt) {
    var

        // Banner for JavaScript files
        // The info comes from package.json -- see http://gruntjs.com/configuring-tasks#templates for more about pulling in data from files
        jsBanner = '/*! <%= pkg.title %>\n' +
                   ' *  @description  <%= pkg.description %>\n' +
                   ' *  @version      <%= pkg.version %>.REL<%= grunt.template.today("yyyymmdd") %>\n' +
                   ' *  @copyright    <%= grunt.template.today("yyyy") %> ' +
                   '<%= pkg.author.name %>\n */\n',

        // This banner will appear at the top style sheets
        cssBanner = '@charset "utf-8";\n' + jsBanner,

        // Insert the Live Reload script
        liveReloadInjection =
            '\n(function(){' +
                'var s = document.createElement("script");' +
                's.src="//localhost:35729/livereload.js";' +
                'document.head.appendChild(s);' +
            '}());';

    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    /////////////////////////////
    // Configure Grunt plugins //
    /////////////////////////////

    // See http://gruntjs.com/configuring-tasks for general info about configuring plugins/tasks

    grunt.initConfig({
        // All Grunt modules must be listed in the `package.json` file
        pkg: grunt.file.readJSON('package.json'),

        // Object to hold the requireBuilds.
        requireBuild: {
          paths: {},
          includes: []
        },

        // JS linting
        // https://github.com/gruntjs/grunt-contrib-jshint
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                eqnull: true,
                browser: true,
                expr: true,
                unused: false,
                scripturl: true,
                evil: true,
                globals: {
                    jQuery: true,
                    cui: true,
                    module: true,
                },
            },
            files: [
                'src/**/*.js',
                '!src/cui/js/vendor/*.js'
            ]
        },

        // Minify and concatenate JS files
        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            // Global uglify options
            options: {
                banner: jsBanner,
                preserveComments: 'some',
                sourceMap: true,
                mangle: false, // We need the variable names to be unchanged so other scripts (i.e. in-page `<script>` tags) can reference them
            },

            devVendor: {
              files: {
                'dist/js/vendor/html5shiv.js': ['src/cui/js/vendor/html5shiv.js'],
                'dist/js/vendor/kind.js': ['src/cui/js/vendor/kind.js']
              }
            },

            devComponents: {
                files: [{
                    expand: true,
                    cwd: 'src',
                    dest: 'dist/js/components/',
                    src: ['components/*/js/**/*.js'],
                    flatten: true,
                }],
            },

            prodVendor: {
                options: {
                    sourceMap: false,
                    compress: {
                        drop_console: true,
                    },
                },
                files: {
                  'dist/js/vendor/html5shiv.js': ['src/cui/js/vendor/html5shiv.js'],
                  'dist/js/vendor/kind.js': ['src/cui/js/vendor/kind.js']
                }
            },

            prodComponents: {
                options: {
                    sourceMap: false,
                    compress: {
                        drop_console: true,
                      },
                },
                files: [{
                    expand: true,
                    cwd: 'src',
                    dest: 'dist/js/components/',
                    src: ['components/*/js/**/*.js'],
                    flatten: true,
                }],
            },

        },

        // Styles
        // https://github.com/sindresorhus/grunt-sass
        sass: {
            // Global options
            options: {
                sourceMap: false, // No source maps by default

                // Cannot use "compressed" until this bug is resolved, otherwise media queries will be empty: https://github.com/sindresorhus/grunt-sass/issues/152
                // That's fixed in v0.17.0, but that version introduces another Windows 7-related bug
                outputStyle: 'nested', // Options: nested, compressed
            },

            // Development task
            dev: {
                options: {
                    sourceMap: true, // Enable source maps
                    outputStyle: 'nested',
                },
                files: {
                    'dist/css/cui/cui.css': 'src/cui/scss/cui.scss',
                    'dist/css/project/project.css': 'src/project/scss/project.scss',
                },
            },

            devComponents: {
                options: {
                    sourceMap: true, // Enable source maps
                    outputStyle: 'nested',
                },
                files: [{
                  expand: true,
                  flatten: true,
                  cwd: 'src/components/',
                  src: ['**/*.scss'],
                  dest: 'dist/css/components/',
                  ext: '.css',
                }]
            },

            // Production task
            prod: {
                files: {
                    'dist/css/cui/cui.css': 'src/cui/scss/cui.scss',
                    'dist/css/project/project.css': 'src/project/scss/project.scss',
                },
            },

            prodComponents: {
                files: [{
                  expand: true,
                  flatten: true,
                  cwd: 'src/components/',
                  src: ['**/*.scss'],
                  dest: 'dist/css/components/',
                  ext: '.css',
                }]
            },

        },

        // Add banner to CSS files
        // The sass plugin doesn't allow us to add a banner so we need this to insert the version number at the top
        // https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            core: {
                options: {
                    // stripBanners: true,
                    banner: cssBanner,
                },
                src: ['dist/css/cui/cui.css'],
                dest: 'dist/css/cui/cui.css',
            },
            project: {
                options: {
                    // stripBanners: true,
                    banner: cssBanner,
                },
                src: ['dist/css/project/project.css'],
                dest: 'dist/css/project/project.css',
            },

            // Development only
            devJS: {
                options: {
                    footer: liveReloadInjection,
                },
                src: ['dist/js/cui.js'],
                dest: 'dist/js/cui.js',
            }
        },

        // Watch for file changes and recompile the applicable files
        // Also refresh the browser if the local server is being used
        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            options: {
                livereload: true,
                interrupt: true,
            },

            scripts: {
                files: 'src/**/*.js',
                tasks: [
                    'jshint',
                    'uglify:devCUI',
                    'uglify:devComponents',
                    'requirejs'
                ]
            },

            sass: {
                files: [
                    'src/**/*.scss',
                ],
                tasks: [
                    'sass:dev',
                    'concat:core',
                    'concat:project',
                ],
            },

            // This effectively does nothing but keep Grunt "running" (e.g. so the local server doesn't quit)
            noop: {
                files: [
                    'README.md'
                ],
            },
        },

        copy: {
            fonts: {
                expand: true,
                cwd: 'src/cui/fonts',
                src: ['**'],
                dest: 'dist/fonts',
                filter: 'isFile'
            },
            images: {
              expand: true,
              cwd: 'src/',
              src: ['cui/images/**.*','project/images/**.*','components/*/images/**.*'],
              dest: 'dist/images',
              filter: 'isFile',
              flatten: true
            }
        },

        // Local server
        // Go to http://localhost:8888 in your browser to use it
        // https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            server: {
                options: {
                    port: 8888
                }
            }
        },

        // Remove temporary development files
        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            // Temporary files and development goodies
            prod: [
                'src/**/*.map',
                'dist/**/*.map',
                '.sass-cache/',
            ],
            dist: [
              'dist'
            ]
        },

        // Builds the default javascript cui library using r.js compilar
        requirejs: {
          compile: {
                options: {
                    baseUrl: 'src/', // Where all our resources will be
                    name: '../tasks/libs/temp/settings', // Where the generated temp file will be
                    paths: {}, // Generate build file
                    include: [], // Generate build file
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    out: 'dist/js/cui.js' // Where the final project will be outputted.
                }
            }
        },

        requireManager: {
              components: {
                  files: [{
                      cwd: 'src/components/',
                      src: '*',
                      dest: 'dist/js/components'
                  }]
              }
        }

    });
    // End of plugin configuration
    // Next we define the tasks we want to use

    // Project Specfic tasks
    grunt.loadTasks('tasks');

    ////////////////
    // Main tasks //
    ////////////////

    // Type these at a command prompt to use Grunt, for example "grunt prod" or "grunt dev"

    // Production: package main files for distribution
    // This is the default task (when you just type "grunt" at the command prompt)
    grunt.registerTask('prod', 'Production', function(args) {
        grunt.task.run([
            'jshint',
            'requireManager',
            'sass:prod',
            'sass:prodComponents',
            'uglify:prodVendor',
            'uglify:prodComponents',
            'concat:core',
            'concat:project',
            'copy',
            'clean:prod',
        ]);
    });

    // Development: compile script.js and style.css, start a local server, and watch for file changes
    // Only use this on your local machine while developing
    grunt.registerTask('dev', 'Development', function(args) {
        grunt.task.run([
            'jshint',
            'requireManager',
            'sass:dev',
            'sass:devComponents',
            'uglify:devVendor',
            'uglify:devComponents',
            'concat',
            'copy',
            'connect',
            'watch'
        ]);
    });


    ///////////////////
    // Miscellaneous //
    ///////////////////

    // Start a local server
    // e.g. http://localhost:8888/Pages/Template/Template.html
    grunt.registerTask('server', 'Server', function(args) {
        grunt.task.run([
            'connect',
            'watch:noop',
        ]);
    });

    // Set the default task to the production build
    grunt.registerTask('default', 'prod');
};
