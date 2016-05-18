'use strict';

/*
 * Component Finder - Search:
 * The search step is responsible for locating component/asset folders and getting an initial definition or removing the component
 * from consideration completely. Components removal is purly based on priority root versions overriding component with the same name
 * and component folder not containing files.
 */

// Custom node modules
var fs = require('../utilities/fs');

var _priv = {};

// This private function is for shallow folder search of asset folders (components/libs)
_priv.assetFolderSearch = function _asset_folder_search(path, cb) {

    var searchOptions = {
        shallow: true,
        filter: {
            files:true
        }
    };

    fs.recursive(path, searchOptions, function (folderList) {

        if (folderList.length !== 0) {

            cb(folderList);

        }
        else {

            cb(false);
        }

    });
};

// This private function is for deep crawling potential component folders.
_priv.assetFileSearch = function _asset_file_search(path, excludeFolders, cb) {

    var searchOptions = {
        filter: {
            folders: true
        },
        skip: {
            folders: excludeFolders
        }
    }

    fs.recursive(path, searchOptions, function(fileList) {

        var processFiles = [];

        if (fileList.length !== 0) {

            (function nextFile(fileList) {

                var file = fileList.shift();

                // Remove unneeded demo
                delete file.subpath;
                delete file.directory;
                delete file.file;

                // Push file onto the list
                processFiles.push(file);

                if (fileList.length !== 0) {

                    nextFile(fileList);
                }
                else {

                    // Return process files if any are found
                    if (processFiles.length !== 0) {

                        cb(processFiles);
                    }
                    else {

                        cb(false);
                    }

                }

            })(fileList.concat());

        }
        else {

            cb(false);
        }
    });
};

