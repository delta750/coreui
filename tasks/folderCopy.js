module.exports = function(grunt) {

    'use strict';

    // Native modules
    var path = require('path');

    // Custome modules
    var fs = require('./libs/utilites/fs');
    var obj = require('./libs/utilites/object');
    var verbose = require('./libs/utilites/verbose');

    // Define the Grunt Multitask for the Require Manager Task;
    grunt.registerMultiTask(
        'folderCopy',
        'Copy folders and files to the root project docs folder and preserver the original source name. It does this by creating dynamic grunt-copy tasks',
        function () {

            // Iterate the component folders
            this.files.forEach(function(folders) {

                var sourcePath = folders.cwd;
                var searchFolders = folders.folderNames;

                folders.src.forEach(function(folder) {

                    // Full path to the source folder
                    var sourceFolder = path.join(sourcePath, folder);

                    // Array to hold all the folders that need to be copied.
                    var copyFolder = {};

                    // Pull a list of all the folders in this folder
                    fs.recursive(sourceFolder, {shallow: true,filter: {files: true}} , function(folderList) {

                        // Check to see if we have anything
                        if (folderList.length > 0) {

                            var foundDist = false

                            // Loop through each folder found below
                            folderList.forEach(function(subFolders) {

                                // Check to see if its one of the folders we have been looking for
                                if (searchFolders.indexOf(folderList.name) !== -1 ) {

                                    copyFolder[subFolders.name] = subFolders.fullpath;
                                }

                                // Set a flag if we do find a dist folder.
                                if (subFolders.name === "dist") {
                                    foundDist = true;
                                }

                            });

                            // Did we find a dist folder by chance?
                            if (foundDist) {

                                // Search the dist folder.
                                fs.recursive(path.join(sourceFolder, 'dist'), {shallow: true,filter: {files: true}} , function(folderList) {

                                    if (folderList.length > 0) {

                                        // Loop through each folder found below
                                        folderList.forEach(function(subFolders) {

                                            if (searchFolders.indexOf(subFolders.name) !== -1 ) {

                                                copyFolder[subFolders.name] = subFolders.fullpath;
                                            }

                                        });

                                    }

                                });
                            }

                        }

                    });

                    if (Object.keys(copyFolder).length > 0) {

                        // Get a copy of the config
                        var copyTask = grunt.config.get('copy');

                        console.log(copyFolder);

                        (function nextCopy(copies) {

                            var copy = copies.shift();
                            var folderName = folder.split('/')[folder.split('/').length -1];

                            //console.log(folder.split('/')[folder.split('/').length -1]);

                            var cwd = copyFolder[copy];
                            var dest = path.join(copy, folderName);

                            copyTask[folderName + "-" + copy] = {
                                expand: true,
                                cwd: cwd,
                                src: ['**/*.*'],
                                dest: dest
                            }

                            if (copies.length !== 0) {
                                nextCopy(copies);
                            }

                        })(Object.keys(copyFolder));

                        grunt.config.set('copy', copyTask);


                    }

                });

            });

        }
    );

};
