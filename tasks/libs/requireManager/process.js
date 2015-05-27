'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var obj = require('../utilites/object');
var verbose = require('../utilites/verbose');

/**
* Process:
* Searches for asset folders, files and creats a default configuration/ source defintion file list.
*
* Params:
* - none -
* @return - {object} - copy of all public functions used to manage require manager
*/
var process = function() {

	var assets = function(rm, next) {

		var assetList = Object.keys(rm.options.assets);

		// Loo through the next asset
		(function nextAsset(assets) {

			var assetName = assets.shift();
			var asset = rm.options.assets[assetName];

			var sourceList = Object.keys(asset.sources).concat();

			// Loop through the next source
			(function nextSource(sources) {

				// Ge the next source
				var source = sources.shift();
				var sourceDef = rm.options.assets[assetName].sources[source];

				var fileList = asset.files.concat();

				var sourceFiles = [];

				// Loop through a set of files
				(function nextFile(files) {

					var file = files.shift();

					// Add some stats to the file for later use, just in case.
					file.rootFolder = asset.name;

					// Check to see if this file is acceptable based on name
					if (rm.options.excludes.files.indexOf(file.name) === -1) {

						// Check to see if the file is withing the source allowable file types
						if (sourceDef.ext.indexOf(file.ext) !== -1) {

							// Check to see if this is suppose to be related to a build directory
							if (asset.build) {

								// Use the build directory,
								var buildDir = (asset.buildDir) ? asset.buildDir : rm.options.paths.buildDir;

								if (file.fullpath.indexOf(buildDir) !== -1) {

									// This file is an acceptable name, extension and in a directory
									sourceFiles.push(file);

								}

							} else {

								// This is an acceptable name and extension, no limit to directory
								sourceFiles.push(file);

							}

						}

					}

					if (files.length !== 0) {
						nextFile(files);
					}

				})(fileList);

				// Remove unneeded source definition
				if (sourceFiles.length !== 0) {

					// Save the files to the source array
					sourceDef['files'] = sourceFiles;

				} else {

					verbose.log(2, "Unable to find any files that match the assets source defintion (" + source + ") in: " + asset.rootpath, "warn");

					delete rm.options.assets[assetName].sources[source];
				}

				if (sources.length !== 0) {
					
					nextSource(sources);
				}



			})(sourceList);

			if (assets.length !== 0) {

				nextAsset(assets);
			} else {

				next(rm);
			}

		})(assetList);
	}

	var paths = function(rm, next) {

		var assetList = Object.keys(rm.options.assets);

		// Loo through the next asset
		(function nextAsset(assets) {

			var assetName = assets.shift();
			var asset = rm.options.assets[assetName];

			var processor = (asset.lazy) ? "lazy" : "include";

			try {

				var processorPath = fs.pathJoin("./", "processors", processor)

				processor = require( "./" + processorPath );

			} catch(e) {

				verbose.log(1, "Processor load failed for: " + processor, "error");

				processor = undefined;

			}

			var sourceList = Object.keys(asset.sources);

			// Loop through the next source
			(function nextSource(sources) {

				// Ge the next source
				var source = sources.shift();
				var sourceDef = rm.options.assets[assetName].sources[source];

				// Only run if a valid processor is found.
				if (processor) {

					// Check for a processor for this type of asset
					if (processor[source]) {
					
						// Call the processor function
						processor[source](asset, sourceDef, rm.options, function(task) {});

					} else {

						verbose.log(1, "Processor not found: " + processor, "error");
					}

				}

				if (sources.length !== 0) {
					
					nextSource(sources);
				} 

			})(sourceList);

			if (assets.length !== 0) {

				nextAsset(assets);
			} else {

				next(rm);
			}

		})(assetList);

		next(rm);
	}

	return {
		assets: assets,
		paths: paths
	}

}

// Expor the manager function as a module
module.exports = exports = new process();