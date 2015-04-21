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
        // `cui` namespace is now loaded
    };

    // Place the lazyloader into the cui namespace.
    cui.load = lazyLoader.load;

    /////////////////////
    // Browser support //
    /////////////////////

    // CSS calc()
    (function () {
        var prop = 'width:';
        var value = 'calc(10px);';
        var el = document.createElement('div');
        var prefixes = ['-webkit-', '-moz-', '-o-', '-ms-', ''];

        el.style.cssText = prop + prefixes.join(value + prop) + value;

        // No support
        if (!el.style.length) {
            $(document.documentElement).addClass('no-csscalc');
        }
        // Does support `calc` -- uncomment this if we ever need this class
        // else {
        //     $(document.documentElement).addClass('csscalc');
        // }
    }());

    // Flex box
    // Adapted from Modernizr 2.8.3
    (function () {
        var mStyle = document.createElement('modernizr').style;

        function testProps(props) {
            var prop;
            var i;

            for (i in props) {
                prop = props[i];

                if (prop.indexOf('-') === -1 && mStyle[prop] !== undefined) {
                    return true;
                }
            }

            return false;
        }

        function testPropsAll(prop) {
            var cssomPrefixes = ['Webkit', 'Moz', 'O', 'ms'];
            var ucProp = prop.charAt(0).toUpperCase() + prop.slice(1);
            var props = (prop + ' ' + cssomPrefixes.join(ucProp + ' ') + ucProp).split(' ');

            return testProps(props);
        }

        // These two tests are for modern and legacy flex box implementations, respectively
        if (!testPropsAll('flexWrap') && !testPropsAll('boxDirection')) {
            $(document.documentElement).addClass('no-flexbox');
        }
    }());

    return cui;

});
