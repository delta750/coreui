module.exports = function(grunt) {

    'use strict';

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function () {

            // Task options.
            var options = {
                componentDir: 'src/components/*'
            }

            var manager = require('./libs/requireManager/manager'),
                find = require('./libs/requireManager/find'),
                process = require('./libs/requireManager/process'),
                write = require('./libs/requireManager/write'),
                build = require('./libs/requireManager/build');

            // Call the manager and step through all the defined steps.
            manager.init(this, grunt)
                .addStep(find.components)       // Go out to the defined component folder and get all the metadata possilbe.
                .addStep(find.assets)           // For each component, try to find assets.
                .addStep(process.components)    // Now process each of the components
                .addStep(write.settings)        // Write the settings file
                .addStep(build.assets)            // Build the Grunt tasks for individual dynamic assets lazy components
                .addStep(build.require)         // Build the Grunt task for the RequireJS task
                .execute();

        }

    );
};