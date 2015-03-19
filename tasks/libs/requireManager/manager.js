/***
 * ===
 *  Manager.js
 *  ----------
 *  The manager module is responspible for provideing require manager with a basic way of iterating steps,
 *  storing and importing default options, and capturing user defined task options and values.
 * ===
 ***/

'use strict';

var _util = require('../utility');

var requireManager = function() {

    // Array to hold all the different steps that need to be executes
    var steps = [];

    // Object to hold default grunt task options.
    var defaultOptions = {
        components: {
            cwd: 'components/',
            src: "*",
            files: {
                settings: {
                    component: "component.json",
                    script: "settings.json",
                    style: "settings.scss",
                },
                build: "Gruntfile.js",
                includeStyle: "includeStyles.scss"
            },
            folders: {
                build: 'dist',
                temp: 'tasks/libs/requireManager/temp',
                partial: 'tasks/libs/requireManager/_partials'
            },
            requireJS: {
                anonymousWrapper: true,
                baseUrl: true,
                filename: 'settings.js',
                customBase: false,
                baseFile: 'build.json',
                customInit: false,
                initFile: 'init.js'
            }
        }
    };

  var init = function(task, grunt) {

    // Save off the tasks settings and grunt object
    this.task = task;
    this.grunt = grunt;

    // Save off pull task options into the defaulf option object.
    this.options = _util.merge(defaultOptions, task.options({}));

    // Pull in the default definition. These are external json files for simplisty in changeability.
    this.defaults = {
        components: grunt.file.readJSON('tasks/libs/requireManager/definitions/component.json'),
        assets: grunt.file.readJSON('tasks/libs/requireManager/definitions/assets.json')
    }

    // Array to hold component objects (pre processesing)
    this.definedComponents = [];

    // Sorted definition files
    this.lazyComponent = {};
    this.includeComponent = {};

    // Files to exclude when multiple grabs occur
    this.excludeFiles = [
        defaultOptions.components.files.build,
        defaultOptions.components.files.settings.component,
        defaultOptions.components.files.settings.script,
        defaultOptions.components.files.settings.style,
        'package.json',
        '.gitignore',
        '.jshintrc',
        '.editorconfig'
    ];

    // Files/Folders to flush each time
    _util.flushFile('src/cui/scss/_utilities/_components.scss');

    // Return itself so the process can move on.
    return this;

  };

  var addStep = function(func) {

    // Add function to step array
    steps.push(func);

    // Return itself so the process can move on.
    return this;

  }

  // Function will cause all the buffered steps to begin
  var execute = function(callback) {

    var self = this;

    // See if no steps remain
    if (steps.length === 0) {

      if (callback) {
        callback(null, true);
      }

      return true;

    }

    // Set the starting step
    var step = 0;

    // Execute the next step in the steps array, plus pass it a callback.
    steps[step++](self, function next(requireManager) {

        if (step < steps.length) {

          steps[step++](self, next);

        } else {

          if (callback) {
            callback(null, true);
          }

          return true;

        }

    });


  }

  return {
    init: init,
    addStep: addStep,
    execute: execute
  }

}

module.exports = exports = new requireManager();
