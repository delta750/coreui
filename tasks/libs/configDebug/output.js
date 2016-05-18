'use strict';

var fs = require('../utilities/fs');

var output = function _output() {

    var gruntConfig = function _grunt_config(rm, next) {

        // Get a copy of the original grunt config
        var gruntConfig = rm.grunt.config.get();

        // Save it off for debug reasons.
        fs.writeJSON('tasks/libs/configDebug/logs/active-grunt-config.json', gruntConfig);

        next(rm);

    };

    return {
        gruntConfig: gruntConfig,
    }

}

// Export the manager function as a module
module.exports = exports = new output();