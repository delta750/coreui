(function () {
    // Get the required script as the reliable path
    var scripts = document.getElementById('require'),
        src = scripts.src,
        baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf('/cui'));

    // console.log(baseUrl);

    require.config({
        baseUrl: baseUrl,
        paths: {
            // These are cui libs. DO NOT CHANGE!
            'datepicker': 'components/datepicker',

            // Project Components Paths
            'project': 'components'
        },

    });


    // Kicks off the global project scripts
    require(['domReady!', 'jquery', 'cui'], function(domReady, $, cui) {

        // Declares the first document.ready to make sure this code runs first.
        cui.init();

    });
}());