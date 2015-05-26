module.exports = function(grunt) {

    'use strict';

    var defaults = {}

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function () {

            // Task options.
            var options = this.options({
                assets: {},
                excludes: {
                    folders: [
                        '.git',
                        'node_modules',
                        'tasks'
                    ],
                    files: [
                        '.asset.json',
                        '.gitignore',
                        '.editorconfig',
                        'componentBuild.js',
                        'Gruntfile.js',
                        'npm-modules.log',
                        'package.json'
                    ]
                },
                files: {
                    build: 'Gruntfile.js',
                    config: '.asset.json',
                    projectJS: 'project/js/project.js',
                    settings: 'settings.js',
                    styles: 'cui/scss/_utilities/_assets.scss'
                },
                paths: {
                    assetDir: ['cui', 'project'],
                    buildDir: 'dist',
                    dest: {
                        script: 'components',
                        style: '../css/components'
                    },
                    dist: {
                        root: 'dist',
                        script: 'js',
                        style: 'css'
                    },
                    discoveredFolders: [],
                    rootSrc: 'src',
                    sourceDir: ['components', 'libs'],
                    specialAssets: [
                        'fonts',
                        'images'
                    ],
                    temp: 'tasks/libs/requireManager/temp/'
                },
                registered: {
                    include: {},
                    lazy: {}
                },
                sources: {
                    script: {
                        ext: ['js']
                    },
                    style: {
                        ext: ['scss','css']
                    }
                },
                tasks: {},
                write: {
                    buildOrder: [
                        'requirejs',
                        'css',
                        'text',
                        'json',
                        'domReady',
                        'lazyLoader',
                        'jquery',
                        'cui'
                    ],
                    includeStyle: []
                }
            });

            // Inital manager function
            var build = require('./libs/requireManager/build'),
                config = require('./libs/requireManager/config'),
                manager = require('./libs/requireManager/manager'),
                process = require('./libs/requireManager/process'),
                search = require('./libs/requireManager/search'),
                tasks = require('./libs/requireManager/tasks');


            manager.init(this, grunt, options)
                .step("Search for valid component folders", search.folders)
                .step("Looking up all of the files and create defintion", search.files)
                .step("Procsses file based on source defenitions", process.assets)
                .step("Generate file load paths for each source defenition", process.paths)
                .step("Build the settings file", build.settings)
                .step("Generate asset tasks", tasks.assets)
                .step("Update requireJS Grunt config", config.requireJS)
                .step("Update dynamic Grunt config", config.dynamic)
                .step("Generate include style scss import", build.includeStyles)
                .step("Build watch tasks", config.watch)
                .execute();
        }
    );
};