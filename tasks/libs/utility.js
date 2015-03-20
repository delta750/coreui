var fs = require('fs');
var path = require('path');

// Third Party Libs
var grunt = require('grunt');
var chalk = require('chalk');

// Declare this module
var util = module.exports = {};

/***
 * Logging Functions
 ***/

util.console = function(type, msg) {

    switch (type) {

        case "ok":
            console.log(chalk.green('%s'), msg);
            break;

        case "warnig":
            console.log(chalk.yellow('%s'), msg);
            break;
    }

};

/***
 * Object Functions
 ***/

// Merge two javascript objects into the first.
util.merge = function (obj1, obj2) {

    for (var p in obj2) {
        if (obj2.hasOwnProperty(p)) {
            try {
                // Property in destination object set; update its value.
                if (obj2[p].constructor === Object) {

                    if (obj1[p].constructor !== Object) {
                        obj1[p] = {};
                    }
                    obj1[p] = util.merge(obj1[p], obj2[p]);

                }
                else {
                    obj1[p] = obj2[p];
                }

            }
            catch (e) {

                // Property in destination object not set; create it and set its value.
                obj1[p] = obj2[p];

            }
        }
    }

    return obj1;

};

/***
 * Type (Kind) Functions
 ***/

util.kindOf = function (obj) {
    return grunt.util.kindOf(obj);
};

/***
 * String Functions
 ***/

util.lastPart = function(str, delim) {
    return str.substring(str.lastIndexOf(delim)+1);
}

util.removeExt = function(str) {
    return str.substr(0, str.lastIndexOf('.'));
}

util.removeSpecialChar = function(str) {
    return str.replace(/[&\/\\#,+()$~%.'":*?<>{}]/g, '');
}

util.uCaseFirst = function(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
};


/***
 * Path Cleanup Utilties
 ***/

// Function converts all paths into a common unix like structure.
util.unixifyPath = function(filepath) {

    if (process.platform === 'win32') {
        return filepath.replace(/\\/g, '/');
    }
    else {
        return filepath;
    }

};

/***
 * Write File utilites
 ***/
util.flushFile = function(filePath) {

    var buffer = new Buffer("", 'utf-8');

    // Fix the pathing
    var filePath = this.unixifyPath(filePath);

    // Use write file to over write the orignal
    fs.writeFileSync(filePath, buffer);
}

util.appendToFile = function(filePath, data) {

    var buffer;

    // Create buffer of string
    if (!Buffer.isBuffer(data)) {
        buffer = new Buffer(data, 'utf-8');
    }
    else {
        buffer = data;
    }

    // Fix the pathing
    filePath = this.unixifyPath(filePath);

    // Create or append to the file.
    fs.appendFileSync(filePath, buffer);

}

util.mergeFile = function(target, source) {

    // Get the source file path and clean it up
    source = this.unixifyPath(source);

    // Pull the content out of the file
    var content = fs.readFileSync(source);

    // Merge by using append.
    this.appendToFile(target, content);

};

util.writeJSON = function(target, data) {

    //data = JSON.stringify(data, null, 4);
    //grunt.file.write(target, JSON.stringify(data, null, 4));
    fs.writeFileSync(target, JSON.stringify(data, null, 4));

}