'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var verbose = require('../utilites/verbose');
var gruntTasks = require('./processors/gruntTasks');

function tasks() {

    function copyPath(folder, configPath, asset) {

        var RegEx = /(:)\w+/g;

        var dynamicName;

        while ((dynamicName = RegEx.exec(configPath)) !== null) {

            // Remove the special character
            var partial = dynamicName[0].replace(dynamicName[1], "");
            
            configPath = configPath.replace(dynamicName[0], asset[partial]);

        }

        return configPath;

    }

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

            var specialAssetFolders = Object.keys(rm.options.paths.specialAssets)

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

									if (specialAssetFolders.indexOf(folder.name) !== -1) {

                                        var assetDest = copyPath(folder, rm.options.paths.specialAssets[folder.name], asset);

										// We have found a special assets folder.
										// In this case we can simply create copy tasks.
										gruntTasks.process("copy", folder.name, asset, [folder], assetDest, false, function(name, config){

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
								if (specialAssetFolders.indexOf(folder.name) !== -1) {

                                    // Special Asset destination
                                    var assetDest = copyPath(folder, rm.options.paths.specialAssets[folder.name], asset);

									// We have found a special assets folder.
									// In this case we can simply create copy tasks.
									gruntTasks.process("copy", folder.name, asset, [folder], assetDest, false, function(name, config){

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