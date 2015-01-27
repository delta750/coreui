/*
=======================================================================
 New York State Department of Taxation and Finance
 User Interface Team
 Core script (mainly utilities) to be used across projects
=======================================================================

----------------------------------------
 Contents
----------------------------------------
    cui.namespace
    cui.environment
*/

var cui = cui || {};

/* ----------------------------------------
   .cui.namespace
   ---------------------------------------- */
//

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

    // strip redundant leading global
    if (parts[0] === 'cui') {
        parts = parts.slice(1);
    }

    for (i = 0; i < parts.length; i += 1) {
        // create a property if it does not exist
        if (typeof parent[parts[i]] === 'undefined') {
            parent[parts[i]] = {};
        }
        parent = parent[parts[i]];
    }

    return parent;
};

// Public API
cui.namespace('environment');
cui.namespace('plugin');

/* ----------------------------------------
   .cui.environment
   ---------------------------------------- */
cui.environment = (function environment() {
    var SPACE = ' ',

        ////////////////////
        // Public methods //
        ////////////////////

        /**
         * Decodes a URL parameter string
         *
         * @param   {String}  string  Encoded URL component
         *
         * @return  {String}          The decoded URL component
         */
        _decodeURL = function _decodeURL(string) {
            return decodeURIComponent(string.replace(/\+/g, SPACE));
        },

        /**
         * Encodes a URL parameter string
         *
         * @param   {String}  string  Unencoded URL component
         *
         * @return  {String}          The encoded URL component
         */
        _encodeURL = function _encodeURL(string) {
            return encodeURIComponent(string).replace(/%20/g, '+');
        },

        /**
         * Gets the value for a given URL parameter
         *
         * @param   {String}  parameterName  Parameter to find
         * @param   {String}  url            URL (if not provided, the current URL will be used)
         *
         * @return  {String}                 The value of the parameter
         */
        _getQueryStringParameter = function _getQueryStringParameter(parameterName, url) {
            var index = 0,
                queryString = '',
                parameters = [],
                i = 0,
                tokens = [];

            url = url || self.location.href;

            index = url.indexOf('?');
            if (index > -1) {
                queryString = url.substring(index + 1);

                // Remove the hash if any
                index = queryString.indexOf('#');
                if (index > -1) {
                    queryString = url.substring(0, index);
                }

                parameters = queryString.split('&');
                i = parameters.length;

                while ((i -= 1) >= 0) {
                    tokens = parameters[i].split('=');
                    if (tokens.length >= 2) {
                        if (tokens[0] === parameterName) {
                            return _decodeURL(tokens[1]);
                        }
                    }
                }
            }

            return null;
        };

    // reveal public API
    return {
        decodeURL: _decodeURL,
        encodeURL: _encodeURL,
        getQueryStringParameter: _getQueryStringParameter
    };
}());


/* ----------------------------------------
   .cui.plugin
   ---------------------------------------- */
cui.plugin = (function plugin() {
    // Any global code for app's plugin
    return {
    };
}());
