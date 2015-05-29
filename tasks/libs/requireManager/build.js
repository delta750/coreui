'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var verbose = require('../utilites/verbose');

/**
* Sort:
* Take component folder and files and define the individual asset types.
*
* Params:
* - none -
* @return - {object} - copy of all public functions used to manage require manager
*/
var build = function() {

    var settings = function(rm, next) {

        var anonymousWrapper = {
            start: "(function () {",
            end: "})();"
        };

        var config = {
            start: 'var scripts = document.getElementById("require"),' +
                   'src = scripts.src,' +
                   'baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf("/main.js"));' +
                   'require.config({ baseUrl: baseUrl, paths:',
            end: '});'
        };

        //Create a write object
        var ws = new fs.writeStream('settings');

        // Setup the write callback
        ws.on('finish', function() {

            var contents = this.data();

            try {

                // Build destination
                var dist = fs.pathJoin(rm.options.paths.temp, rm.options.files.settings);

                fs.writeFile(dist, contents);

            } catch(e) {

                console.log(e);
            }


        });

        var projectSettingsPath = (rm.options.paths.rootSrc) ? fs.pathJoin(rm.options.paths.rootSrc, rm.options.files.projectJS) : rm.options.files.projectJS;
        var projectSettings = fs.readFile(projectSettingsPath);

        // Check to see if project settings can be returned.
        if (!projectSettings) {

            verbose.log(1, "No project setting file could be found at: " + projectSettingsPath, "warn");

            // Set to nothing to prevent error
            projectSettings = "";
        }

        var lazyPaths = rm.options.registered.lazy;

        // Build the files
        ws.write(anonymousWrapper.start);
        ws.write(config.start);
        ws.write(JSON.stringify(lazyPaths));
        ws.write(config.end);
        ws.write(projectSettings)
        ws.write(anonymousWrapper.end);

        // Close the stream and
        ws.end();

        next(rm);

    };

    var includeStyles = function(rm, next) {

        var header = "// DO NOT ALTER THIS FILE \n" +
                     "// This file is used by require manager to include assets (component/libraires/etc) .scss files\n"

        //Create a write object
        var ws = new fs.writeStream('settings');

        // Setup the write callback
        ws.on('finish', function() {

            var contents = this.data();

            // Build destination
            var dist = (rm.options.paths.rootSrc) ? fs.pathJoin(rm.options.paths.rootSrc, rm.options.files.styles) : rm.options.files.styles;

            fs.writeFile(dist, contents);
        });

        var includeStyles = rm.options.write.includeStyle;

        // Write the header
        ws.write(header);

        includeStyles.forEach(function(style) {

            ws.write('@import "' + style + '";');

        });

        ws.end();

        next(rm);

    }

    return {
        includeStyles: includeStyles,
        settings: settings
    };

}

// Expor the manager function as a module
module.exports = exports = new build();