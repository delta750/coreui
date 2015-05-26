'use strict';

var fs = require('../../utilites/fs');
var verbose = require('../../utilites/verbose');

function gruntTask() {

	function capitalizeFirstChar(str) {
		return str.charAt(0).toUpperCase() + str.slice(1);
	}

	function generateName(asset, calledFrom) {

		return asset.name + capitalizeFirstChar(calledFrom);
	}

	function configs(type, fileLevel, source, dest) {

		var config = {};

		switch (type) {

			case "sass":
			case "uglify":

				// Add the files sub object
				config['files'] = {};

				// Loop through and do the one to one match
				for (var i = 0, len = source.length; i < len; i++) {
					config.files[dest[i]] = source[i];
				}

				break;

			case "concat":

				// Add the files sub object
				config['files'] = {};

				config.files[dest] = [dest].concat(source);

				break;

			case "copy":

				config = {
					expand: true,
	            	src: source,
	            	dest: dest,
	            	filter: 'isFile',
	            	flatten: true
				}

				break;

		}

		return config;

	}

	var process = function(taskType, calledFrom, asset, paths, dest, force, cb) {

		// Storage variables
		var fileSources = [];
		var fileDest = [];
		var fileLevelTask = undefined;

		// Figure out the name
		var name = generateName(asset, calledFrom);

		// Figure out paths
		if (paths.constructor === Array) {

			// Loop through all defined path folders.
			(function nextPath(objs) {

				var obj = objs.shift();

				// Check to see what the type of 
				if (obj.file) {

					// This is a file object, so we must assume that we are doing 
					// something only to the to this file.
					fileSources.push(obj.fullpath);

					fileDest.push(fs.pathJoin(dest, obj.name));

					fileLevelTask = true;

				} else if (obj.directory) {

					// This is a folder object, so here we are going to assume
					// that we need to the same to the contents of the folder

					fileSources.push(fs.pathJoin(obj.fullpath, "**.*"));

					// Since folders level action dont define specific endpoints only add
					// when the dest is not the same.
					fileLevelTask = false;

				}

				if (objs.length !== 0) {
					
					nextPath(objs);
				} else {

					var config;

						if (force) {

							if (force === "folder") {

								// Folder tasks have a specific end point
								config = configs(taskType, fileLevelTask, fileSources, dest);

							} else if (force === "file") {

								// File task have a one to one end point.
								config = configs(taskType, fileLevelTask, fileSources, dest);
							}

						} else {

							if (fileLevelTask) {

								// File task have a one to one end point.
								config = configs(taskType, fileLevelTask, fileSources, fileDest);
							} else  {

								// Folder tasks have a specific end point
								config = configs(taskType, fileLevelTask, fileSources, dest);
							}

						}

					cb(name, config);

				}

			})(paths);

		}

	};

	var store = function(asset, options, task) {

		// Check to see if this asset type has any other tasks
		if (!options.tasks[asset.name]) {

			// Add the base grunt config task types
			options.tasks[asset.name] = {
				tasks: {}
			};
			
		}

		// Check to see if the task name is already in use
		if (!options.tasks[asset.name].tasks[task.name]) {

			options.tasks[asset.name].tasks[task.name] = {};

			options.tasks[asset.name].tasks[task.name]['type'] = task.type;
			options.tasks[asset.name].tasks[task.name]['config'] = task.config;

		} else {

			verbose.log(1, "Dynamic task name: " + task.name + " is already in use for: " + asset.name, "error");
		}

	};

	return {
		process: process,
		store: store
	}

};

// Expor the manager function as a module
module.exports = exports = new gruntTask();