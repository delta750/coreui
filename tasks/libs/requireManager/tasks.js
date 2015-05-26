'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var verbose = require('../utilites/verbose');
var gruntTasks = require('./processors/gruntTasks');

function tasks() {

	var assets = function(rm, next) {

		var assetList = Object.keys(rm.options.assets);

		(function nextAsset(assets) {

			var assetNames = assets.shift();
			var asset = rm.options.assets[assetNames];

			var searchFilters = {
				filter: {
					files: true
				},
				skip: {
					folders: rm.options.excludes.folders
				}
			}

			// Now to generate tasks based on the existing folder structure
			fs.recursive(asset.rootpath, searchFilters, function(folderList) {

				// Loop through all the different asset folders
				(function nextFolder(folders) {

					// Make sure we have folders to search for.
					if (folderList.length !== 0) {

						// Get the next folder
						var folder = folders.shift();

						// Filter out excluded folders
						if (rm.options.excludes.folders.indexOf(folder.name) === -1) {

							if (asset.build) {

								var buildDir = (asset.buildDir) ?  asset.buildDir : rm.options.paths.buildDir;

								// Ignore build subpath in all cases
								if (folder.name !== buildDir && folder.subpath.indexOf(buildDir) === -1) {

									if (rm.options.paths.specialAssets.indexOf(folder.name) !== -1) {
										
										// We have found a special assets folder.
										// In this case we can simply create copy tasks.
										gruntTasks.process("copy", folder.name, asset, [folder], fs.pathJoin("dist", folder.name), false, function(name, config){

											var task = {
												type: "copy",
												name: name,
												config: config
											}

											gruntTasks.store(asset, rm.options, task);

										});
										
									}

								}

							} else {

								// No build directory to worry about, lets look for the 
								// special folder names
								if (rm.options.paths.specialAssets.indexOf(folder.name) !== -1) {
									
									// We have found a special assets folder.
									// In this case we can simply create copy tasks.
									gruntTasks.process("copy", folder.name, asset, [folder], fs.pathJoin("dist", folder.name), false, function(name, config){

										var task = {
											type: "copy",
											name: name,
											config: config
										}

										gruntTasks.store(asset, rm.options, task);

									});

								}
							}

						};

					}

					if (folders.length !== 0) {
						nextFolder(folders);
					}

				})(folderList)

				if (assets.length !== 0) {
					nextAsset(assets);
				} else {

					next(rm);
				}

			});

		})(assetList);

	}

	return {
		assets: assets
	}

};

// Expor the manager function as a module
module.exports = exports = new tasks();