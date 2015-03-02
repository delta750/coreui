(function () {
var scripts = document.getElementById('require'),
src = scripts.src,
baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf('/cui'));
require.config({ baseUrl: baseUrl, paths:{
    "datepicker": "components/datepicker",
    "datepickerStyle": "../css/components/datepicker",
    "renderer": "components/renderer",
    "testComponent": "components/testComponent",
    "testComponentStyle": "../css/components/testComponent",
    "testComponent2": "components/testComponent2",
    "tooltip": "components/tooltip",
    "tooltipStyle": "../css/components/tooltip"
}
});
// Kicks off the global project scripts
require(['jquery', 'cui', 'domReady!'], function($, cui) {

    // This is the init new line.

    // Declares the first document.ready to make sure this code runs first.
    cui.init();

});
}());