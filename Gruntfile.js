module.exports = function(grunt) {
    // Banner for JavaScript files
    // The info comes from package.json -- see http://gruntjs.com/configuring-tasks#templates for more about pulling in data from files
    var jsBanner = '/*! <%= pkg.title %>\n' +
                 ' *  @description  <%= pkg.description %>\n' +
                 ' *  @version      <%= pkg.version %>.REL<%= grunt.template.today("yyyymmdd") %>\n' +
                 ' *  @copyright    <%= grunt.template.today("yyyy") %> ' +
                 '<%= pkg.author.name %>\n */\n';

    // This banner will appear at the top style sheets
    var cssBanner = '@charset "utf-8";\n' + jsBanner;

    // Insert the Live Reload script
    var liveReloadInjection =
            '\n(function(){' +
                'var s = document.createElement("script");' +
                's.src="//localhost:35729/livereload.js";' +
                'document.head.appendChild(s);' +
            '}());';

    // Project configuration.
    grunt.initConfig({

        // All Grunt modules must be listed in the `package.json` file
        pkg: grunt.file.readJSON('package.json'),

        // Flag for dynamic tasks.
        prodBuild: false,

        // Remove temporary development files
        // https://github.com/gruntjs/grunt-contrib-clean
        clean: {
            dist: [
                'dist',
                'src/components/**/dist/',
                '!src/components/**/node_modules/**/dist/',
            ],
        },

        copy: {
            fonts: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/cui/fonts/',
                        src: ['**'],
                        dest: 'dist/fonts',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'src/project/fonts/',
                        src: ['**'],
                        dest: 'dist/fonts',
                        filter: 'isFile',
                    },
                ],
            },
            images: {
                expand: true,
                cwd: 'src/',
                src: [
                        'cui/images/**.*',
                        'project/images/**.*'
                    ],
                dest: 'dist/images',
                filter: 'isFile',
                flatten: true,
            },
            html: {
                files: [
                    {
                        expand: true,
                        cwd: 'src/cui/html/',
                        src: ['**/*.html'],
                        dest: 'dist',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'src/cui/docs/',
                        src: ['**/*.html'],
                        dest: 'dist',
                        filter: 'isFile',
                    },
                    {
                        expand: true,
                        cwd: 'src/project/html/',
                        src: ['**/*.html'],
                        dest: 'dist',
                        filter: 'isFile',
                    },
                ],
            },
            templates: {
                expand: true,
                cwd: 'src/project/templates',
                src: ['**/*.html'],
                dest: 'dist/templates',
                filter: 'isFile',
                flatten: true,
            },
        },

        // Items are dynamically added here.
        concat: {},

        // Local server at http://localhost:8888
        // https://github.com/gruntjs/grunt-contrib-connect
        connect: {
            server: {
                options: {
                    livereload: true,
                    port: 8888,
                    // Comment the line above and uncomment the line below if you would like to have a new browser tab open automatically
                    // open: 'http://localhost:8888/dist/',
                },
            },
        },

        // https://github.com/gruntjs/grunt-contrib-jshint
        // Supported options: http://jshint.com/docs/
        // Help with debugging common error messages: http://jslinterrors.com/
        // Basic hinting is provided for the projectjs. Additional hinting should be setup
        // the supporting component folders manually.
        jshint: {
            options: {
                curly: true,
                eqeqeq: true,
                browser: true,
                unused: 'vars',
            },
            files: [
                'src/project/js/**/*.js',
            ],
        },

        // https://github.com/treasonx/grunt-markdown
        markdown: {
            options: {
                highlight: 'auto',
                template: 'src/cui/docs/src/assets/templates/default.html',
                markdownOptions: {
                    highlight: 'manual', // 'auto',
                    gfm: true,
                },
            },
            prod: {
                files: [{
                    expand: true,
                    cwd: 'src/cui/docs/src/',
                    src: ['**/*.md'],
                    dest: 'docs',
                    ext: '.html',

                    // This plugin has (had?) a bug that makes it impossible to put the files where we want them, so we add this function to change the path that Grunt generates and move the file
                    // See: https://github.com/treasonx/grunt-markdown/issues/43
                    // HTML files should end up in the `Documentation` folder
                    // rename: function (dest, src) {
                    //     // Get the file name and prepend the directory name
                    //     return 'docs/dist/' +  src.split('/').pop();
                    // },
                }],
            },
        },

        // Builds the default javascript cui library using r.js compiler
        requirejs: {
            compile: {
                options: {
                    baseUrl: 'src/', // Where all our resources will be
                    name: '../tasks/libs/requireManager/temp/settings', // Where the generated temp file will be
                    paths: {}, // Generate build file
                    include: [], // Generate build file
                    optimize: 'none', //'uglify2',
                    generateSourceMaps: true,
                    preserveLicenseComments: false,
                    out: 'dist/js/main.js', // Where the final project will be output
                }
            },
        },

        // https://github.com/sindresorhus/grunt-sass
        sass: {
            options: {
                sourceMap: true,
                outputStyle: 'nested', // Options: "nested", "compressed" (i.e. minified)
            },

            cui: {
                files: {
                    'dist/css/main.css': ['src/project/scss/project.scss']
                },
            },
        },

        // https://github.com/gruntjs/grunt-contrib-uglify
        uglify: {
            options: {
                banner: jsBanner,
                preserveComments: 'some', // Only comments with a special syntax are kept
                sourceMap: true,
                mangle: false,
            }
        },

        // https://github.com/gruntjs/grunt-contrib-watch
        watch: {
            options: {
                livereload: true,
                interrupt: true,
            },

            scripts: {
                files: [
                    'src/cui/**/*.js',
                    'src/project/**/*.js',
                    // Only watch `src/` files for components and ignore `dist/`
                    'src/project/components/*/src/js/*.js',
                ],
                tasks: [
                    'jshint',
                    'subGrunt',
                    'requireManager',
                    'requirejs',
                    'uglify',
                    'concat:devJS',
                ],
            },

            sass: {
                files: [
                    'src/cui/scss/**/*.scss',
                    'src/project/scss/**/*.scss',
                    // Only watch `src/` files for components and ignore `dist/`
                    'src/project/components/*/src/scss/*.scss',
                ],
                tasks: [
                    'sass',
                ],
            },

            html: {
                files: [
                    'src/cui/**/*.html',
                    'src/project/**/*.html',
                ],
                tasks: [
                    'copy:html',
                ],
            },

            markdown: {
                files: [
                    'src/cui/docs/**/*.md',
                ],
                tasks: [
                    'markdown',
                ],
            },

            // This effectively does nothing but keep Grunt "running" (e.g. so the local server doesn't quit)
            noop: {
                files: [
                    'README.md',
                ],
            },
        },

        /***
         * CUSTOM TASKS BELOW
         ***/

        // Require Manager Script. Please leave this task blank
        requireManager: {},

        // Locations to look for components
        subGrunt: {
            components: {
                files: [{
                    cwd: 'src',
                    src: [
                        'cui/components/*',
                        'cui/libs/*',
                        'project/components/*',
                        'project/libs/*'
                    ],
                }],
            },
        },

        folderCopy: {
            docs: {
                files: [{
                    cwd: 'src',
                    src: [
                        'cui/components/*',
                        'cui/libs/*',
                        'project/components/*',
                        'project/libs/*'
                    ],
                    folderNames: ['docs','tests']
                }],
            },
        }


    });

    // Generic Load Task
    require('load-grunt-tasks')(grunt);

    // Load local tasks in the task folder.
    grunt.loadTasks('tasks');

    ////////////////
    // Main tasks //
    ////////////////

    // Type these at a command prompt to use Grunt, for example "grunt prod" or "grunt dev"

    // Production: package files for distribution
    // This is the default task (when you just type "grunt" at the command prompt)
    grunt.registerTask('prod', 'Production', function (args) {

        // Set the prod flag
        grunt.config.set("prodBuild", true);

        // Disable Source Maps
        grunt.config.set('sass.options.sourceMap', false);
        grunt.config.set('uglify.options.sourceMap', false);

        // Dynamically add production concats
        var concat = grunt.config.get('concat');

        concat.cuiCSS = {
            options: {
                banner: cssBanner,
            },
            src: ['dist/css/main.css'],
            dest: 'dist/css/main.css',
        };

        concat.cuiJS = {
            options: {
                banner: jsBanner,
            },
            src: ['dist/js/main.js'],
            dest: 'dist/js/main.js',
        };

        grunt.config.set('concat', concat);

        grunt.task.run([
            'clean',
            'jshint',
            'subGrunt',
            'requireManager',
            'copy',
            'requirejs',
            'uglify',
            'sass',
            'concat'
        ]);
    });

    // Development: compile script and styles, start a local server, and watch for file changes
    // Only use this for local development
    grunt.registerTask('dev', 'Development', function (args) {

        var concat = grunt.config.get('concat');

        concat.devJS = {
            options: {
                footer: liveReloadInjection
            },
            src: ['dist/js/main.js'],
            dest: 'dist/js/main.js'
        };

        grunt.config.set('concat', concat);

        grunt.task.run([
            'clean',
            'jshint',
            'subGrunt',
            'requireManager',
            'copy',
            'requirejs',
            'uglify',
            'sass',
            'concat',
            'connect',
            'docs'
        ]);
    });

    // Task used to camm component builds on subfolders.
    grunt.registerTask('componentBuild', 'Task to kick of a component GruntTask', function (dir) {
        var done = this.async();
        //var options = JSON.stringify(componentOptions)

        grunt.log.ok(dir);

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
            } else {
                grunt.log.writeln('processing ' + dir + ' failed: ' + code);
                grunt.log.writeln(result);
                done(false);
            }
        });
    });

    // Documentation
    grunt.registerTask('docs', 'Documentation', function (args) {

        var copy = grunt.config.get('copy');

        copy.docAssets = {
            expand: true,
            cwd: 'src/cui/docs/src/assets/css',
            src: ['**/*.css'],
            dest: 'dist/css',
            filter: 'isFile',
            flatten: true,
        };

        copy.projectDocAssets = {
            expand: true,
            cwd: 'src/project/docs',
            src: ['**/*.*'],
            dest: 'docs/project',
            filter: 'isFile',
        };

        copy.images = {
            expand: true,
            cwd: 'src/cui/docs/src/assets/images',
            src: ['**/*.*'],
            dest: 'docs/assets/images',
            filter: 'isFile',
            flatten: true,
        };

        copy.demos = {
            expand: true,
            cwd: 'src/cui/docs/demos/',
            src: ['**/*.*'],
            dest: 'docs/demos',
            filter: 'isFile',
            flatten: true,
        };

        grunt.config.set('copy', copy);

        grunt.task.run([
            'subGrunt',
            'folderCopy',
            'copy',
            'markdown',
            'watch',
        ]);
    });

    ///////////////////
    // Miscellaneous //
    ///////////////////

    // Start a local server
    // e.g. http://localhost:8888
    grunt.registerTask('server', 'Server', function (args) {
        grunt.task.run([
            'connect',
            'watch:noop',
        ]);
    });

    // Set the default task to the development build
    grunt.registerTask('default', 'dev');
};
