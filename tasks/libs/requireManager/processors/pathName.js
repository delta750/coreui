'use strict';

var verbose = require('../../utilites/verbose');

function path() {

	var generate = function(file, preferences, type, reserved, include, lazy) {

		// Place to store names as we move along the process
		var checkList = [];
		var extlessFile = file.name.split('.')[0];
		var finalName = "";

		// Check to see if we have preferred name
		if (preferences) {

			// Check to see if the prefence exists for this file.
			if (preferences.files[extlessFile] && preferences.files[extlessFile].preferred) {
				checkList.push(preferences.files[extlessFile].preferred);
			}

		}

		// Always check the extensionless name
		if (!checkList[extlessFile]) {
			checkList.push(extlessFile);
		}

		// Add a version with the file name and the asset type.
		checkList.push(extlessFile + "-" + type);

		// Check to see if this is a root folder file
		if (file.subpath || file.subpath === "") {
			checkList.push(file.rootFolder + "-" + extlessFile);
		} else {
			checkList.push(file.rootFolder + "-" + file.subpath.replace("/", "-") + "-" + extlessFile);
		}

		// Now that we have a list of items to test, test each on till we run out
		for (var i = 0, len = checkList.length; i <= len; i++) {
			
			// Check to see if name is in use anywhere
			if (reserved.indexOf(checkList[i]) === -1 && !include[checkList[i]] && !lazy[checkList[i]]) {

				finalName = checkList[i];

				break;
			}
		}

		return finalName;
	}

	return {
		generate: generate
	}

};

// Expor the manager function as a module
module.exports = exports = new path();