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
		UI.environment.nys
	UI.event
	UI.dom
	UI.ajax
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
	}
}());

/*   .UI.environment.nys
 -------------------------------------- */
UI.environment.nys = (function nys() {
	// private properties
		// constants
	var GOVERNOR_NAME = "Andrew M. Cuomo - <span class='its-italicized'>Governor</span>",
		COMMISSIONER_NAME = "Thomas H. Mattox - <span class='its-italicized'>Commissioner</span>",

		// private methods
		_getGovernor = function _getGovernor() {
			return GOVERNOR_NAME || null;
		},

		_getCommissioner = function _getCommissioner() {
			return COMMISSIONER_NAME || null;
		};

	// reveal public API
	return {
		getGovernor: _getGovernor,
		getCommissioner: _getCommissioner
	}
}());


/* ----------------------------------------
   .UI.event
   ---------------------------------------- */
UI.event = (function event() {
	// private properties
		// private methods
	var _add = null, // see init-time branching

		_dispatch = null, // see init-time branching

		_getElement = function _getElement(ev) {
			var elem = null;

			// create cross browser event (if null)
			if (!ev) {
				ev = window.event;
			}

			// get HTML object
			if (ev.target) {
				elem = ev.target;
			}
			else if (ev.srcElement) { // IE
				elem = ev.srcElement;
			}

			// defeat Safari bug
			if (elem.nodeType === 3) {
				elem = elem.parentNode;
			}

			return elem;
		},

		_preventDefault = function _preventDefault(ev) {
			if (typeof ev.preventDefault === "function") {
				ev.preventDefault();
			}
			else { // IE6 - IE8
				ev.returnValue = false;
			}
		},

		_remove = null, // see init-time branching

		_stop = function _stop(ev) {
			UI.event.preventDefault(ev);
			UI.event.stopPropagation(ev);
		},

		// stop propagation
		_stopPropagation = function _stopPropagation(ev) {
			if (typeof ev.stopPropagation === "function") {
				ev.stopPropagation();
			}
			else {
				ev.cancelBubble = true; // IE6 - IE8
			}
		};


	// init-time branching optimization pattern
	if (window.addEventListener) { // modern browsers
		// add
		_add = function _add(el, type, fn, customFlag) {
			el.addEventListener(type, fn, false);
		}
		// remove
		_remove = function _remove(el, type, fn) {
			el.removeEventListener(type, fn, false);
		}
	}
	else if (window.attachEvent) { // IE6 - IE8
		// add
		_add = function _add(el, type, fn, customFlag) {
			if (!customFlag) {
				el.attachEvent('on' + type, fn);
			}
			else {
				// IE can't handle custom events; instead, we must watch the element's onpropertychange event
				// when that event's propertyName matches fn, fn will be called.
				if (!el[type]) {
					el[type] = 0;
				}
				el.attachEvent("onpropertychange", function (ev) {
					if (ev.propertyName === type) {
						fn(fn);
					}
				});
			}
		}
		// remove
		_remove = function _remove(el, type, fn) {
			el.detachEvent('on' + type, fn);
		}
	}
	else { // older browsers
		// add
		_add = function _add(el, type, fn, customFlag) {
			var currentEventHandler = el['on' + type];
			if (currentEventHandler === null) {
				el['on' + type] = fn;
			}
			else {
				el['on' + type] = function(e) { currentEventHandler(e); fn(e); };
			}
		}
		// remove
		_remove = function _remove(el, type, fn) {
			if (currentEventHandler !== null) { // Older browsers, inline event handlers
				el.removeAttribute('on' + type);
			}
		}
	}

	// dispatch
	if (!document.createEvent) { // IE7 - IE8
		_dispatch = function _dispatch(el, type) {
			// change this property on the object to trigger its event listener
			el[type] = (new Date()).toString().replace(/\W/g, '');
		}
	}
	else {
		_dispatch = function _dispatch(el, type) {
			var ev = document.createEvent("HTMLEvents");
			ev.initEvent(type, true, true);
			return !el.dispatchEvent(ev);
		}
	}

	// revealing public API
	return {
		add: _add,
		dispatch: _dispatch,
		getElement: _getElement,
		preventDefault: _preventDefault,
		remove: _remove,
		stop: _stop,
		stopPropagation: _stopPropagation
	};
}());


/* ----------------------------------------
   .UI.dom
   ---------------------------------------- */
UI.dom = (function dom() {
	// private properties
		// constants
	var SPACE = ' ',
		EMPTY = '',

		// dependencies
		uiEVT = UI.event,

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
				while (element = element.offsetParent) {
					left += element.offsetLeft;
					top += element.offsetTop;
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

	///<summary>Converts a node list or element list into a proper array</summary>
	///<param name="list" type="List">The list to be converted</param>
	/* _priv._toArray */
	_priv._toArray = function _priv_toArray(list) {
		var array = [],
			i = 0;
		try {
			// this method will unpredictably fail on some types of lists
			array = Array.prototype.slice.call(list);
		}
		catch (ex) {
		}

		// Manually copy the contents to a new array
		if (!array.length && list.length) {
			while (i < list.length) {
				array.push(list[i]);
				i++;
			}
		}

		return array;
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
   .UI.ajax
   ---------------------------------------- */
UI.ajax = (function ajax() {
	// Bring it from MyAccount and refactor a little but keep it backwards compatible?
	return {
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
