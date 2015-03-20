define(['jquery', 'cui', 'kind', 'css!tooltipStyle'], function($, cui, kind) {
    cui.tooltip = (function tooltip() {
        var
            // Constants
            ID_SUFFIX = '_tooltip',
            DATA_ATTR_PREFIX = 'tt', // For example, the 'tt' in 'data-tt-my-custom-attribute'
            DEFAULT_WIDTH = 400,
            MESSAGE_TYPES = ['error', 'warning', 'info', 'success'],

            // Globals
            _priv = {},
            _public = {},
            _client = {
                hasBeenSet: false, // Whether the client properties have been set (only necessary once per page load)
                focusedElem: null  // Element within a tooltip that currently has focus
            },
            _events = {},
            _tooltipList = {}, // List of all created tooltips and their properties
            _configs = {},
            // _imgPath = '',
            _offsets = {},
            _linkSelectors = '.tooltip', // '.has-tooltip',

            // Default tooltip object. Instances of this object are usually named 'TT' within JS functions.
            _defaultTooltipObj = {
                configId: 'default',
                // Stored DOM elements for quick retrieval
                tooltipElem: null,
                invokerElem: null, // Invoker
                targetElem: null, // Element around which the tooltip will be positioned
                linkTitle: {
                    show: 'Show more information',
                    hide: 'Hide the tooltip'
                },
                // Default position/measurement values
                offsets: {
                    parent: {
                        x: 0,
                        y: 0
                    }
                },
                width: DEFAULT_WIDTH,
                // Flags; see _priv.show() method for more about these
                isWidthDetermined: false // For wide images
            },

            // Default configuration object
            _defaultConfigObj = {
                selector: '.tooltip', // selector to match the link(s) that will invoke the tooltip(s)
                clearOtherTooltips: true, // Close any open tooltips before showing this one
                containerClass: '', // Can be space-separated list. Will always include the class 'tooltip' before these
                pointerPosition: 'topright', // Request only; may change based on window size/position.
                // Can be empty string, none, topleft, lefttop, etc. Lack of left/right will make it centered
                closeButtonText: 'Close',
                closeButtonPosition: 'none', // Position of button's containing div relative to tooltip body <div>. Above, below, or none/empty string.
                closeOnBlur: true,
                contentIdSourceAttr: 'href', // Attribute of the link which contains the ID of the tooltip's content's element; leading '#' stripped for href
                offsets: {}, // Relative offsets that will be added to the global & client offset values. Must match structure of _offsets.
                width: DEFAULT_WIDTH,
                cacheTooltips: true, // Whether to keep the generated tooltip <div> in the DOM once it closes
                dynamicContent: null // Object containing handlers for tooltips with dynamic or asynchronous content
            },

            // Default settings for ephemeral content
            _defaultSettingsObj = {
                body: {
                    html: ''
                },
                messages: [],
                target: {
                    id: ''
                }
            },

            CLASSES = {
                invoker: 'toolip',
                tooltip: 'tt',
                hasEvents: 'has-tooltip-events',
                closeButton: 'tt-close',
                closeWrapper: 'tt-close-wrapper',
                body: 'tt-body'
            },

            SELECTORS = {
                invoker: '.toolip',
                tooltip: '.tt',
                closeButton: '.tt-close',
                body: '.tt-body'
            },

            // Element caches
            $body, $window,

            // Init
            // ---------------------------------------------------------------------

            _init = function _init() {
                $body = $('body');
                $window = $(window);

                // Client variables
                _client.setup();

                // Event listeners
                _events.setup.page();
            };

        _events.setup = {};
        _events.setup.pageHasBeenSetup = false;

        _configs['default'] = _defaultConfigObj;

        // Client- and config-based offsets
        _offsets = {
            // Tooltip container <div>
            position: {
                x: 16,
                y: 9
            },

            // Additional, relative adjustments when the link is in a <th>, <td>, or <h4>
            tagTH: {
                x: 0,
                y: 0
            },
            tagTD: {
                x: 0,
                y: 2
            },
            tagH4: {
                x: 0,
                y: 0
            },
            expandedTable: {
                x: -1,
                y: 5
            }, //iflow

            // Pointer offsets are relative to the tooltip <div> and dependent on the pointer's width
            // 'Before' is the border, 'After' is the fill
            // (before.x = after.x + 1), and (before.y = after.y - 1)
            pointer: {
                x: -19,
                y: -19,
                borderWidth: 1
            },

            // Used when a tooltip is left-aligned to the viewport and the pointer slides along its top
            variablePointer: {
                x: -3,
                y: -20,
                borderWidth: 1
            },

            // Additional, relative adjustment when there is no pointer
            noPointer: {
                x: 0,
                y: 13
            }
        };


        /**
         * Initialize all tooltip icons on the page
         */

        // Client
        // ---------------------------------------------------------------------

        ///<summary>Sets global variables and may create objects and preload images</summary>
        ///<remark>Only needs to be run once per full-page load (i.e., doesn't need to run after ajax)</remark>
        _client.setup = function _client_setup() {
            if (_client.hasBeenSet) {
                return false;
            }

            // Set a flag so this function won't run again
            _client.hasBeenSet = true;
        }; // end _client.setup

        // Configs
        // ---------------------------------------------------------------------

        _priv.config = {};

        // Add a config to the list
        // Will override an existing config with the same name
        // Returns config object (may be modified when validated) if it was successful, otherwise null
        _priv.config.register = function _priv_config_add(configId, configObject) {
            if (!configId || typeof configId !== 'string') {
                return null;
            }

            configObject = _priv.config.normalize(configObject);

            if (_configs[configId]) {
                // Apply changes to the existing config
                configObject = $.extend(true, {}, _configs[configId], configObject);
            }

            // Add config to the list and update global selectors
            _configs[configId] = configObject;
            _priv.config.updateSelectors(configObject.selector);

            // Pointer image
            _client.setup();

            // Run init again

            // Event listeners
            _events.setup.page();

            return configObject;
        };

        // Validates and corrects a config object
        // Returns the object if it's okay, otherwise null
        _priv.config.normalize = function _priv_config_normalize(config) {
            var defaults = _configs['default'],
                prop = '';

            if (kind(config) !== 'object') {
                return defaults;
            }

            // Selector is required
            if (!config.selector || typeof config.selector !== 'string' || (typeof config.selector === 'string' && $.trim(config.selector).length === 0)) {
                return null;
            }

            // Replace missing/invalid properties with ones from the default config
            for (prop in defaults) {
                if (defaults.hasOwnProperty(prop) && defaults[prop] !== null) {
                    if (typeof config[prop] === 'undefined' || kind(config[prop]) !== kind(defaults[prop])) {
                        config[prop] = defaults[prop];
                    }
                }
            }

            return config;
        };

        // Update the selector that is used to find tooltip-invoking links on the page
        _priv.config.updateSelectors = function _priv_config_updateSelectors(selectorsToAdd) {
            var selectors = [];

            if (selectorsToAdd.length > 0) {
                selectors = _linkSelectors.split(',').concat(selectorsToAdd.split(','));
                _linkSelectors = selectors.join(',');
            }

            return _linkSelectors;
        };

        ////////////
        // Events //
        ////////////

        // Add page-level event listeners. This should only be called once per page load
        _events.setup.page = function _events_setup_page() {
            _events.setup.links();

            if (_events.setup.pageHasBeenSetup) {
                return false;
            }

            // Re-position open tooltips when the page's layout has changed
            $window.on('resize', _events.onWindowResize);

            _events.setup.pageHasBeenSetup = true;
        };

        /**
         * Add event listeners to links
         * @param   {String}  sContainerSelector  Optional selector for node(s) to search within (otherwise, searches entire document)
         * @param   {Object}  options             Optional settings: `forceSetup` (boolean) forces links to be setup even if they appear to have been setup already
         * @return  {Number}                      Number of links that were setup
         */
        _events.setup.links = function _events_setup_links(sContainerSelector, options) {
            var $containers = [],
                settings = $.extend(true, {}, {forceSetup: false}, options),
                setupCount = 0;

            // Get any specified containers
            if (sContainerSelector && typeof sContainerSelector === 'string') {
                $containers = $(sContainerSelector);
            }

            // Default to the document if no containers were specified or found
            if (!$containers.length) {
                $containers = $body;
            }

            $containers.each(function () {
                var $container = $(this),
                    configId, c,
                    prepareLink = function _prepareLink() {
                        var $invoker = $(this);

                        // Only add events to each link once
                        if (!settings.forceSetup && $invoker.hasClass(CLASSES.hasEvents)) {
                            return true;
                        }

                        $invoker.addClass(CLASSES.hasEvents);

                        // Make sure the link has an ID
                        _priv._establishElementId(this);

                        // Store config ID
                        $invoker.attr(_priv.getDataAttrPrefix() + 'config', configId);

                        // Add event listeners
                        $invoker.on('click', _events.onLinkClick);
                        $invoker.on('keydown', _events.onLinkKeydown);

                        setupCount++;
                    };

                for (c in _configs) {
                    if (_configs.hasOwnProperty(c)) {
                        configId = c;
                        // Prepare the links
                        $container.find(_configs[c].selector).each(prepareLink);
                    }
                }
            }); // end container loop

            return setupCount;
        }; // end _events.setup.links()

        ///<summary>Adds event listeners to a particular tooltip</summary>
        ///<param name="tooltipElem" type="DOM Element">div.tooltip</param>
        ///<param name="aLinks" type="Array">Links within the tooltip (Optional; they're often already known)</param>
        _events.setup.tooltip = function _events_setup_tooltip(tooltipElem, aLinks) {
            var $tooltipElem;

            if (kind(tooltipElem) !== 'element') {
                return false;
            }

            $tooltipElem = $(tooltipElem);

            $tooltipElem
                .on('focus', _events.onFocus)
                .on('keydown', _events.onTooltipKeydown)
                .on('click', _events.onTooltipClick);

            // Listeners for links and buttons
            if (!aLinks || (!/array|nodelist/.test(kind(aLinks)))) {
                // Neither a DOM list nor array was given
                aLinks = $tooltipElem.find('a, input, ' + SELECTORS.closeButton).filter('[tabindex]');
            }
            else {
                // Turn into a jQuery object
                aLinks = $(aLinks);
            }

            aLinks.each(function () {
                $(this).on('focus', _events.onFocus);
            });
        };

        ///<summary>Reposition the open tooltip when the window is resized</summary>
        ///<param name="event" type="Event">Window resize</param>
        _events.onWindowResize = function _onWindowResize( /*evt*/ ) {
            _priv.repositionAll();
        };

        ///<summary>Close the tooltip when the user clicks outside of it</summary>
        ///<param name="event" type="Event">Mouse click</param>
        _events.onBodyClick = function _events_onBodyClick(evt) {
            // Check whether click was on or inside a tooltip
            if (!$(evt.target).closest(SELECTORS.tooltip).length) {
                _priv.hideAll();
            }
        };

        /**
         * Handles all clicks on a tooltip
         * @param   {Event}  evt  Mouse click
         */
        _events.onTooltipClick = function _events_onTooltipClick(evt) {
            var $target = $(evt.target);

            // A click on the Close button
            if ($target.closest(SELECTORS.closeButton).length) {
                _priv.hide(evt, $target.closest(SELECTORS.tooltip).attr('id'));
            }
        };

        /**
         * Handles the Escape key and (shift-)tabbing away a tooltip
         * @param   {Event}  evt   Keystroke
         */
        _events.onTooltipKeydown = function _events_onTooltipKeydown(evt) {
            var $target = $(evt.target),
                tooltipId, TT, $focusedElem;

            // Get the tooltip if a key of interest was pressed
            if (evt.keyCode === 27 || evt.keyCode === 9) {
                tooltipId = $target.closest(SELECTORS.tooltip).attr('id');
                TT = _tooltipList[tooltipId];
            }

            // Shift-tab
            if (evt.shiftKey && evt.keyCode === 9) {
                $focusedElem = $(_client.focusedElem);

                // If the tooltip DIV was focused before this key was pressed then the tooltip should close
                //    and the focus should go back to the link
                if ($focusedElem.is(SELECTORS.tooltip + ', ' + SELECTORS.body)) {
                    // Make sure the tooltip is supposed to close when it loses focus
                    if (_configs[TT.configId].closeOnBlur === true) {
                        _priv.hide(evt, tooltipId);
                    }
                    else {
                        // Set focus back to the tooltip's link to avoid skipping to the next tabbable element
                        TT.invokerElem.focus();
                    }

                    // Need this to prevent it from double-tabbing back
                    evt.preventDefault();
                }
            }

            // Escape key
            else if (evt.keyCode === 27) {
                _priv.hide(evt, tooltipId);
            }

            // Tab key pressed on the Close button (but not shift-tab)
            else if ($target.closest(SELECTORS.closeButton) && evt.keyCode === 9 && !evt.shiftKey) {
                // Make sure the tooltip is supposed to close when it loses focus
                if (_configs[TT.configId].closeOnBlur === true) {
                    // Even though the tooltip will close when losing focus, this needs to be captured
                    //    to prevent the focus from going to the next element with tabindex=1
                    _priv.hide(evt, tooltipId);
                }
                else {
                    TT.invokerElem.focus();
                    // Need this to prevent it from double-tabbing
                    evt.stopPropagation();
                }
            }
        };

        /**
         * Handles clicks directly on a link
         * @param   {Event}  evt   Mouse click
         */
        _events.onLinkClick = function _events_onLinkClick(evt) {
            _priv.toggle(evt);
        };

        /**
         * Handles Enter key presses directly on a link
         * @param   {Event}  evt   Keypress
         */
        _events.onLinkKeydown = function _events_onLinkKeydown(evt) {
            if (evt.keyCode === 13) { // Enter key
                // This will always open (never toggle) a tooltip because if the focus is on the link
                //     then the tooltip must be currently closed
                _priv.show(evt);
            }
        };

        /**
         * Keeps track of which object has focus
         * @param   {Event}  evt   Focus event
         */
        _events.onFocus = function _events_onFocus(evt) {
            _client.focusedElem = evt.target;
        };

        /////////////////////
        // Private methods //
        /////////////////////

        /**
         * Displays and positions a tooltip
         * @param   {Event}    evt          Mouse click or key press on link, or window resize
         * @param   {Element}  invokerElem  Link or icon
         * @param   {Object}   settings     Object containing the content to display
         * @return  {Boolean}               Success
         */
        _priv.show = function _priv_show(evt, invokerElem, settings) {
            var TT = null,
                tooltipId = '',
                config = null;

            // If the link was clicked or pressed, invokerElem needs to be acquired
            // In other cases (e.g., window resize) invokerElem would be passed in
            if (kind(invokerElem) !== 'element') {
                invokerElem = evt.target;

                if (!invokerElem) {
                    return true;
                }

                // Make sure we're dealing with the link itself and not a child element
                invokerElem = $(invokerElem).closest(_linkSelectors).get(0);
            }

            tooltipId = _priv._establishElementId(invokerElem) + ID_SUFFIX;
            TT = _tooltipList.hasOwnProperty(tooltipId) ? _tooltipList[tooltipId] : null;

            // If content was passed in, destroy the existing tooltip to avoid caching on dynamic calls
            if (TT && (_priv.settings.hasBodyHTML(settings) || _priv.settings.hasMessages(settings))) {
                _priv.destroy(tooltipId);
                TT = null;
            }

            // Check whether tooltip has already been created
            if (TT === null) {
                _priv.create(evt, invokerElem, settings);
            }
            else {
                config = _configs[TT.configId];

                // If tooltip element should not be cached and has not been created yet
                if (!config.cacheTooltips && !TT.tooltipElem) {
                    _priv.create(evt, invokerElem, settings);
                }
                // Display the tooltip
                else {
                    // Only one tooltip allowed at a time, so clear them all out and start fresh
                    _priv.hideAll();

                    // Display it
                    TT.tooltipElem.style.display = 'block';
                    TT.tooltipElem.setAttribute('aria-hidden', 'false');
                    TT.invokerElem.setAttribute('title', TT.linkTitle.hide);

                    // Find the width of the tooltip
                    TT = _priv.determineWidth(TT);

                    // Find the position
                    _priv.position(TT);

                    // Focus on tooltip
                    TT.tooltipElem.focus();

                    // Fire event
                    TT.$invokerElem.trigger('tooltipdisplay');

                    // Close tooltip on blur
                    if (config.closeOnBlur) {
                        // This needs a delay so the current click event doesn't interfere
                        setTimeout(function() {
                            $body.on('click', _events.onBodyClick);
                        }, 10);
                    }

                    // Scroll into view
                    _priv.scrollIntoView(TT.tooltipElem);

                    if (evt) {
                        evt.stopPropagation();
                    }

                    return false;
                }
            }

            return true;
        }; // end _priv.show()

        /**
         * Creates a new Tooltip object or restores a previously-created one
         * @param   {Event}   evt          Mouse click or Enter keypress fired on a link
         * @param   {Element} invokerElem  Link or icon
         * @param   {Object}  settings     Object containing the content to display
         * @return  {Element}              Tooltip `<div>` element
         */
        _priv.create = function _priv_create(evt, invokerElem, settings) {
            var tooltipId = '', // the tooltip's ID
                $tooltipElem, // the tooltip <div> element
                // tooltipElem, // the tooltip <div> element
                contentId = '',
                contentElem = null,
                configId = '',
                config = null,
                TT = null;

            if (kind(invokerElem) !== 'element') {
                return false;
            }

            if (invokerElem.getAttribute(_priv.getDataAttrPrefix() + 'config') !== undefined) {
                configId = invokerElem.getAttribute(_priv.getDataAttrPrefix() + 'config');
            }
            else {
                configId = 'default';
            }

            config = _configs[configId];

            // Get tooltip content

            // No content provided in settings
            if (!_priv.settings.hasBodyHTML(settings) && !_priv.settings.hasMessages(settings)) {
                // Content comes from dynamicContent
                if (kind(config.dynamicContent) === 'object') {
                    if (typeof config.dynamicContent.callback === 'function') {
                        config.dynamicContent.callback(invokerElem, config.dynamicContent);
                    }
                    return false;
                }
                // Check for content in the DOM
                else {
                    if (config.contentIdSourceAttr === 'href' && invokerElem.getAttribute('href') && invokerElem.getAttribute('href').indexOf('#') > -1) {
                        // I'm getting the value from `.hash` here because it was needed for IE7 (which couldn't use .href easily). I would go back to `.href` but I wonder if that's ever necessary -- it should always have a hash, right? (CP 1/31/2015)
                        contentId = invokerElem.hash.replace(/^#/, '');
                    }
                    else {
                        contentId = invokerElem.getAttribute(config.contentIdSourceAttr);
                    }

                    if (contentId) {
                        contentElem = document.getElementById(contentId);
                    }

                    if (contentElem) {
                        settings = _priv.settings.normalize.all(settings);
                        // Get content from the DOM element
                        settings.body.html = contentElem.innerHTML;
                    }
                    // Else, no content available (tooltip will be empty)
                }
            }

            tooltipId = _priv._establishElementId(invokerElem) + ID_SUFFIX;

            // Create a new tooltip DOM element
            $tooltipElem = $('<div/>')
                            .addClass(CLASSES.tooltip)
                            .addClass(config.containerClass)
                            .attr('id', tooltipId)
                            .attr('tabindex', '1')
                            .html(_priv.createTooltipInnerHTML(settings, config, invokerElem.id))
                            .appendTo($body);

            // Add event listeners
            _events.setup.tooltip($tooltipElem.get(0), $tooltipElem.find('a, ' + SELECTORS.closeButton));

            // Set ARIA properties on link
            // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-owns
            // Shouldn't use aria-flows because the focus would already be beyond
            //    the link at this point
            invokerElem.setAttribute('aria-haspopup', 'true');
            invokerElem.setAttribute('aaa:controls', tooltipId);

            // Create tooltip object
            TT = $.extend(true, {}, _defaultTooltipObj); // Need first two arguments to create deep copy and not modify the default object
            TT.tooltipElem = $tooltipElem.get(0);
            TT.invokerElem = invokerElem;
            TT.$invokerElem = $(invokerElem);
            TT.targetElem = _priv.getTargetElem(invokerElem, settings);
            TT.configId = configId;
            TT.width = config.width;

            // Override default link title, if one was already present
            if (invokerElem.getAttribute('title')) {
                TT.linkTitle.show = invokerElem.getAttribute('title');
            }

            // Links within table cells need to use different offset values for positioning
            oElem = TT.$invokerElem.closest('h4 td th').get(0);
            if (oElem) {
                switch (oElem.nodeName.toLowerCase()) {
                    case 'th':
                        TT.offsets.parent.x = config.offsets.tagTH ? (config.offsets.tagTH.x + _offsets.tagTH.x) : _offsets.tagTH.x;
                        TT.offsets.parent.y = config.offsets.tagTH ? (config.offsets.tagTH.y + _offsets.tagTH.y) : _offsets.tagTH.y;
                        break;
                    case 'td':
                        TT.offsets.parent.x = config.offsets.tagTD ? (config.offsets.tagTD.x + _offsets.tagTD.x) : _offsets.tagTD.x;
                        TT.offsets.parent.y = config.offsets.tagTD ? (config.offsets.tagTD.y + _offsets.tagTD.y) : _offsets.tagTD.y;
                        break;
                    case 'h4':
                        TT.offsets.parent.x = config.offsets.tagH4 ? (config.offsets.tagH4.x + _offsets.tagH4.x) : _offsets.tagH4.x;
                        TT.offsets.parent.y = config.offsets.tagH4 ? (config.offsets.tagH4.y + _offsets.tagH4.y) : _offsets.tagH4.y;
                        break;
                    default:
                        break;
                }
            }

            // Add this new tooltip to the list, or override an existing one
            _tooltipList[tooltipId] = TT;

            // Display tooltip
            _priv.show(evt, invokerElem);

            return TT.tooltipElem;
        }; // end _priv.create()

        /**
         * Creates the HTML to be inserted into a tooltip container
         * @param   {Object}  settings  Object containing the content to display
         * @param   {Object}  config    Tooltip configuration
         * @param   {String}  id        Tooltip ID
         * @return  {String}            HTML
         */
        _priv.createTooltipInnerHTML = function _priv_createTooltipInnerHTML(settings, config, id) {
            var div = document.createElement('div'),
                divHTML = '',
                closeButtonHTML = '<div class="' + CLASSES.closeWrapper + '">' +
                    '<a href="#" tabindex="1" class="' + CLASSES.closeButton + '" ' +
                    'title="Close" ' +
                    'aria-flowto="' + id + '" ' +
                    'aria-live="assertive" ' +
                    'aaa:live="assertive"' +
                    '>' + config.closeButtonText + '</a>' +
                    '</div>';

            if (config.closeButtonPosition === 'above') {
                divHTML += closeButtonHTML;
            }

            // Body
            divHTML += '<div class="' + CLASSES.body + '">';

            // Use messages, if present
            if (settings.messages.length > 0) {
                settings.messages.forEach(function _priv_createTooltipInnerHTML_msgForEach(msg) {
                    // Convert message to title case for use with classes
                    var typeName = msg.type.substr(0, 1).toUpperCase() + msg.type.substr(1).toLowerCase();
                    if (typeName === 'Info') {
                        typeName += 'rmational';
                    }
                    divHTML += '<div class="msg' + typeName + '">';
                    divHTML += '<div class="msgIcon msg' + typeName + 'Icon">' + typeName + '</div>';
                    divHTML += '<div class="msgContent">' + msg.description + '</div></div>';
                });
            }
            // Otherwise use the body
            else {
                divHTML += settings.body.html;
            }
            divHTML += '</div>';

            if (config.closeButtonPosition === 'below') {
                divHTML += closeButtonHTML;
            }

            div.innerHTML = divHTML;

            // Make anchors and inputs within the tooltip and the Close button tab-navigable
            //iflow <- was done for iflow, but maybe we want to do this anyway? What about adding inputs?
            $(div).find('a, ' + SELECTORS.closeButton).attr('tabindex', '1');

            return div.innerHTML;
        }; // end _priv.createTooltipInnerHTML()

        /**
         * Determine and set a tooltip's position
         * @param   {Object}  TT  Tooltip object
         * @return  {Boolean}     Success
         */
        _priv.position = function _priv_position(TT) {
            var tooltipElem = null,
                targetPosition = null,
                targetElem = null,
                config = null,
                windowPaddingX = 0,
                windowPaddingY = 0,
                ttPosition = null;

            if (kind(TT) !== 'object') {
                return false;
            }

            if (!TT.tooltipElem) {
                return false;
            }

            tooltipElem = TT.tooltipElem;
            targetElem = TT.targetElem;
            targetPosition = _priv.getElementPosition(targetElem);
            config = _configs[TT.configId];
            ttPosition = {
                x: 0,
                y: 0,
                pointer: {
                    x: 0,
                    y: 0
                }
            };

            // Position the tooltip based on the config's pointer settings
            if (config.pointerPosition === 'topright') {
                // Position the tooltip below the link, with the pointer along the top and to the right
                //
                //                   (Link)
                // ____________________/\_
                // |                     |
                // |      Tooltip        |
                // |_____________________|

                ttPosition.y = targetPosition[1] + _offsets.position.y +
                    TT.offsets.parent.y + targetElem.offsetHeight;

                if (config.offsets.position) {
                    if (typeof config.offsets.position.x === 'number') {
                        ttPosition.x += config.offsets.position.x;
                    }

                    if (typeof config.offsets.position.y === 'number') {
                        ttPosition.y += config.offsets.position.y;
                    }
                }

                tooltipElem.style.top = ttPosition.y + 'px';

                // See if the tooltip will fit right-aligned with the link without running off the left side of the viewport
                if (TT.width <= targetPosition[0]) {
                    // Align the right-edge of the tooltip with the link
                    ttPosition.x += (targetPosition[0] + targetElem.offsetWidth / 2 + TT.offsets.parent.x + _offsets.position.x - 5 - TT.width);
                    tooltipElem.style.left = ttPosition.x + 'px';

                    // Position the tooltip's pointer
                    if (config.offsets.pointer) {
                        windowPaddingX = config.offsets.pointer.x;
                        windowPaddingY = config.offsets.pointer.y;
                    }

                    // Pseudo-element pointer, need to add custom CSS to the page
                    // before.left = after.left + 1
                    // before.top  = after.top  - 1
                    _priv.addCSSRule(
                        'div#' + tooltipElem.id + SELECTORS.tooltip + ':before ' +
                        '{ left:' + (TT.width + _offsets.pointer.x + windowPaddingX) + 'px;' +
                        '   top:' + (windowPaddingY + _offsets.pointer.y) + 'px; }' +
                        'div#' + tooltipElem.id + SELECTORS.tooltip + ':after ' +
                        '{ left:' + (TT.width + _offsets.pointer.x + windowPaddingX - _offsets.pointer.borderWidth) + 'px;' +
                        '   top:' + (_offsets.pointer.y + windowPaddingY + _offsets.pointer.borderWidth) + 'px; }');
                }
                // Tooltip is left-aligned to the viewport and the pointer's position varies
                else {
                    // Make sure the tooltip is at least 10px from the egde of the window
                    // Need to offset the pointer if the link is < 10px from the edge
                    if (targetElem.offsetWidth / 2 < 10) {
                        windowPaddingX = 10 - targetElem.offsetWidth / 2;
                    }

                    ttPosition.x = targetElem.offsetWidth / 2;

                    if (config.offsets.position) {
                        ttPosition.x += config.offsets.position.x;
                    }

                    // Position the tooltip's pointer

                    // Pointer
                    // Add config offsets
                    if (config.offsets.variablePointer) {
                        windowPaddingX += config.offsets.variablePointer.x;
                        windowPaddingY += config.offsets.variablePointer.y;
                    }

                    _priv.addCSSRule(
                        'div#' + tooltipElem.id + SELECTORS.tooltip + ':before { ' +
                        'left:' + (targetPosition[0] + TT.offsets.parent.x + _offsets.variablePointer.x + windowPaddingX) + 'px; ' +
                        'top:' + (_offsets.variablePointer.y + windowPaddingY) + 'px; } ' +
                        'div#' + tooltipElem.id + SELECTORS.tooltip + ':after { ' +
                        'left:' + (targetPosition[0] + TT.offsets.parent.x + _offsets.variablePointer.x - _offsets.variablePointer.borderWidth + windowPaddingX) + 'px; ' +
                        'top:' + (_offsets.variablePointer.y + _offsets.variablePointer.borderWidth + windowPaddingY) + 'px; }');

                    tooltipElem.style.left = ttPosition.x + 'px';
                }
            }
            else {
                // No pointer, position the tooltip below the link, aligned to the left
                //
                // (Link)
                // ______________________
                // |                     |
                // |      Tooltip        |
                // |_____________________|

                // See if the tooltip will fit left-aligned with the link without running off the right side of the viewport
                if (TT.width + targetPosition[0] < _priv.getViewPort()[0]) {
                    // Align the left-edge of the tooltip with the link
                    ttPosition.x = (targetPosition[0] + TT.offsets.parent.x); // + _offsets.position.x);

                    if (config.offsets.position) {
                        ttPosition.x += config.offsets.position.x;
                    }
                    tooltipElem.style.left = ttPosition.x + 'px';
                }
                // Tooltip is right-aligned to the viewport
                else {
                    tooltipElem.style.left = 'auto';
                    tooltipElem.style.right = '10px';
                }

                // Vertical positioning
                ttPosition.y = targetPosition[1] + _offsets.position.y + TT.offsets.parent.y + targetElem.offsetHeight;

                // Subtract the space usually given for the pointer
                ttPosition.y += _offsets.pointer.y + _offsets.noPointer.y;

                if (config.offsets.position) {
                    ttPosition.y += config.offsets.position.y;
                }

                tooltipElem.style.top = ttPosition.y + 'px';

                // Hide pointer
                _priv.addCSSRule(
                    'div#' + tooltipElem.id + SELECTORS.tooltip + ':before { display: none; } ' +
                    'div#' + tooltipElem.id + SELECTORS.tooltip + ':after { display: none; }');
            }

            return true;
        }; // end _priv.position()

        /**
         * Repositions all open tooltips
         */
        _priv.repositionAll = function _priv_repositionAll() {
            var i, TT;

            // Find any open tooltips and reposition them
            for (i in _tooltipList) {
                if (_tooltipList.hasOwnProperty(i)) {
                    TT = _tooltipList[i];

                    if (TT.tooltipElem && TT.tooltipElem.style.display !== 'none') {
                        _priv.position(TT);
                    }
                }
            }
        }; // end _priv.repositionAll()

        /**
         * Finds the width of the tooltip based on its contents and stores it in the tooltip object
         * @param   {Object}  TT  Tooltip object
         * @return  {Object}      Updated Tooltip object
         */
        _priv.determineWidth = function _priv_determineWidth(TT) {
            var tooltipElem = TT.tooltipElem,
                maxWidth = _configs[TT.configId].width,
                // allElemsAreLessThanMax, iWidest,
                iTooltipWidth, linkPosition, iNewWidth;

            // Adjust width to fit smaller contents or wider images
            if (!TT.isWidthDetermined) {
                iTooltipWidth = TT.width;

                // Shrink the stored width value if the tooltip is less than the maximum width
                if (tooltipElem.offsetWidth < TT.width) {
                    TT.width = tooltipElem.offsetWidth - 4;
                    iTooltipWidth = TT.width;
                }

                //TODO: Do we want expand the tooltip width for large images, or just use `img{max-width}` CSS?
                // Find widest image
                iNewWidth = 0;
                linkPosition = _priv.getElementPosition(TT.invokerElem);
                $(tooltipElem).find('img').each(function () {
                    if (this.clientWidth > (maxWidth - 10) && (this.clientWidth < Math.abs(iTooltipWidth - linkPosition[0]) || this.clientWidth > iTooltipWidth)) {
                        iNewWidth = this.clientWidth + 8;
                        tooltipElem.style.width = iNewWidth + 'px';
                        tooltipElem.style.maxWidth = iNewWidth + 'px';
                        TT.width = iNewWidth;
                    }
                });

                TT.isWidthDetermined = true;
            }

            return TT;
        }; // end _priv.determineWidth()

        ///<summary>Finds the element around which the tooltip will be visually positioned</summary>
        ///<param name="invokerElem" type="Element">Invoker element</param>
        ///<param name="settings" type="Object">settings object</param>
        ///<returns>The target element</returns>
        ///<remark>If no target is specified in the settings, the invokerElem will be considered the target</remark>
        _priv.getTargetElem = function _priv_getTargetElem(invokerElem, settings) {
            var target = invokerElem;

            if (_priv.settings.validate.target(settings)) {
                target = document.getElementById(settings.target.id) || invokerElem;
            }

            return target;
        };

        ///<summary>Scrolls the window if the tooltip is hanging below the viewport</summary>
        ///<param name="tooltipElem" type="Object">A visible tooltip</param>
        _priv.scrollIntoView = function _priv_scrollIntoView(tooltipElem) {
            var iOutOfView = (_priv.getElementPosition(tooltipElem)[1] + tooltipElem.offsetHeight) - (_priv.getViewPort()[1] + _priv.getScrollTop());

            if (iOutOfView > 0) {
                window.scrollBy(0, iOutOfView);
            }
        };

        ///<summary>Closes the tooltip containing oSender</summary>
        ///<param name="event" type="Event">Mouse click or Enter keypress on the "Close" button</param>
        ///<param name="tooltipId" type="String">The tooltip's ID</param>
        _priv.hide = function _priv_hide(evt, tooltipId) {
            var TT = _tooltipList[tooltipId];

            if (TT.tooltipElem) {
                // Get the tooltip div and hide it
                TT.tooltipElem.style.display = 'none';
                // http://www.w3.org/WAI/PF/aria/states_and_properties#aria-hidden
                TT.tooltipElem.setAttribute('aria-hidden', 'true');
            }

            TT.invokerElem.setAttribute('title', TT.linkTitle.show);

            // Fire events
            TT.$invokerElem.trigger('tooltiphide');

            // Remove click handlers
            $body.off('click', _events.onBodyClick);

            // Set focus back to the link
            TT.$invokerElem.focus();
            _client.focusedElem = null;

            // Clear cached tooltip
            _priv.clearTooltipCache(TT);

            // Do we need this?
            evt.preventDefault();

            return false;
        }; // end _priv.hide()

        ///<summary>Hide all tooltips on the page</summary>
        _priv.hideAll = function _priv_hideAll() {
            var i, TT, wasDisplaying;

            for (i in _tooltipList) {
                if (_tooltipList.hasOwnProperty(i)) {
                    wasDisplaying = false;
                    TT = _tooltipList[i];

                    if (TT.tooltipElem) {
                        wasDisplaying = TT.tooltipElem.style.display === 'block';
                        TT.tooltipElem.style.display = 'none';
                        TT.tooltipElem.setAttribute('aria-hidden', 'true');
                    }

                    TT.$invokerElem.trigger('tooltiphide');

                    // Clear cached tooltip
                    if (wasDisplaying) {
                        _priv.clearTooltipCache(TT);
                    }
                }
            }

            _client.focusedElem = null;
            $body.off('click', _events.onBodyClick);

            // Report success
            return true;
        }; // end _priv.hideAll()

        ///<summary>Either open or close a particular tooltip</summary>
        ///<param name="event" type="Event">Mouse click or Enter keypress on a link</param>
        ///<param name="oSender" type="Object">A link</param>
        _priv.toggle = function _priv_toggle(evt) {
            var invokerElem = evt.target,
                bDoOpen = true,
                tooltipId = '',
                TT = null;

            // Check whether the tooltip is currently open
            invokerElem = $(invokerElem).closest(_linkSelectors).get(0);
            tooltipId = invokerElem.id + ID_SUFFIX;

            TT = _tooltipList[tooltipId];
            if (TT && TT.tooltipElem && TT.tooltipElem.style.display !== 'none') {
                bDoOpen = false;
                _priv.hide(evt, tooltipId);
            }

            if (bDoOpen) {
                _priv.show(evt, invokerElem);
            }

            evt.preventDefault();
        }; // end _priv.toggle()

        // Remove hidden tooltip elements from the DOM
        _priv.clearTooltipCache = function _priv_clearTooltipCache(TT) {
            if (!TT) {
                return false;
            }

            if (TT.tooltipElem && !_configs[TT.configId].cacheTooltips) {
                // Destroy tooltip <div>
                TT.tooltipElem.parentNode.removeChild(TT.tooltipElem);
                TT.tooltipElem = null;
                return true;
            }

            return false;
        };

        // Remove tooltip object from the list and its element from the DOM
        // tooltipId is required, TT is helpful
        _priv.destroy = function _priv_destroy(tooltipId) {
            var tooltipElem = document.getElementById(tooltipId);

            if (tooltipElem) {
                tooltipElem.parentNode.removeChild(tooltipElem);
            }

            delete _tooltipList[tooltipId];
        };

        _priv.settings = {};

        _priv.settings.validate = {};

        ///<summary>Validates a settings object and its mandatory properties</summary>
        ///<param name="settings" type="Object">settings object</param>
        ///<returns>Boolean</returns>
        _priv.settings.validate.all = function _priv_settings_validate_all(settings) {
            var numTests = 0,
                numPassed = 0;

            numTests++;
            if (kind(settings) === 'object') {
                numPassed++;

                // Content
                numTests++;
                if (_priv.settings.validate.body(settings)) {
                    numPassed++;
                }

                // Messages
                numTests++;
                if (_priv.settings.validate.messages(settings)) {
                    numPassed++;
                }

                // Target
                numTests++;
                if (_priv.settings.validate.target(settings)) {
                    numPassed++;
                }
            }

            return numTests === numPassed;
        };

        _priv.settings.validate.body = function _priv_settings_validate_body(settings) {
            var numTests = 0,
                numPassed = 0;

            numTests++;
            if (kind(settings) === 'object') {
                numPassed++;

                numTests++;
                if (kind(settings.body) === 'object') {
                    if (typeof settings.body.html === 'string') {
                        numPassed++;
                    }
                }
            }

            return numTests === numPassed;
        };

        _priv.settings.validate.message = function _priv_settings_validate_message(message) {
            var numTests = 0,
                numPassed = 0;

            numTests++;
            if (kind(message) === 'object') {
                numPassed++;
                numTests++;

                if (typeof msg.type === 'string' && typeof msg.description === 'string') {
                    if (MESSAGE_TYPES.indexOf(msg.type.toLowerCase()) > -1 && msg.description.length > 0) {
                        numPassed++;
                    }
                }
            }

            return (numTests === numPassed);
        };

        _priv.settings.validate.messages = function _priv_settings_validate_messages(settings) {
            var numTests = 0,
                numPassed = 0;

            numTests++;
            if (kind(settings) === 'object') {
                numPassed++;

                numTests++;
                if (kind(settings.messages) === 'array') {
                    numPassed++;
                    settings.messages.forEach(function _priv_settings_validate_messages_forEach(msg, i, arr) {
                        numTests++;
                        if (_priv.settings.validate.message(msg)) {
                            numPassed++;
                        }
                        else if (/undefined|null/.test(kind(msg))) {
                            arr.splice(i, 1);
                            numPassed++;
                        }
                    });
                }
            }

            return numTests === numPassed;
        };

        _priv.settings.validate.target = function _priv_settings_validate_target(settings) {
            var numTests = 0,
                numPassed = 0;

            numTests++;
            if (kind(settings) === 'object') {
                numPassed++;

                numTests++;
                if (kind(settings.target) === 'object') {
                    if (typeof settings.target.id === 'string') {
                        if ($.trim(settings.target.id).length > 0) { // If target is defined, target.id cannot be empty
                            numPassed++;
                        }
                    }
                }
            }

            return numTests === numPassed;
        };

        _priv.settings.normalize = {};

        ///<summary>Fixes and replaces any missing or incorrect properties in a settings object</summary>
        ///<param name="settings" type="Object">settings object</param>
        ///<returns>settings object</returns>
        _priv.settings.normalize.all = function _priv_settings_normalize_all(custom) {
            var settings = $.extend(true, {}, _defaultSettingsObj);

            // Content
            settings.body = _priv.settings.normalize.body(custom);
            // Messages
            settings.messages = _priv.settings.normalize.messages(custom);
            // Target
            settings.target = _priv.settings.normalize.target(custom);

            return settings;
        };

        _priv.settings.normalize.body = function _priv_settings_normalize_body(custom) {
            var body = $.extend(true, {}, _defaultSettingsObj).body;

            if (kind(custom) === 'object') {
                if (_priv.settings.validate.body(custom)) {
                    if ($.trim(custom.body.html).length > 0) {
                        body.html = custom.body.html;
                    }
                }
            }

            return body;
        };

        _priv.settings.normalize.messages = function _priv_settings_normalize_messages(custom) {
            var messages = $.extend(true, {}, _defaultSettingsObj).messages;

            if (kind(custom) === 'object') {
                if (_priv.settings.validate.messages(custom)) {
                    custom.messages.forEach(function _priv_settings_normalize_messages_forEach(msg, i, arr) {
                        if (_priv.settings.validate.message(msg)) {
                            msg.type = msg.type.toLowerCase();
                            messages.push(msg);
                        }
                        else if (/undefined|null/.test(kind(msg))) {
                            arr.splice(i, 1);
                        }
                    });
                }
            }

            return messages;
        };

        _priv.settings.normalize.target = function _priv_settings_normalize_target(custom) {
            var target = $.extend(true, {}, _defaultSettingsObj).target;

            if (kind(custom) === 'object') {
                if (_priv.settings.validate.target(custom)) {
                    target.id = custom.target.id;
                }
            }

            return target;
        };

        ///<summary>Checks whether a settings object contains body HTML</summary>
        ///<param name="settings" type="Object">settings object</param>
        ///<returns>Boolean</returns>
        _priv.settings.hasBodyHTML = function _priv_settings_hasBodyHTML(settings) {
            if (_priv.settings.validate.body(settings)) {
                if ($.trim(settings.body.html).length > 0) {
                    return true;
                }
            }

            return false;
        };

        ///<summary>Checks whether a settings object contains 1 or more valid messages</summary>
        ///<param name="settings" type="Object">settings object</param>
        ///<returns>Boolean</returns>
        _priv.settings.hasMessages = function _priv_settings_hasMessages(settings) {
            if (_priv.settings.validate.messages(settings)) {
                if (settings.messages.length > 0) {
                    return true;
                }
            }

            return false;
        };

        ///////////////
        // Utilities //
        ///////////////

        _priv.getDataAttrPrefix = function _priv_getDataAttrPrefix() {
            return 'data-' + (DATA_ATTR_PREFIX.length > 0 ? DATA_ATTR_PREFIX + '-' : '');
        };

        ///<summary>Set an element's ID to either its existing ID or a random, unique one</summary>
        ///<param name="oElem" type="DOM Object">Optional element that needs an ID</summary>
        ///<returns>String: the element's current or new ID</returns>
        _priv._establishElementId = function _priv_establishElementId(oElem) {
            var id = '',
                i = 0,
                sLetterPool = '';

            // See if the element already has an ID
            if (oElem && typeof oElem === 'object') {
                if (oElem.id && typeof oElem.id === 'string') {
                    return oElem.id;
                }
            }

            // Randomly generate an ID
            if (!id) {
                // Get four random letters
                sLetterPool = 'abcdefghijklmnopqrstuvwxyz';
                i = 4;
                while (i--) {
                    id += sLetterPool.charAt(Math.floor(Math.random() * sLetterPool.length));
                }

                // Add four digits based on the current time (milliseconds)
                id += (new Date()).getTime().toString().substr(9);
            }

            // Try again if this ID is already in use
            if (document.getElementById(id)) {
                id = _priv._establishElementId(null);
            }

            // Set elements's ID
            if (oElem && typeof oElem === 'object') {
                oElem.id = id;
            }

            return id;
        };

        ///<summary>Returns element's (x,y) position in pixels with respect to the page's viewport</summary>
        ///<param name="oSender" type="DOM Object">The sender object</param>
        ///<returns>Array with x=[0] and y=[1]</returns>
        _priv.getElementPosition = function _priv_getElementPosition(oSender) {
            var left = 0,
                top = 0;

            if (oSender.offsetParent) {
                left = oSender.offsetLeft;
                top = oSender.offsetTop;
                oSender = oSender.offsetParent;

                while (oSender) {
                    left += oSender.offsetLeft;
                    top += oSender.offsetTop;

                    oSender = oSender.offsetParent;
                }
            }

            return [left,top];
        };

        /**
         * Determines the visible viewport area
         *
         * @return  {Array}  The [horizontal,vertical] size of the viewport in pixels
         */
        _priv.getViewPort = function _priv_getViewPort() {
            var x = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth,
                y = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            return [x, y];
        };

        /**
         * Returns the distance in pixels that the page has been scrolled down (i.e., size of the area that's out of view)
         *
         * @return  {Integer}  Distance the page has scrolled
         */
        _priv.getScrollTop = function _priv_getScrollTop() {
            var iScrollTop = document.body.scrollTop;

            if (!iScrollTop) {
                if (window.pageYOffset) {
                    iScrollTop = window.pageYOffset;
                }
                else {
                    iScrollTop = (document.body.parentElement) ? document.body.parentElement.scrollTop : 0;
                }
            }

            return iScrollTop;
        };

        _priv.addCSSRuleStylesheet = null;

        /**
         * Add CSS rule to the document
         */
        _priv.addCSSRule = function _priv_addCSSRule(sRule) {
            var oStyleSheet;

            if (!document.styleSheets || typeof sRule !== 'string') { return false; }

            // The first time this function is called, a new <style> block must be created
            if (!_priv.addCSSRuleStylesheet) {
                oStyleSheet = document.createElement('style');
                oStyleSheet.type = 'text/css';
                oStyleSheet.id = 'ui-style-sheet';
                document.head.appendChild(oStyleSheet);
                _priv.addCSSRuleStylesheet = oStyleSheet;
            }

            // Add rules to the style sheet
            if (_priv.addCSSRuleStylesheet.sheet) { // Modern browsers
                _priv.addCSSRuleStylesheet.appendChild(document.createTextNode(' ' + sRule));
            }
            else if (_priv.addCSSRuleStylesheet.styleSheet) { // IE8-
                _priv.addCSSRuleStylesheet.styleSheet.cssText += ' ' + sRule;
            }
        };

        ////////////////////
        // Public methods //
        ////////////////////

        /**
         * Displays a tooltip
         *
         * @param   {Mixed}   invokerIdentifier  An invoker element or its ID
         * @param   {Object}  settings           Optional settings object
         * @return  {Boolean}                    Whether the call was accepted
         */
        _public.show = function _public_show(invokerIdentifier, settings) {
            // Check if settings is a JSON string
            if (typeof settings === 'string') {
                try {
                    settings = JSON.parse(settings);
                }
                catch (e) {
                    settings = null;
                }
            }

            settings = _priv.settings.normalize.all(settings);

            // Make sure some content has been provided
            if (_priv.settings.hasBodyHTML(settings) || _priv.settings.hasMessages(settings)) {
                // invokerIdentifier can either be a link element or its ID
                if (kind(invokerIdentifier) === 'string') {
                    invokerIdentifier = document.getElementById(invokerIdentifier);
                }

                if (kind(invokerIdentifier) === 'element') {
                    // First argument would normally be an event object
                    _priv.show(null, invokerIdentifier, settings);
                    return true;
                }
            }

            return false;
        };

        /**
         * Hides a tooltip
         *
         * @param   {Mixed}   invokerIdentifier  An invoker element, invoker ID, tooltip element, or tooltip ID
         * @param   {Object}  settings           Optional settings object
         * @return  {Boolean}                    Whether the call was accepted
         */
        _public.hide = function _public_hide(invokerIdentifier) {
            if (kind(invokerIdentifier) === 'element') {
                invokerIdentifier = _priv._establishElementId(invokerIdentifier);
            }

            if (kind(invokerIdentifier) === 'string') {
                if (invokerIdentifier.indexOf(ID_SUFFIX) < 0) {
                    invokerIdentifier += ID_SUFFIX;
                }

                // First argument would normally be an event object
                _priv.hide(null, invokerIdentifier);

                return true;
            }

            return false;
        };

        _public.getSettingsTemplate = function _public_getSettingsTemplate() {
            return $.extend(true, {}, _defaultSettingsObj);
        };

        /**
         * Setup new links that were added to the page or re-setup existing ones
         * @param  {String}  sContainerSelector  Optional container to search for links within
         * @param  {Object}  options             Optional settings
         * @return {Number}                      Number of links that were setup
         */
        _public.addLinks = function _public_addLinks(sContainerSelector, options) {
            return _events.setup.links(sContainerSelector, options);
        };

        $(document).ready(_init);

        // Reveal public API
        return {
            show: _public.show,
            hide: _public.hide,
            hideAll: _priv.hideAll,
            registerConfig: _priv.config.register,
            getSettingsTemplate: _public.getSettingsTemplate,
            getVersion: _public.getVersion,
            addLinks: _public.addLinks
        };
    }());
});