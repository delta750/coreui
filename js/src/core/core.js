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
