module.exports = function(grunt) {

    'use strict';

    // Load the component manager plugin
    var componentManager = require('./libs/requireComponentManager').init(this, grunt);

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function () {

            // Merge task specific options with defaults.
            var options = this.options({
                assetTypes: { // Acceptable Asset Types to manage.
                    script: {
                        extension: ['js'],
                    },
                    style: {
                        extension: ['scss', 'css']
                    }
                },
                requireConfig: false,
                configName: 'component.json'
            });

            // Run the require component manager peice
            componentManager.components(options, this.files);

            // Run the requirejs build process.
            grunt.task.run('requirejs');

        }
    );
};