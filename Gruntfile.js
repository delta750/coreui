module.exports = function (grunt) {
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

    /////////////////////////////
    // Configure Grunt plugins //
    /////////////////////////////

    // See http://gruntjs.com/configuring-tasks for general info about configuring plugins/tasks

    grunt.initConfig({
        // All Grunt modules must be listed in the `package.json` file
        pkg: grunt.file.readJSON('package.json'),

        // Flag for dynamic tasks.
        prodBuild: true,

        // Remove temporary development files
        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            dist: [
                'dist',
                'src/components/**/dist/',
                '!src/components/**/node_modules/**/dist/',
            ]
        },

        // JS linting
        // https://github.com/gruntjs/grunt-contrib-jshint
        jshint: {
            // Supported options: http://jshint.com/docs/
            // Help with debugging common error messages: http://jslinterrors.com/
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
            },
            files: [
                'src/**/*.js',
                '!src/cui/js/vendor/*.js',
                '!src/components/**/*.js',
                '!tasks/**/*.js'
            ]
        },

        // Minify and concatenate JS files
        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {

            // Global uglify options
            options: {
                banner: jsBanner,
                preserveComments: 'some',
                sourceMap: false,
                mangle: false,
            },

            vendor: {
                files: {
                    'dist/js/vendor/html5shiv.js': ['src/cui/js/vendor/html5shiv.js'],
                    'dist/js/vendor/kind.js': ['src/cui/js/vendor/kind.js'],
                }
            },

        },

        // Styles
        // https://github.com/sindresorhus/grunt-sass
        sass: {
            // Global options
            options: {
                sourceMap: false, // No source maps by default
                outputStyle: 'nested', // Options: nested, compressed
            },

            cui: {
                files: {
                    'dist/css/cui/cui.css': 'src/cui/scss/cui.scss',
                    'dist/css/project/project.css': 'src/project/scss/project.scss',
                },
            }

        },

        // Add banner to CSS files
        // The sass plugin doesn't allow us to add a banner so we need this to insert the version number at the top
        // https://github.com/gruntjs/grunt-contrib-concat
        concat: {
            cuiCSS: {
                options: {
                    // stripBanners: true,
                    banner: cssBanner,
                },
                src: ['dist/css/cui/cui.css'],
                dest: 'dist/css/cui/cui.css',
            },
            cuiJS: {
                options: {
                    // stripBanners: true,
                    banner: jsBanner,
                },
                src: ['dist/js/cui.js'],
                dest: 'dist/js/cui.js',
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
                nospawn: true
            },

            scripts: {
                files: [
                    'src/cui/**/*.js',
                    'src/project/**/*.js' // To ignore generated component files
                ],
                tasks: [
                    'jshint',
                    'requirejs',
                    'uglify',
                    'concat:devjs'
                ]
            },

            sass: {
                files: [
                    'src/cui/**/*.scss',
                    'src/project/**/*.scss'
                ],
                tasks: [
                    'sass:cui',
                ],
            },

            markdown: {
                files: [
                    'docs/src/**/*.*',
                ],
                tasks: [
                    'markdown',
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
            // Copy rule handes modules that do now have dist folders.
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
                src: [
                        'cui/images/**.*',
                        'project/images/**.*',
                        'components/*/images/**.*'
                    ],
                dest: 'dist/images',
                filter: 'isFile',
                flatten: true
            }
        },

        // Builds the default javascript cui library using r.js compilar
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/', // Where all our resources will be
                    name: '../tasks/libs/requireManager/temp/settings', // Where the generated temp file will be
                    paths: {}, // Generate build file
                    include: [], // Generate build file
                    optimize: 'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    out: 'dist/js/cui.js' // Where the final project will be outputted.
                }
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

        // Pass the component location and glob pattern
        requireManager: {
            options: {
                components: {
                    cwd: 'src/components',
                    src: '*'
                }
            }
        },

        // Locations to look for components
        subGrunt: {
            components: {
                files: [{
                    cwd: 'src/components/',
                    src: '*'
                }]
            }
        },

        // Compile markdown files into HTML (e.g. for documentation)
        // https://github.com/treasonx/grunt-markdown
        markdown: {
            options: {
                highlight: 'auto',
                template: 'docs/src/_includes/templates/default.html',
                markdownOptions: {
                    highlight: 'manual', // 'auto',
                    gfm: true,
                },
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'docs/src',
                    src: ['**/*.md'],
                    dest: 'docs/dist',
                    ext: '.html',

                    // This plugin has a bug making it impossible to put the files where we want them, so we rename the path that Grunt generates to move the file
                    // See: https://github.com/treasonx/grunt-markdown/issues/43
                    // HTML files should end up in the `Documentation` folder
                    // rename: function (dest, src) {
                    //     // Get the file name and prepend the directory name
                    //     return 'docs/dist/' +  src.split('/').pop();
                    // },
                }]
            }
        },

    });
    // End of plugin configuration


    // Load all Grunt tasks
    require('load-grunt-tasks')(grunt);

    // Project Specfic tasks
    grunt.loadTasks('tasks');

    ////////////////
    // Main tasks //
    ////////////////

    // Type these at a command prompt to use Grunt, for example "grunt prod" or "grunt dev"

    // Production: package main files for distribution
    // This is the default task (when you just type "grunt" at the command prompt)
    grunt.registerTask('prod', 'Production', function (args) {
        grunt.task.run([
            'clean',
            'jshint',
            'subGrunt',
            'requireManager',
            'copy',
            'requirejs',
            'uglify',
            'sass',
            'concat:cuiCSS',
            'concat:cuiJS',
            'concat:project',
        ]);
    });

    // Development: compile script.js and style.css, start a local server, and watch for file changes
    // Only use this on your local machine while developing
    grunt.registerTask('dev', 'Development', function (args) {

        // Set the prod flag to false.
        grunt.config.set("prodBuild", false);

        // Enable Source Maps
        grunt.config.set('sass.options.sourceMap', true);
        grunt.config.set('uglify.options.sourceMap', true);

        grunt.task.run([
            'connect',
            'clean',
            'jshint',
            'subGrunt',
            'requireManager',
            'copy',
            'requirejs',
            'uglify',
            'sass',
            'concat:devJS',
            'connect',
            'watch'
        ]);

    });

    // Task used to camm component builds on subfolders.
    grunt.registerTask('componentBuild', 'Task to kick of a component GruntTask', function (dir) {

        var done = this.async();

        grunt.log.ok(dir);

        //var options = JSON.stringify(componentOptions)

        grunt.util.spawn({
            grunt: true,
            args:['componentBuild', '--path=' + dir ],
            opts: {
                cwd: dir
            }
        },

        function (err, result, code) {
            if (!err) {
                grunt.log.writeln('processed ' + dir);
                grunt.log.writeln(result);
                done();
            }
            else {
                grunt.log.writeln('processing ' + dir + ' failed: ' + code);
                grunt.log.writeln(result);
                done(false);
            }
        });

    });

    ///////////////////
    // Miscellaneous //
    ///////////////////

    // Start a local server
    // e.g. http://localhost:8888/Pages/Template/Template.html
    grunt.registerTask('server', 'Server', function (args) {
        grunt.task.run([
            'connect',
            'watch:noop',
        ]);
    });

    // Documentation
    grunt.registerTask('docs', 'Documentation', function (args) {
        grunt.task.run([
            'connect',
            'markdown',
            'watch:markdown',
        ]);
    });

    // Set the default task to the production build
    grunt.registerTask('default', 'prod');
};