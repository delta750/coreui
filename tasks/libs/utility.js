var path = require('path');
var fs = require('fs');
var grunt = require('grunt');

var util = module.exports = {};

util.merge = function(obj1, obj2) {

  for (var p in obj2) {

    try {
      // Property in destination object set; update its value.
      if ( obj2[p].constructor === Object ) {

        if (obj1[p].constructor !== Object) {
            obj1[p] = {};
        }
        obj1[p] = util.merge(obj1[p], obj2[p]);

      } else {
        obj1[p] = obj2[p];
      }

    } catch(e) {

      // Property in destination object not set; create it and set its value.
      obj1[p] = obj2[p];

    }
  }

  return obj1;

};

util.unixifyPath = function(filepath) {

    if (process.platform === 'win32') {
          return filepath.replace(/\\/g, '/');
    } else {
          return filepath;
    }

};

// Function for writing strings to files.
util.writeString = function(filepath, data, cb) {

    //console.log(filepath);

    var buffer;

    // Create buffer of string
    if (!Buffer.isBuffer(data)) {
        buffer = new Buffer(data, "utf-8");
    } else {
        buffer = data;
    }

    // Fix the pathing
    filepath = this.unixifyPath(filepath);

    // Create or append to the file.
    fs.appendFileSync(filepath, buffer);

    cb();

}

util.mergeFile = function(source, target, cb) {

    source = this.unixifyPath(source);

    var content = fs.readFileSync(source);

    this.writeString(target, content, function() {

        cb();

    });

}
