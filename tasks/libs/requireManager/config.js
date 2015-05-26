'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var obj = require('../utilites/object');
var verbose = require('../utilites/verbose');

/**
* Config:
* Take component folder and files and define the individual asset types.
*
* Params:
* - none -
* @return - {object} - copy of all public functions used to manage require manager
*/
var config = function() {

    var mode = function(rm, next) {

        var grunt = rm.grunt;

        // Get the current grunt build mode
        rm.options.mode = grunt.config.get("prodBuild");

        next(rm);

    };

    var dynamic = function(rm, next) {

        var grunt = rm.grunt;
        var taskList = Object.keys(rm.options.tasks);

        // Loop through all of the different task items
        (function nextTask(tasks) {

            var taskName = tasks.shift();
            var assetTasks = rm.options.tasks[taskName].tasks;

            var assetTasksList = Object.keys(assetTasks);

            (function nextAssetTask(atasks){

                var aTaskName = atasks.shift();

                var task = assetTasks[aTaskName];

                // Load the proper config by type
                var gruntTask = grunt.config.get(task.type);

                // Merge the new task in
                gruntTask[aTaskName] = task.config;

                // Save the updated task
                grunt.config.set(task.type, gruntTask);

                if (atasks.length !== 0) {
                    nextAssetTask(atasks);
                }

            })(assetTasksList);

            if (tasks.length !== 0) {

                nextTask(tasks);

            } else {

                next(rm);
            }

        })(taskList);

    };

    var requireJS = function(rm, next) {

        var grunt = rm.grunt;
        var includePaths = rm.options.registered.include;

        // Get a copy of the running GruntJS config
        var requireOptions = grunt.config.get('requirejs.compile.options');

        var libsArray = Object.keys(includePaths);

        // Add the compiled paths
        requireOptions.paths = includePaths;

        // Add the namves to the include array.
        requireOptions.include = libsArray;

        // Update the running config
        grunt.config.set('requirejs.compile.options', requireOptions);

        next(rm);
    };

    var watch = function(rm, next) {

        var assetList = Object.keys(rm.options.assets);
        var grunt = rm.grunt;

        (function nextAsset(assets) {

            var assetName = assets.shift();
            var asset = rm.options.assets[assetName];

            var watchTasks = [];

            // Check to see if there is a component build process
            if (asset.build) {
                watchTasks.push("componentBuild:"+asset.rootpath)
            }

            // Change based on its include or lazy status

            // Include assets
            //watchTasks.push("requireManager");
            watchTasks.push("requirejs");
            watchTasks.push("sass:cui");

            // Lazy assets
            if (rm.options.tasks[assetName] !== undefined) {

                var extraTasksList = Object.keys(rm.options.tasks[assetName].tasks);

                if (extraTasksList.length !== 0) {

                    (function nextTask(tasks) {

                        var taskName = tasks.shift();
                        var task = rm.options.tasks[assetName].tasks[taskName];

                        watchTasks.push(task.type + ":" + taskName);

                        if (tasks.length !== 0) {
                            nextTask(tasks);
                        }

                    })(extraTasksList);

                }

            }

            var watchOptions = grunt.config.get('watch');

            watchOptions[asset.name] = {
                files: [asset.rootpath + "/**/*.*"],
                tasks: watchTasks
            };

            grunt.config.set('watch', watchOptions);

            if (assets.length !== 0) {

                nextAsset(assets);
            } else {

                var watchTest = grunt.config.get('watch');

                next(rm);
            }

        })(assetList);

    }

    return {
        dynamic: dynamic,
        mode: mode,
        requireJS: requireJS,
        watch: watch
    };

};

// Expor the manager function as a module
module.exports = exports = new config();