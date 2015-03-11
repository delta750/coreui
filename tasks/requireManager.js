module.exports = function(grunt) {

    'use strict';

    // Load the component manager plugin
    //var componentManager = require('./libs/requireManager/').init(this, grunt);

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function () {

          var manager = require('./libs/requireManager/manager');
          var collect = require('./libs/requireManager/collect');
          var process = require('./libs/requireManager/process');
          var write = require('./libs/requireManager/write');
          var build = require('./libs/requireManager/build');

          // Setup the manager by giving it access to the task and grunt namespaces
          manager.init(this, grunt)
            .addStep(collect.findAll)
            .addStep(collect.sortComponents)
            .addStep(process.components)
            .addStep(write.settings)
            .addStep(build.assetConfigs)
            .addStep(build.requireConfigs)
            .execute();


          // Call the require build information has been generated
          //grunt.task.run('requirejs');
        }

    );
};
