/*
=======================================================================
 New York State Department of Taxation and Finance
 User Interface Team
 Core script (mainly utilities) to be used across projects
=======================================================================

----------------------------------------
 Contents
----------------------------------------
    UI.namespace
    UI.environment
*/

var UI = UI || {};

/* ----------------------------------------
   .UI.namespace
   ---------------------------------------- */
// Non-destructive implementation for creating namespaces or adding properties inside of them
UI.namespace = function _namespace(namespace, parent) {
    var parts = namespace.split('.'),
        i;

    parent = parent || UI;

    // strip redundant leading global
    if (parts[0] === 'UI') {
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
UI.namespace('environment');
UI.namespace('plugin');

/* ----------------------------------------
   .UI.environment
   ---------------------------------------- */
UI.environment = (function environment() {
    // private properties
        // constants
    var IMAGE_PATHS = {
            core:     '../images/core/',
            plugin:   '../images/plugin/',
            skin:     '../images/skin/',
            template: '../images/template/'
        },
        SPACE = ' ',
        EMPTY = '',

        // private API
        _priv = {},

        /* _decodeURL */
        _decodeURL = function _decodeURL(string) {
            return decodeURIComponent(string.replace(/\+/g, SPACE));
        },

        /* _encodeURL */
        _encodeURL = function _encodeURL(string) {
            return encodeURIComponent(string).replace(/%20/g, '+');
        },

        /* _getQueryStringParameter */
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
        },

        /* _getImagesPath */
        _getImagesPath = function _getImagesPath(category) {
            return IMAGE_PATHS[category];
        };

    // _priv API

    // reveal public API
    return {
        decodeURL: _decodeURL,
        encodeURL: _encodeURL,
        getQueryStringParameter: _getQueryStringParameter,
        getVersion: _getVersion,
        getImagesPath: _getImagesPath
    };
}());


/* ----------------------------------------
   .UI.plugin
   ---------------------------------------- */
UI.plugin = (function plugin() {
    // Any global code for app's plugin
    return {
    };
}());
