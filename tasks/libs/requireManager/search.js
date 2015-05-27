'use strict';

// Custom node modules
var fs = require('../utilites/fs');
var obj = require('../utilites/object');
var verbose = require('../utilites/verbose');

/**
* Search:
* Searches for asset folders, files and creats a default configuration/ source defintion file list.
*
* Params:
* - none -
* @return - {object} - copy of all public functions used to manage require manager
*/
var search = function() {

	// Function loading a default config of some kind
	function loadConfig(asset, options) {

		// Make a copy of default source in case we need it
		var defaultConfig = obj.copy(options.sources);
		var config = undefined;

		// Check to see if a local config file was present.
		if (asset.config) {

			try  {

				config = fs.readJSON(asset.config);

			} catch(e) {

				verbose.load(2, "Unable to load local config for " + asset.config, "warn");
			}

		} else {

			config = {};
		}

		if (config !== undefined && config.sources !== undefined && config.sources.constructor !== Object) {

			var newSources = {};

			// switch case to determine config needs some alterations
			switch (config.sources.constructor) {

				case Array:

					// Loop through all of the defined types and merge in better defaults from the defaults config.
					(function nextSource(sources) {

						var oldSource = sources.shift();

						if (defaultConfig[oldSource]) {

							newSources[oldSource] = obj.copy(defaultConfig[oldSource]);

						} else {
							verbose.log(1, "Asset defined unknown source type: " + oldSource , "error");
						}

						if (sources.length !== 0) {
							nextSource(sources);
						}

					})(config.sources);

					break;

				case String:

						var oldSource = config.sources;

						if (defaultConfig[oldSource]) {

							newSources[oldSource] = obj.copy(defaultConfig[oldSource]);

						} else {
							verbose.log(1, "Asset defined unknown source type: " + oldSource , "error");
						}

					break;

			}

			config['sources'] = newSources;

		} else {

			config['sources'] = obj.copy(defaultConfig);

		}

		return config;

	}

	// This function performs the recursive file lookup.
	var files = function(rm, next) {

		var keyFiles = rm.options.files;

		(function nextAsset(assets) {

			var assetName = assets.shift();
			var asset = rm.options.paths.discoveredFolders[assetName];

			// Bootstrap the asset configs
			asset.build = false;
			asset.config = false;
			asset.lazy = false;

			// Search parameters
			var assetFilters = {
				filter: {
					folders: true,
				},
				skip: {
					folders: rm.options.excludes.folders
				}
			};

			// Do a recursive search for files in each of the found folders
			fs.recursive(asset.rootpath, assetFilters, function(fileList) {

				// Check to see if there are files in the
				if (fileList.length !== 0) {

					// Go through all of the files looking for specific to help build the asset definition
					(function nextFile(files) {

						var file = files.shift();

						// Check for the config (.asset.json) file
						if (file.name === keyFiles.config) {

							asset.config = file.fullpath;

						  // Check for the presence of a build (Gruntfile.js) file
						} else if (file.name === keyFiles.build) {

							asset.build = file.fullpath;
						}

						if (files.length !== 0) {
							nextFile(files);
						}

					})(fileList.concat());

					var config = loadConfig(asset, rm.options);

					asset = obj.merge(asset, config);

					// Fill in a name if its missing
					if (!asset.name || asset.name === "") {
						asset.name = assetName;
					}

					// Merge the fileList in
					asset.files = fileList;

					// Merge asset config into the rm save space.
					rm.options.assets[assetName] = asset;


				} else {

					// Remove item from discovered list
					delete rm.options.paths.discoveredFolders[assetName];

					verbose.log(2, "Remove " + asset.rootpath + " as there are not usable files in the folder", "warn");
				}

				if (assets.length !== 0) {

					nextAsset(assets);
				} else {

					next(rm);
				}

			});

		})(Object.keys(rm.options.paths.discoveredFolders));

	}

	var folders = function(rm, next) {

		var discoveredPaths = {};

		if (rm.options.paths.assetDir !== 0) {

			// Loop through all the defautl asset root folders
			(function assetFolders(assets) {

				// Source folder to search
				var parentFolder = assets.shift();

				if (rm.options.paths.rootSrc && rm.options.paths.rootSrc !== "") {
					parentFolder = fs.pathJoin(rm.options.paths.rootSrc, parentFolder);
				}

				var sourceFolderList = rm.options.paths.sourceDir.concat();

				// Loop through all of the source folders
				(function sourcesFolder(sources) {

					var source = sources.shift();

					var sourceFolder = fs.pathJoin(parentFolder, source);

					var recursiveFolderSearch = {
						shallow: true,
						filter: {
							files: true
						}
					}

                    try {

    					// Loop through all of the
    					fs.recursive(sourceFolder, recursiveFolderSearch, function(folderList) {

    						(function nextFolder(folders) {

    							// Get the next folder
    							var folder = folders.shift();

    							var discoveredPath = {
    								name: folder.name,
    								rootpath: folder.fullpath
    							};

    							// Checl to see if the folder is in the discovered list
    							if (discoveredPaths[folder.name]) {

    								verbose.log(1, "Overriding " + discoveredPaths[folder.name].rootpath + " with " + discoveredPath.rootpath, "info");
    							}

    							// Merge the proper assets
    							discoveredPaths[folder.name] = discoveredPath;

    							if (folders.length !== 0) {
    								nextFolder(folders);
    							}

    						})(folderList);

    						if (sources.length !== 0) {
    							sourcesFolder(sources);
    						}

    					});

                    } catch(e) {

                        verbose.log(2, "Folder doesn't exist: " + sourceFolder + ", moving to next folder.", "warn");

                        if (sources.length !== 0) {
                            sourcesFolder(sources);
                        }

                    }

				})(sourceFolderList);

				if (assets.length !== 0) {

					assetFolders(assets);
				} else {

					// Save off all the discovered folders
					rm.options.paths.discoveredFolders = discoveredPaths;

					next(rm);
				}

			})(rm.options.paths.assetDir);

		}


	}

    // Return the public namespace
    return {
    	files: files,
    	folders: folders
    }

}

// Expor the manager function as a module
module.exports = exports = new search();