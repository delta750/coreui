module.exports = function(grunt) {

    'use strict';

    // Load the component manager plugin
    var componentManager = require('./libs/requireComponentManager').init(this, grunt);

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function () {

          var requireManager = require('./libs/requireManager/manager');
          var collectComponents = require('./libs/requireManager/collect');
          var process = require('./libs/requireManager/process');
          var write = require('./libs/requireManager/write');

          // Setup the manager by giving it access to the task and grunt namespaces
          requireManager.init(this, grunt)
            .addStep(collectComponents.findAll)
            .addStep(collectComponents.sortComponents)
            .addStep(process.components)
            .addStep(write.settings)
            .execute();
        }

    );
};
