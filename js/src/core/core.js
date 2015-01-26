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
UI.namespace = function namespace(namespace, parent) {
	var parts = namespace.split('.'),
		parent = parent || UI,
		i;

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
		KEY_STRING = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=",

		// private API
		_priv = {},
		_userAgent = { name:'', version:'', os:'' },

		// private methods
		// (base64 encoding/decoding: http://rumkin.com/tools/compression/base64.php (modified version by UI team))
		/* _base64Encode */
		_base64Encode = function _base64Encode(string) {
			var result = "",
				sChr1 = "",
				sChr2 = "",
				sChr3 = "",
				sEnc1 = "",
				sEnc2 = "",
				sEnc3 = "",
				sEnc4 = "",
				i = 0;

			while (i < string.length) {
				sChr1 = string.charCodeAt(i++);
				sChr2 = string.charCodeAt(i++);
				sChr3 = string.charCodeAt(i++);

				sEnc1 = sChr1 >> 2;
				sEnc2 = ((sChr1 & 3) << 4) | (sChr2 >> 4);
				sEnc3 = ((sChr2 & 15) << 2) | (sChr3 >> 6);
				sEnc4 = sChr3 & 63;

				if (isNaN(sChr2)) {
					sEnc3 = sEnc4 = 64;
				}
				else if (isNaN(sChr3)) {
					sEnc4 = 64;
				}

				result += KEY_STRING.charAt(sEnc1) + KEY_STRING.charAt(sEnc2) + KEY_STRING.charAt(sEnc3) + KEY_STRING.charAt(sEnc4);
			}

			return result;
		},

		/* _base64Decode */
		_base64Decode = function _base64Decode(string) {
			var result = "",
				sChr1 = "",
				sChr2 = "",
				sChr3 = "",
				sEnc1 = "",
				sEnc2 = "",
				sEnc3 = "",
				sEnc4 = "",
				i = 0;

			// remove all characters that are not A-Z, a-z, 0-9, +, /, or =
			string = string.replace(/[^A-Za-z0-9\+\/\=]/g, "");

			while (i < string.length) {
				sEnc1 = KEY_STRING.indexOf(string.charAt(i++));
				sEnc2 = KEY_STRING.indexOf(string.charAt(i++));
				sEnc3 = KEY_STRING.indexOf(string.charAt(i++));
				sEnc4 = KEY_STRING.indexOf(string.charAt(i++));

				sChr1 = (sEnc1 << 2) | (sEnc2 >> 4);
				sChr2 = ((sEnc2 & 15) << 4) | (sEnc3 >> 2);
				sChr3 = ((sEnc3 & 3) << 6) | sEnc4;

				result += String.fromCharCode(sChr1);

				if (sEnc3 != 64) {
					result += String.fromCharCode(sChr2);
				}
				if (sEnc4 != 64) {
					result += String.fromCharCode(sChr3);
				}
			}

			return result;
		},

		/* _decodeURL */
		_decodeURL = function _decodeURL(string) {
			return decodeURIComponent(string.replace(/\+/g, SPACE));
		},

		/* _encodeURL */
		_encodeURL = function _encodeURL(string) {
			return encodeURIComponent(string).replace(/%20/g, '+');
		},

		/* _getBrowser */
		_getBrowser = function _getBrowser() {
			return _userAgent.name || null;
		},

		/* _getBrowserVersion */
		_getBrowserVersion = function _getBrowserVersion() {
			return _userAgent.version || null;
		},

		/* _getOS */
		_getOS = function _getOS() {
			return _userAgent.os || null;
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
	/* _priv._getUserAgent */
	// browser sniffing (http://www.quirksmode.org/js/detect.html (modified version by UI team))
	_priv._getUserAgent = function _priv_getUserAgent() {
		var versionSearchString = '',
			dataBrowser = [
				{ string: navigator.userAgent, subString: 'Chrome', identity: 'Chrome' },
				{ string: navigator.userAgent, subString: 'OmniWeb', versionSearch: 'OmniWeb/', identity: 'OmniWeb' },
				{ string: navigator.vendor, subString: 'Apple', identity: 'Safari', versionSearch: 'Version' },
				{ property: window.opera, identity: 'Opera', versionSearch: 'Version' },
				{ string: navigator.vendor, subString: 'iCab', identity: 'iCab' },
				{ string: navigator.vendor, subString: 'KDE', identity: 'Konqueror' },
				{ string: navigator.userAgent, subString: 'Firefox', identity: 'Firefox' },
				{ string: navigator.vendor, subString: 'Camino', identity: 'Camino' },
				{ string: navigator.userAgent, subString: 'Netscape', identity: 'Netscape' },
				{ string: navigator.userAgent, subString: 'MSIE', identity: 'Internet Explorer', versionSearch: 'MSIE' },
				{ string: navigator.userAgent, subString: 'Gecko', identity: 'Mozilla', versionSearch: 'rv' },
				{ string: navigator.userAgent, subString: 'Mozilla', identity: 'Netscape', versionSearch: 'Mozilla' }
			],
			dataOS = [
				{ string: navigator.platform, subString: 'Win', identity: 'Windows' },
				{ string: navigator.platform, subString: 'Mac', identity: 'Mac' },
				{ string: navigator.platform, subString: 'Linux', identity: 'Linux' },
				{ string: navigator.userAgent, subString: 'iPhone', identity: 'iPhone/iPod/iPad' },
				{ string: navigator.userAgent, subString: 'Android', identity: 'Android' },
				{ string: navigator.userAgent, subString: 'Blackberry', identity: 'Blackberry' }
			],
			__searchString = function __searchString(key) {
				if (typeof key === 'undefined') { return false; }

				var i = key.length,
					dataString = '',
					dataProperty = '',
					j = 0;

				while (j < i) {
					dataString = key[j].string;
					dataProperty = key[j].property;
					versionSearchString = key[j].versionSearch || key[j].identity;

					if (dataString) {
						if (dataString.indexOf(key[j].subString) != -1) {
							return key[j].identity;
						}
					}
					else if (dataProperty) {
						return key[j].identity;
					}
					j++;
				}
			},
			__searchVersion = function __searchVersion(dataString) {
				var i = dataString.indexOf(versionSearchString);

				if (i > -1) {
					return parseFloat(dataString.substring(i + versionSearchString.length + 1));
				}
			};

		// init-time branching; run browser sniffing once then just refer to obtained values
		_userAgent.name = __searchString(dataBrowser) || "Unknown browser";
		_userAgent.version = __searchVersion(navigator.userAgent) || __searchVersion(navigator.appVersion) || "Unknown version";
		_userAgent.os = __searchString(dataOS) || "Unknown OS";
	};

	_priv._getUserAgent();

	// reveal public API
	return {
		base64Encode: _base64Encode,
		base64Decode: _base64Decode,
		decodeURL: _decodeURL,
		encodeURL: _encodeURL,
		getBrowser: _getBrowser,
		getBrowserVersion: _getBrowserVersion,
		getOS: _getOS,
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

		// private methods
		///<summary>Returns array of elements matching the specified CSS class(es)</summary>
		///<param name="node" type="DOM Object">The sender object to search within</param>
		///<param name="tag" type='string'>The type of element to search within (optional)</param>
		///<param name="classNames" type='string'>The class name(s) to look for (one or more)</param>
		///<returns>Returns an array of elements with the specified class name(s)</returns>
		_getElementsByClassName = function _getElementsByClassName(node, tag, classNames) {
			// set defaults if these parameters weren't specified
			if (typeof node !== 'object') { node = document; }
			if (!tag) { tag = '*'; }

			var i = 0,
				j = 0,
				nodes = [],
				classes = _priv._cleanClassNames(classNames).split(SPACE),
				elements = node.getElementsByTagName(tag);

			// loop through elements and check each one's classes against the list
			while (i < elements.length) {
				j = classes.length;
				while ((j -= 1) >= 0) {
					if (_hasClass(elements[i], classes[j])) {
						nodes.push(elements[i]);
						// quit the classes loop so this element doesn't get added again if it matches another class
						break;
					}
				}
				i++;
			}

			return nodes;
		},

		///<summary>Returns true if the element has the specified class, otherwise returns false</summary>
		///<param name="element" type="DOM Object">The DOM element to check</param>
		///<param name="className" type='string'>The class name to check for</param>
		///<returns>True if className is present on elem</returns>
		_hasClass = function _hasClass(element, className) {
			var result = false,
				className = (typeof className === 'string') ? _trim(className) : EMPTY;

			// fix elem if 'this' was passed in IE
			if (!element && window.event) { element = window.event.srcElement; }

			// check parameters
			if (element.className && className.length > 0) {
				// test for the class
				result = (SPACE + element.className + SPACE).indexOf(SPACE + className + SPACE) > -1;
			}

			return result;
		},

		///<summary>Returns true if the element now has the specified class, otherwise returns false</summary>
		///<param name="element" type="DOM Object">The DOM element to check</param>
		///<param name="className" type='string'>The class name to add</param>
		///<returns>True if className is present on elem</returns>
		_addClass = function _addClass(element, className) {
			var result = false;

			// fix elem if 'this' was passed in IE
			if (!element && window.event) { element = window.event.srcElement; }

			if (element && typeof className === 'string') {
				if (!element.className) {
					element.className = _priv._cleanClassNames(className);
					result = true;
				}
				else if (_hasClass(element, className)) {
					result = false;
				}
				else {
					// add class name and clean up extraneous spaces
					element.className = _priv._cleanClassNames(element.className + SPACE + className);
					result = true;
				}
			}

			return result;
		},

		///<summary>Returns true if the element no longer has the specified class, otherwise returns false</summary>
		///<param name="element" type="DOM Object">The DOM element to check</param>
		///<param name="className" type='string'>The class name to remove</param>
		///<returns>True if className wasn't present on elem</returns>
		_removeClass = function _removeClass(element, className) {
			var result = false,
				regExp = null;

			// fix oSender if 'this' was passed in IE
			if (!element && window.event) { element = window.event.srcElement; }

			// check parameters
			if (element && typeof className === 'string') {
				// make sure the class exists
				if (_hasClass(element, className)) {
					// remove class name and clean up extraneous spaces
					regExp = new RegExp('(^|\\s)' + _priv._cleanClassNames(className) + '(\\s|$)', 'g');
					element.className = _priv._cleanClassNames(element.className.replace(regExp, SPACE));
					result = true;

					// here we should remove class attribute if empty
					if (element.className === '') {
						element.removeAttribute('class');
					}
				}
			}

			return result;
		},

		///<summary>Simultaneously add/remove classnames from an element</summary>
		///<param name="element" type="DOM Object">The DOM element to be changed</param>
		///<param name="sClasses" type='string'>Space-separated class names</param>
		///<returns>Updated class list, or false upon failure</returns>
		///<remark>Useful with CSS transitions and to prevent FOUC</remark>
		_toggleClass = function _toggleClass(element, classNames) {
			var result = false,
				classes = [],
				i = 0,
				numClasses = 0,
				hasChanged = false,
				elementClass = '',
				klass = ''; // klass with 'k' since class is a reserved word

			if (element && typeof classNames === 'string') {
				classes = _priv._cleanClassNames(classNames).split(SPACE);
				i = 0;
				numClasses = classes.length;
				elementClass = SPACE + _priv._cleanClassNames(element.className) + SPACE;

				while (i < numClasses) {
					klass = SPACE + classes[i] + SPACE;
					if (elementClass.indexOf(klass) < 0) {
						elementClass += klass;
						hasChanged = true;
					}
					else {
						elementClass = elementClass.replace(klass, SPACE);
						hasChanged = true;
					}
					i++;
				}

				if (hasChanged) {
					// apply updated class list to the element
					element.className = _priv._cleanClassNames(elementClass);
					result = element.className;
				}
			}

			return result;
		},

		// new class must exist
		// if no old class then just add new class
		// replace and maintain classes order
		_replaceClass = function _replaceClass(element, oldClassName, newClassName) {
			var result = false,
				from = (typeof oldClassName === 'string') ? _trim(oldClassName) : EMPTY,
				to = (typeof newClassName === 'string') ? _trim(newClassName) : EMPTY;

			if (element && to.length > 0) {
				if (element.className) {
					if (_hasClass(element, from)) {
						element.className = element.className.replace(from, to);
					}
					else {
						_addClass(element, to);
					}
				}
				else {
					_addClass(element, to);
				}

				result = true;
			}

			return result;
		},

		_trim = function _trim(string, separator) {
			// default case, just trim leading and ending spaces
			if (!separator || typeof separator !== "string") {
				return string.replace(/^\s+|\s+$/g, '');
			}

			// also trim around the specified separator
			var separatorInner = new RegExp("\\s*" + separator + "+\\s*", "g"),
				separatorBegin = new RegExp("^\\s*" + separator + "+\\s*", "g"),
				separatorEnd   = new RegExp("\\s*" + separator + "+\\s*$", "g");

			return string.replace(/^\s+|\s+$/g, '').replace(separatorInner, separator).replace(separatorBegin, '').replace(separatorEnd, '');
		},

		///<summary>Basic query selector</summary>
		///<param name="selector" type="String">Comma-separated list of CSS selectors</param>
		///<param name="node" type="DOM Object">Optional node to search within</param>
		///<param name="settings" type="Object">Optional settings: filter (function to test against each element; if defined, failed objects are omitted), toArray (Boolean, force the returned result to be an actual array)</param>
		///<returns>An array of matched elements</returns>
		///<remarks>Only supports basic selectors: #id, .class, and tag name.</remarks>
		/* _query */
		_query = function _query(selector, node, settings) {
			var elements = [],
				isArray = false,
				selectors = selector.replace(/\s*\,\s*/,',').split(','),
				singleSelector = (selectors.length === 1),
				tagName,
				property,
				i = 0,
				node = node || document,
				filter = null,
				toArray = false;

			// check settings
			settings = settings || {filter:null, toArray:false};
			filter = settings.filter || null;
			toArray = settings.toArray || false;

			// loop through each selector
			while (i < selectors.length) {
				selector = selectors[i];
				// by class name
				if (selector.indexOf('.') > -1) {
					tagName = selector.split('.')[0] || "*";
					property = selector.split('.')[1] || "";
					// if there is only one selector or the previous selectors did not return
					//   anything, this will be the only set of results so far
					if (singleSelector || !elements.length) {
						elements = _getElementsByClassName(node,tagName,property);
					}
					else {
						// otherwise, these results will need to be concatenated with the others
						//   so we need an actual array
						if (!isArray && elements.length) {
							elements = _priv._toArray(elements);
						}
						elements = elements.concat(_getElementsByClassName(node,tagName,property));
					}
					isArray = true; // getElementsByClass() always returns an array
				}
				else if (selector.indexOf('#') > -1) { // By element ID
					// get the ID
					property = selector.substr(selector.indexOf('#')+1);
					if (node.getElementById(property)) {
						// if the results list is not already an array and it's not empty, it must be converted first
						if (!singleSelector && !isArray && elements.length) {
							elements = _priv._toArray(elements);
						}
						elements.push(node.getElementById(property));
						isArray = true;
					}
				}
				else { // by tag name
					// don't need to convert to an array if these are the only results so far
					if (singleSelector || !elements.length) {
						elements = node.getElementsByTagName(selector);
					}
					else {
						if (!isArray && elements.length) {
							elements = _priv._toArray(elements);
							isArray = true;
						}
						elements = elements.concat(_priv._toArray(node.getElementsByTagName(selector)));
					}
				}
				i++;
			}

			// convert to array based on settings, if it hasn't been done already
			if (!isArray && (toArray || filter)) {
				elements = _priv._toArray(elements);
				isArray = true;
			}

			// filter results
			if (filter) {
				elements = elements.filter(filter);
			}

			return elements;
		},

		///<summary>Gets the parent object of element that matches the other two parameters</summary>
		///<param name="element" type="DOM Object">The element whose ancestors will be searched</param>
		///<param name="targets" type="String">the actual tag or .class names, space-separated</param>
		_getParentElement = function _getParentElement(element, targets) {
			var targetValues = [],
				node = element,
				i = 0,
				__testElem = function __testElem(_node, value) {
					if (value.indexOf('.') === 0) {
						return UI.dom.hasClass(_node, value.substr(1));
					}
					else {
						return _node.nodeName.toLowerCase() === value;
					}
				};

			// normalize input values and place them into an array so we can loop through them
			targetValues = targets.replace(/^\s+|\s+$/g,'').replace(/\s+/g,' ').split(' ');

			// loop through each ancestor node, beginning with element
			while (!/^body$|^html$/i.test(node.nodeName)) {
				// Check current node against each target value
				i = targetValues.length;
				while ((i -= 1) >= 0) {
					if (__testElem(node, targetValues[i])) {
						return node;
					}
				}
				node = node.parentNode;
			}

			return null;
		};

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
				// IE8-
				value = element.currentStyle[style.replace(/-\b[a-z]/g, function __toUpperCase() {return arguments[0].toUpperCase()}).replace(/-/g, '')];
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

	// _priv API
	/* _priv._cleanClassNames */
	_priv._cleanClassNames = function _priv_cleanClassList(classnames) {
		return _trim(classnames).replace(/\s+/g, SPACE);
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
		getElementsByClassName: _getElementsByClassName,
		hasClass: _hasClass,
		addClass: _addClass,
		removeClass: _removeClass,
		toggleClass: _toggleClass,
		replaceClass: _replaceClass,
		trim: _trim,
		query: _query,
		getParentElement: _getParentElement,
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