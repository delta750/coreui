/*
=======================================================================
 New York State Department of Taxation and Finance
 User Interface Team
 Core script (mainly utilities) to be used across projects
=======================================================================
*/
define(['jquery', 'lazyLoader'], function($, lazyLoader) {

    // Create the namespace
    var cui = {};

    /**
     * Non-destructive implementation for creating namespaces or adding properties inside of them
     *
     * @param   {String}  namespace  Namespace to be registered
     * @param   {Object}  parent     Parent of namespace
     *
     * @return  {Object}             Parent of namespace
     */
    cui.namespace = function _namespace(namespace, parent) {
        var parts = namespace.split('.'),
            i;

        parent = parent || cui;

        // Strip redundant leading global
        if (parts[0] === 'cui') {
            parts = parts.slice(1);
        }

        for (i = 0; i < parts.length; i += 1) {
            // Create a property if it does not exist
            if (typeof parent[parts[i]] === 'undefined') {
                parent[parts[i]] = {};
            }

            parent = parent[parts[i]];
        }

        return parent;

    };

    /**
     * Simple script init function that needs to run on every page that uses the core ui framework
     */
    cui.init = function() {
        console.log('Loaded cui namespace');
    };

    // Place the lazyloader into the cui namespace.
    cui.load = lazyLoader.load;

    return cui;

});