var search = function _search() {

    var folders = function _folders(rm, next) {

        var options = rm.options;
        var grunt = rm.grunt;
        var roots;
        var subAssetFolders = {};

        // Verify this all starts out good.
        if (Array.isArray(options.rootFolders)) {

            if (options.rootFolders.length !== 0) {

                roots = options.rootFolders.concat();
            }
            else {

                console.log("Invalid Root Folder variable provided: Empty array!");
                console.log("Root folder must be a string path or an array of strings");

                grunt.fail;

            }
        }
        else if (typeof options.rootFolders === "string") {

            roots = [options.rootFolders];
        }
        else {

            console.log("Invalid Root Folder variable provided: " + typeof options.rootFolders);
            console.log("Root folder must be a string path or an array of strings");

            grunt.fail;
        }

        // Lets loop through each of the root folders
        (function nextRoot(roots) {

            var root = roots.shift();

            var rootFolder = fs.pathJoin(options.srcFolder, root);

            // Verify that the root folder exists as it might not.
            if (grunt.file.exists(rootFolder)) {

                var assetFolders = [];

                /* TODO: ========
                 *  Think about supporting blind folder searching.
                 */

                // Check for the asset folders to be defined,

                if (Array.isArray(options.assetTypes)) {

                    if (options.assetTypes.length !== 0) {

                        assetFolders = options.assetTypes.concat();
                    }
                    else {

                        console.log("Invalid Asset Folder variable provided: Empty array!");
                        console.log("Asset folders must be a string path or an array of strings");

                        grunt.fail;

                    }
                }
                else if (typeof options.assetTypes === "string") {

                    assetFolders = [options.assetTypes];
                }
                else {

                    console.log("Invalid Asset Folder variable provided: " + typeof options.assetTypes);
                    console.log("Asset folders must be a string path or an array of strings");

                    grunt.fail;
                }

                // Lets search through all of the sub asset folders.
                (function nextAssetFolder(assetFolders) {

                    var assetFolder = assetFolders.shift();

                    var assetFolderPath = fs.pathJoin(rootFolder, assetFolder);

                    // Test to see if this folder event exists.
                    if (grunt.file.exists(assetFolderPath)) {

                        _priv.assetFolderSearch(assetFolderPath, function(componentFolders) {

                            // Check to see if a folder was returned. If not we this asset
                            if (componentFolders !== false) {

                                // Lets clean up the initial definition
                                for (var i = 0, len = componentFolders.length; i < len; i++) {

                                    var compFolder = componentFolders[i];

                                    // Delete generic properties folders simply dont have
                                    delete compFolder.ext;
                                    delete compFolder.file;
                                    delete compFolder.directory;

                                    // Add some other properties for us.
                                    compFolder.subpath = assetFolderPath;
                                    compFolder.rootpath = rootFolder;
                                    compFolder.root = rootFolder.split('/')[1];

                                    // Check to see if this asset is in place.
                                    if (!subAssetFolders.hasOwnProperty(compFolder.name)) {

                                        // Just add the asset definition
                                        subAssetFolders[compFolder.name] = compFolder;
                                    }
                                    else {

                                        // If somehow the priority is missing, just used the last found copy
                                        if (options.priorityRoot === undefined || options.priorityRoot === null || typeof options.priorityRoot !== 'string') {

                                            subAssetFolders[compFolder.name] = compFolder;
                                        }
                                        else {

                                            // We have a priority folder compare them, fist compare the two
                                            if (compFolder.root === options.priorityRoot) {

                                                // The new folder is the updated version, so update the comp folder definition
                                                subAssetFolders[compFolder.name] = compFolder;
                                            }
                                            // Check to see if the new folder and the saved folder are neither priority folder version, if this happes, just update
                                            else if (compFolder.root !== options.priorityRoot && subAssetFolders[compFolder.name].root !== options.priorityRoot) {

                                                subAssetFolders[compFolder.name] = compFolder;
                                            }

                                        }
                                    }

                                }

                            }

                        });
                    }

                    if (assetFolders.length !== 0) {

                        nextAssetFolder(assetFolders);
                    }
                    else {

                        // Lets see what we found.
                        var componentFolders = Object.keys(subAssetFolders);

                        // Check to see if we even found any folders!
                        if (componentFolders.length) {

                            // Lets loop through the
                            (function nextComponentFolder(components) {

                                var componentName = components.shift();
                                var componentDef = subAssetFolders[componentName];

                                // Using the componentDef info lets go get all source files
                                _priv.assetFileSearch(componentDef.fullpath, options.excludes.folders, function (fileList) {

                                    // Check to see if we found any files
                                    if (fileList !== false) {

                                        subAssetFolders[componentName]['sourceFiles'] = [];

                                        (function nextFile(files) {

                                            var file = files.shift();

                                            // Check to make sure the file is usable based on the ext
                                            if (options.excludes.filesExtensions.indexOf(file.ext) === -1) {

                                                subAssetFolders[componentName]['sourceFiles'].push(file);
                                            }

                                            if (files.length !== 0) {

                                                nextFile(files);
                                            }
                                            else {

                                                // Remove the component if all the files were excluded
                                                if (subAssetFolders[componentName].length === 0) {
                                                    delete subAssetFolders[componentName];
                                                }

                                            }

                                        })(fileList)

                                    }
                                    else {

                                        // So the folder has no files, we need to remove it from the list
                                        delete subAssetFolders[componentName];
                                    }

                                });

                                if (components.length !== 0) {

                                    nextComponentFolder(components);
                                }

                            })(componentFolders.concat());
                        }

                    }

                })(assetFolders);

            }

            if (roots.length !== 0) {

                nextRoot(roots);
            }
            else {

                // Check to see if we have any possible component folders
                if (Object.keys(subAssetFolders).length) {

                    // Merge this into the task config.
                    rm.options.components = subAssetFolders;

                    next(rm);

                }
                else {

                    // We are done!
                    next(false);
                }
            }

        })(options.rootFolders.concat());

    }

    return {
        folders: folders
    }

}

// Export the manager function as a module
module.exports = exports = new search();