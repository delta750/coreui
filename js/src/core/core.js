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
    UI.dom
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
UI.namespace('environment.nys');
UI.namespace('event');
UI.namespace('dom');
UI.namespace('ajax');
UI.namespace('plugin');

/* ----------------------------------------
   .UI.environment
   ---------------------------------------- */
UI.environment = (function environment() {
    // private properties
        // constants
    var VERSION = { name:'UI', version:'1.0.0', date:'20120326' }, // module versioning
        IMAGE_PATHS = {
            core: '/images/common/',
            plugin: '/images/plugin/',
            skin: '/images/skin/',
            template: '/images/template/'
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

        // currently only global version for core.js; if we separate event, dom, environment, etc into single files that can be added
        // (or not) as needed to a project then they could each get their own version and be registered (i.e. UI.register(...))
        /* _getVersion */
        _getVersion = function _getVersion(name) {
            return VERSION || null;
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
   .UI.dom
   ---------------------------------------- */
UI.dom = (function dom() {
    // private properties
        // constants
    var
        // private API
        _priv = {},

        ///<summary>Sets focus on particular element</summary>
        ///<param name="element" type="DOM Object" required="true">Element object or element's id to set focus to</param>
        _setFocus = function _setFocus(element) {
            var node = element;

            if (typeof node === "string") {
                node = document.getElementById(node);
            }

            // set focus on element
            if (node) {
                if (node.focus) {
                    node.focus();
                }
            }
        },

        ///<summary>Returns element's (x,y) position in pixels with respect to the page's viewport</summary>
        ///<param name="element" type="DOM Object">The sender object</param>
        ///<returns>Array with x=[0] and y=[1]</returns>
        _getElementPosition = function _getElementPosition(element) {
            var left = 0,
                top = 0;

            if (element.offsetParent) {
                left = element.offsetLeft;
                top = element.offsetTop;
                while (element) {
                    left += element.offsetLeft;
                    top += element.offsetTop;

                    element = element.offsetParent;
                }
            }

            return [left,top];
        },

        ///<summary>Determines if object is array</summary>
        ///<param name="object" type="DOM Object">The object to be checked</param>
        ///<returns>True if it is of array type, false if it is not of array type</returns>
        _isArray = function _isArray(object) {
            // check if Array.isArray exists, otherwise check the conventional way
            if (typeof Array.isArray === 'undefined') {
                return Object.prototype.toString.call(object) === '[object Array]';
            }
            else {
                return Array.isArray(object);
            }
        },

        ///<summary>Returns element's computed style value</summary>
        ///<param name="element" type="DOM Object">The sender object</param>
        ///<param name="style" type="string">Style to get computed value from</param>
        ///<returns>Value for computed style</returns>
        ///<remarks>Style param pattern: border-top-width, padding-left, etc. For older browsers, the "-" is removed and its following letter capitalized: i.e. borderTopWidth</remarks>
        _getComputedStyle = function _getComputedStyle(element, style) {
            var value = 0;

            try {
                // modern browsers
                value = getComputedStyle(element, '').getPropertyValue(style);
            }
            catch (e) {
                // IE8
                value = element.currentStyle[style.replace(/-\b[a-z]/g, function __toUpperCase() {return arguments[0].toUpperCase();}).replace(/-/g, '')];
            }
            finally {
                if (isNaN(parseInt(value, 10))) {
                    return -1;
                }
                else {
                    return value;
                }
            }
        };

    // revealing public API
    return {
        setFocus: _setFocus,
        getElementPosition: _getElementPosition,
        isArray: _isArray,
        getComputedStyle: _getComputedStyle
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
