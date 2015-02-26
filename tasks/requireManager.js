module.exports = function(grunt) {

    'use strict';

    // Pull in the actual require manager node file.
    //var requireManager = require('requireManager');

    var componentManager = require('./libs/requireComponentManager').init(this, grunt);

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'requireManager',
        'Special task for manageing requireJS components and base settings file',
        function() {

        var done = this.async();
        var options = this.options({});

        // Run the require component manager peice
        componentManager.components(this.files, done);


    });

}
