'use strict';

var fs = require('../../utilites/fs');
var gruntTasks = require('./gruntTasks');
var pathName = require('./pathName');
var verbose = require('../../utilites/verbose');

function lazy() {

	var script = function(asset, sourceDef, options, cb) {

		// Loop through all the files for this source
		var sourceFileList = sourceDef.files.concat();

		// Name space for newly create paths
		var reserved = [];

		// Grunt tasks
		var tasks = [];

		// Iterate all files and generate a name
		(function nextFile(files) {

			var file = files.shift();

			// Go make a pathName for this asset
			var name = pathName.generate(file, asset.preferences || false, "script", reserved, options.registered.include, options.registered.lazy);

			// Now that we have the name, we need to input the correct path.
			// This path is where the lazy asset will belone when its done
			options.registered.lazy[name] = fs.pathJoin(options.paths.dest.script, file.name.split('.')[0]);

			// Now that we have created the lazy load path object for the config. Next we need to move this file into
			// the right path location, but for now lets adde it to the task array
			tasks.push(file);

			if (files.length !== 0) {
				nextFile(files);
			} else {

				// Now lets create the task with the desired paths
				gruntTasks.process("uglify", "scripts", asset, tasks, "dist/js/components", undefined, function(name, config) {

					var task = {
						type: "uglify",
						name: name,
						config: config
					};

					gruntTasks.store(asset, options, task);

				});

			}

		})(sourceFileList);

	}

	var style = function(asset, sourceDef, options, cb) {

		// Loop through all the files for this source
		var sourceFileList = sourceDef.files.concat();

		// Name space for newly create paths
		var reserved = [];

		// Grunt tasks
		var cssTasks = [];
		var scssTasks = [];

		// Iterate all files and generate a name
		(function nextFile(files) {

			var file = files.shift();

			// Go make a pathName for this asset
			var name = pathName.generate(file, asset.preferences || false, "style", reserved, options.registered.include, options.registered.lazy);

			// Included scripts are a bit harder. How they are included is based on the file type
			if (file.ext === "css") {

				options.registered.lazy[name] = fs.pathJoin(options.paths.dest.style, file.name.replace('.css', ''));

				cssTasks.push(file);

			} else if (file.ext === "scss") {

				if (file.name.indexOf("_") === -1) {

					options.registered.lazy[name] = fs.pathJoin(options.paths.dest.style, file.name.replace('.scss', ''));

				}

				scssTasks.push(file);

			}

			if (files.length !== 0) {

				nextFile(files);
			} else {

				// Handle all the finished CSS files.
				if (cssTasks.length !== 0) {

					// Now lets create the task with the desired paths
					gruntTasks.process("copy", "style", asset, cssTasks, "dist/css/components", "folder", function(name, config) {

						var task = {
							type: "copy",
							name: name,
							config: config
						};

						gruntTasks.store(asset, options, task);

					});

				}

				if (scssTasks.length !== 0) {

					gruntTasks.process("sass", "style", asset, scssTasks, "dist/css/components", false, function(name, config) {

						var task = {
							type: "sass",
							name: name,
							config: config
						};

						gruntTasks.store(asset, options, task);

					});
				}

			}

		})(sourceFileList);

	}

	return {
		script: script,
		style: style
	}

};

// Expor the manager function as a module
module.exports = exports = new lazy();
