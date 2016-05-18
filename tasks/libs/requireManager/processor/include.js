'use strict';

var fs = require('../../utilities/fs');

var _priv = {};
var _taskObj = {};

// Require JS Paths
var _includePaths = {};

var _distTasks = [];
var _distGruntTasks = {};
var _taskMap = {};

_priv.generateInclude = function _generate_include(component, prefix, files, cb) {

    function checkInclude(name, path) {

        if (_includePaths.hasOwnProperty(name)) {

            if (_includePaths[name] !== path) {

                return false;
            }
            else {

                return true;
            }

        }
        else {

            return true;
        }

    }

    var compSettings = false;

    // Check for a preferred name list
    if (component.settings !== false) {

        if (component.settings.preferences) {

            if (component.settings.preferences.files) {

                compSettings = component.settings.preferences.files;
            }

        }

    }

    var requireName = (prefix !== '') ? component.name + "-" + prefix : component.name;

    if (files.length === 1) {

        var file = files[0];

        // Check to see if the name and paths are ok
        if (checkInclude(requireName, file.fullpath.replace('.' + file.ext, '').replace(/^(src\/)/g, ''))) {

            _includePaths[requireName] = file.fullpath.replace('.' + file.ext, '').replace(/^(src\/)/g, '');
        }

    }
    else {

        (function nextFile(files) {

            var file = files.shift();

            var fileName = file.name.substring(0, file.name.indexOf('.'));

            // Check to see if we have a preferred file name defined
            if (compSettings !== false && compSettings.hasOwnProperty(fileName) && compSettings[fileName].hasOwnProperty("preferred")) {

                _includePaths[compSettings[fileName].preferred] = file.fullpath.replace('.' + file.ext, '').replace(/^(src\/)/g, '');
            }
            else {

                // Use the stock name
                _includePaths[fileName] = file.fullpath.replace('.' + file.ext, '').replace(/^(src\/)/g, '');
            }

            if (files.length !== 0) {

                nextFile(files);
            }

        })(files.concat())

    }

}

_priv.extendTask = function _extend_task(component, grunt, task, type, files) {

    // Create the initial name
    var taskName = null;
    var gruntTask = grunt.config.get(task);

    switch (task) {

        case 'concat':

            switch (type) {

                // When we have CSS we need to concat those styles onto the end of tha already created main.css file
                case 'style':

                    taskName = 'css';

                    break;
            }

            (function nextFile(files) {

                var file = files.shift();

                if (typeof gruntTask[taskName].src === "string") {

                    gruntTask[taskName].src = [gruntTask[taskName].src];
                }

                gruntTask[taskName].src.push(file.fullpath);

                if (files.length !== 0) {
                    nextFile(files)
                }
                else {

                    grunt.config.set(task, gruntTask);
                }

            })(files.concat());

            break;

        case 'sass':

            // Check to see if another sass file has already created the globbing task
            var mainSass = grunt.config.get('sass');

            var mainSassFiles = mainSass.main.files['dist/css/main.css'];
            var origSassFiles = [];

            // Check and set the sass is looking at the globbing fine and not the project root anymore..
            if (mainSassFiles[0] !== 'tasks/libs/requireManager/temp/import.scss') {

                if (typeof mainSassFiles === "string") {

                    // Make sure the file is not already part of the markup
                    if (origSassFiles.indexOf(mainSassFiles) === -1) {
                        origSassFiles.push(mainSassFiles);
                    }
                }
                else if (Array.isArray(mainSassFiles)) {

                    for (var i = 0, len = mainSassFiles.length; i < len; i++) {
                        origSassFiles.push(mainSassFiles[i]);
                    }
                }

                // Enforece Sass to load the new import.scss we are building.
                mainSass.main.files['dist/css/main.css'] = ['tasks/libs/requireManager/temp/import.scss'];

                // Update original sass to point at sass globbing results
                grunt.config.set('sass', mainSass);
            }

            //Get the current sass_globbing config
            var sassGlobbingConfig = grunt.config.get('sass_globbing')

            // Check and build the default object if it does not exist.
            if (sassGlobbingConfig === undefined || sassGlobbingConfig === null) {

                sassGlobbingConfig = {
                    main: {
                        files: {
                            'tasks/libs/requireManager/temp/import.scss': origSassFiles
                        }
                    },
                    options: {
                        useSingleQuotes: false
                    }
                }

                // Add sassGlobbing
                grunt.config.set('sass_globbing', sassGlobbingConfig);

            }

            var mainSassGlobbing = sassGlobbingConfig.main.files['tasks/libs/requireManager/temp/import.scss'];

            //sassGlobbingConfig.main.files['tasks/libs/requireManager/temp/import.scss'].push()
            (function nextFile(files) {

                var file = files.shift();

                // Special rule to filter out underscore files.
                if (file.name.charAt(0) !== "_") {

                    mainSassGlobbing.push(file.fullpath);
                }

                if (files.length !== 0) {
                    nextFile(files)
                }
                else {

                    sassGlobbingConfig.main.files['tasks/libs/requireManager/temp/import.scss'] = mainSassGlobbing;

                    grunt.config.set("sass_globbing", sassGlobbingConfig);
                }

            })(files.concat());


            break;
    }

}

var include = function _include() {

    var component = function _component(component, grunt, global, cb) {

        if (global.hasOwnProperty('includePaths')) {
            _includePaths = global.includePaths;
        }

        var files = component.distFiles;

        if (files.length !== 0) {

            // Check to see if we already have a broke down assets, if so make a copy of the assets for future reference
            if (component.sortedAssets) {

                component.lastAssetSort = component.sortedAssets;
            }

            // Create or reset the sorted object
            component.sortedAssets = {};

            (function nextFile(files) {

                var file = files.shift();

                switch (file.ext) {

                    case 'js':

                        if (!component.sortedAssets.hasOwnProperty('scripts')) {

                            component.sortedAssets['scripts'] = {
                                files: []
                            };
                        }

                        component.sortedAssets.scripts.files.push(file);

                        break;

                    case 'css':

                        // Check to see if we have a place for the saved scripts
                        if (!component.sortedAssets.hasOwnProperty('styles')) {

                            component.sortedAssets['styles'] = {
                                files: []
                            };
                        }

                        component.sortedAssets.styles.files.push(file);

                        break;

                    case 'scss':
                    case 'sass':

                        // Check to see if we have a place for the saved scripts
                        if (!component.sortedAssets.hasOwnProperty('sass')) {

                            component.sortedAssets['sass'] = {
                                files: []
                            };
                        }

                        component.sortedAssets.sass.files.push(file);

                        break;
                }

                if (files.length !== 0) {

                    nextFile(files)
                }
                else {

                    var assetTypes = Object.keys(component.sortedAssets);

                    (function nextAssetType(assets) {

                        var asset = assets.shift();

                        switch (asset) {

                            // Scripts and styles are easy, just need to make a copy task.
                            case 'scripts':

                                _priv.generateInclude(component, '', component.sortedAssets[asset].files);
                                break;

                            case 'styles':

                                _priv.extendTask(component, grunt, 'concat', 'style', component.sortedAssets[asset].files);
                                break;

                            case 'sass':

                                _priv.extendTask(component, grunt, 'sass', 'sass', component.sortedAssets[asset].files);
                                break;

                        }

                        if (assets.length !== 0) {

                            nextAssetType(assets);
                        }
                        else {

                            cb({
                                includePaths: _includePaths
                            });
                        }

                    })(assetTypes);
                }

            })(files.concat());

        }
        else {

            cb(false);
        }

    };

    return {
        component: component
    }

}

// Export the manager function as a module
module.exports = exports = new include();