define(['jquery', 'core'], function($, cui) {

    var app = {};

    app.init = function(cb) {

        console.log('Application common script has just run');

        // ====
        // Do all the common stuff here
        // ====

        // Check to see if we have custom page level code declared in callback
        if (typeof(cb) === 'function') {

            // We do, so execute it.
            cb();
        }

    };

    return app;
});
