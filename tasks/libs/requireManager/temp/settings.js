(function () {
var scripts = document.getElementById("require"),
src = scripts.src,
baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf("/cui"));
require.config({ baseUrl: baseUrl, paths:{}
});
// Kicks off the global project scripts
require(['jquery', 'cui', 'domReady!'], function($, cui) {

    // This is the init new line.

    // Declares the first document.ready to make sure this code runs first.
    cui.init();

});
}());