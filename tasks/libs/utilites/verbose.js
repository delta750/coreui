'use strict';

// Third party modules
var chalk = require('chalk');

/**
* Manager function - this is a function
* @return - {object} - copy of all public functions used to manage require manager
*/
var verbose = function() {

	// Private

	// Variables
	// ============
	var logVerbosity = 0;

	// Functions
	// ============
	var logToScreen = function(type, msg) {

		var color;

		switch (type) {

            case 'info':
                color = chalk.blue;
                break;

			case 'error':
				color = chalk.red;
				break;

			case 'warn':
				color = chalk.yellow;
				break;

			case 'debug':
				color = chalk.white;
				break;

			case 'data':
				color = chalk.gray;
				break;

			default:
				color = chalk.green;
		}

		// Send message to the screen
		if (type !== 'data') {
			console.log(color(msg));
		} else {
			console.log(color(JSON.stringify(msg, null, 4)));
		}

	}


	/**
	 * Sets the verbosity for the whole runtime
	 **/
	var verbosity = function (verbosity) {

		// Save the value into the private verbosity variable.
		if (typeof(verbosity) === 'number') {
			logVerbosity = verbosity;
		}

	}

	var current = function() {

		logToScreen('debug', "Current Log Level: " + logVerbosity);

	}

	var log = function(level, msg, type) {

		// Check to see if the log level is equal too or better than the current verbosity
		if (logVerbosity >= level) {

			// Default all undefined types to info messages.
			if (type === undefined) {
				type = "unknown";
			}

			// Send the message to the screen
			logToScreen(type, msg);

		}

	}

    // Return the public namespace
    return {
    	verbosity: verbosity,
    	current: current,
        log: log
    }

}

// Expor the manager function as a module
module.exports = exports = new verbose();