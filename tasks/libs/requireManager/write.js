'use strict';

var path = require('path');

// Inculde our utility object
var _util = require('../utility');

// Function used to find specific asset files.
var write = function() {

    /***
     * Settings file variables.
     ***/
    var settings, settingFile, tempFolder, grunt, initPath;
    var wrapperStart = '(function () {\n';
    var wrapperEnd = '}());';

    var baseUrl = 'var scripts = document.getElementById("require"),\n' +
        'src = scripts.src,\n' +
        'baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf("/cui"));\n';

    function writeHeader(settings) {

        // Check to see if we needed the anonymouse wrapper.
        if (settings.anonymousWrapper) {
            _util.appendToFile(settingFile, wrapperStart);
        }

        if (settings.baseUrl) {
            _util.appendToFile(settingFile, baseUrl);
        }

    }

    function writeConfig(lazyDefinitions) {
        var requireStart = 'require.config({ baseUrl: baseUrl, paths:';
        var requireEnd = '\n});\n'

        _util.appendToFile(settingFile, requireStart);

        lazyDefinitions = {};

        if (Object.keys(lazyDefinitions).length > 0) {

            var buffer = new Buffer(JSON.stringify(lazyDefinitions, null, 4));

            _util.appendToFile(settingFile, buffer);

        } else {
            _util.appendToFile(settingFile, "{}");
        }

        _util.appendToFile(settingFile, requireEnd);

    }

    function mergeInit(initFile) {

        _util.mergeFile(settingFile, initFile);

    }

    function writeFooter(settings) {

        // Check to see if we needed the anonymouse wrapper.
        if (settings.anonymousWrapper) {
            _util.appendToFile(settingFile, wrapperEnd);
        }

    }

    var settings = function(rm, next) {

        console.log("Settings write was called");

        // Pull the settings closer
        settings = rm.options.requireSettings;
        tempFolder = rm.options.tempFolder;

        //console.log(rm.options.tempFolder);

        settingFile = path.join(tempFolder, settings.fileName);
        grunt = rm.grunt;

        // Check to see if the current file exist. Flush it if it does
        if (grunt.file.exists(settingFile)) {
            grunt.file.delete(settingFile);

        } else {

            // Check to make sure the temp directory is in place.
            if (!grunt.file.exists(tempFolder)) {
                grunt.file.mkdir(tempFolder);
            }
        };

        // Write the for the settings file.
        writeHeader(settings);

        // Pull the lazy definitions in
        var lazyDefinitions = rm.lazyDefinitions;

        // Write the actual config
        writeConfig(lazyDefinitions);


        // Now lets merge in the init file
        if (settings.customInit) {

            // Check to make sure the init file path exists.
            if (grunt.file.exists(settings.baseInitFile)) {
                initPath = settings.baseInitFile
            } else {
                // ERORR
                console.log("Settings init missing, Please check to make sure it exists in declared path");
            }

        } else {

            initPath = path.join(rm.options.partialFolder, settings.baseInitFile);

        }

        // Merge the init file in.
        mergeInit(initPath);

        // Write the footer
        writeFooter(settings);

        // Move to the next step
        next(rm);
    }

    return {
        settings: settings
    }

}

module.exports = exports = new write();
