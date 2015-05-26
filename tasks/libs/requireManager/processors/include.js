'use strict';

var gruntTasks = require('./gruntTasks');
var pathName = require('./pathName');
var verbose = require('../../utilites/verbose');

function include() {

	var script = function(asset, sourceDef, options, cb) {

		// Loop through all the files for this source
		var sourceFileList = sourceDef.files.concat();

		// Name space for newly create paths 
		var reserved = [];

		// Iterate all files and generate a name
		(function nextFile(files) {

			var file = files.shift();

			// Go make a pathName for this asset
			var name = pathName.generate(file, asset.preferences || false, "script", reserved, options.registered.include, options.registered.lazy);

			// Now that we have the name, we need to input the correct path. In this case we can use the file current path
			options.registered.include[name] = file.fullpath.split('.')[0];

			if (files.length !== 0) {
				nextFile(files);
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

			// Included Styles are not treated the same as srcpts. Instead depending 
			// on the type the include process is going to change.
			if (file.ext === "css") {

				cssTasks.push(file);

			} else if (file.ext === "scss") {

				scssTasks.push(file);

			}

			if (files.length !== 0) {
				
				nextFile(files);

			} else {

				if (cssTasks.length !== 0) {

					gruntTasks.process("concat", "style", asset, cssTasks, "dist/css/project/project.css", "file", function(name, config) {

						var task = {
							type: "concat",
							name: name,
							config: config
						};

						gruntTasks.store(asset, options, task);

					});

				}

				if (scssTasks.length !== 0) {

					// So we have a scss file. Since we an dynamically install it
					// with see just store the path
					options.write.includeStyle.push(file.fullpath);

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
module.exports = exports = new include();