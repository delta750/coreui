define(['jquery', 'kind', 'cui', 'guid'], function ($, kind, cui, guid) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '0.0.1';

    var NAMESPACE = 'cui-dropdown';

    var CLASSES = {
            hidden: 'cui-hidden',
            container: NAMESPACE,
            toggler: NAMESPACE + '-toggler',
            collapsed: NAMESPACE + '-collapsed',
            expanded: NAMESPACE + '-expanded',
            selected: NAMESPACE + '-selected',
            optionsList: NAMESPACE + '-list',
        };

    var ATTRIBUTES = {
            optionIndex: NAMESPACE + '-index',
        };

    var ANIMATION = {
        duration: '75',
        easing: 'easeInOutCubic',
    };

    // Associative array of Dropdown objects
    var dropdowns = {};

    // Private method namespace
    var priv = {};

    /////////////////
    // Constructor //
    /////////////////

    var Dropdown = function _Dropdown (elem, opts) {
        // Make sure we're creating a new instance even if it wasn't called with `new`
        if (!(this instanceof Dropdown)) {
            return new Dropdown(opts);
        }

        if (elem instanceof Node) {
            // Store the element upon which the component was called
            this.sourceElem = elem;
            // Create a jQuery version of the element
            // this.$self = $(elem);

            this.$sourceSelect = $(elem);

            // This next line takes advantage of HTML5 data attributes
            // to support customization of the plugin on a per-element
            // basis. For example,
            // <div class="item" data-dropdown-options="{'message':'Goodbye World!'}"></div>
            this.metadata = this.$sourceSelect.data('dropdown-options');
        }
        else {
            console.warn('[B] not given a node ', elem, opts);
            this.metadata = {};

            // this.$self = false;

            opts = elem;
        }

        if (!opts || typeof opts !== 'object') {
            opts = {};
        }

        // Store the options
        this.opts = opts;

        // In order to realistically do anything, we must receive:
        // 1. A parent node for the target `<select>` (first condition) so we can mount the dropdown
        // 2. At least one `<option>` (second and third conditions)
        if (!this.sourceElem.parentNode || !this.sourceElem.options || !this.sourceElem.options.length) {
            console.warn('Not enough info to proceed ', elem, opts, this);
            return null;
        }

        // console.log(this);

        var settings = {
                options: [],
                selectedIndex: 0,
                widestOption: 0,
                callback: priv.onValueChange,
                smallScreenWidth: 768, //TODO: Get this value from Sass?
            };
        var optionElem;
        var optionObj;
        var i;
        var numOptions;
        var widthTestSelect;
        var widthTestOption;
        var width;

        // Gather list of options

        // To measure the width of an `<option>` we need to leverage a test element since we can't measure each `<option>` directly (unless we momentarily change the `<select>` to choose that option, but that would have many bad repercussions). This test element will be mounted to the same parent node as the `<select>` so that it will inherit the same styles. Then we measure the test element and use it to measure the individual option's true width.
        widthTestSelect = document.createElement('select');
        widthTestSelect.style.cssText = 'position: absolute; visibility: hidden;'; // Make sure it assumes its natural layout but remains hidden from the user

        widthTestOption = document.createElement('option');
        widthTestSelect.appendChild(widthTestOption);
        this.sourceElem.parentNode.appendChild(widthTestSelect);

        // Looping through the `<option>` elements
        i = 0;
        numOptions = this.sourceElem.options.length;
        while (i < numOptions) {
            optionElem = this.sourceElem.options[i];
            width = 0;

            // Create an Option object
            optionObj = {};
            optionObj.value = optionElem.value;
            optionObj.label = optionElem.innerHTML.trim();

            if (optionElem.hasAttribute('selected')) {
                settings.selectedIndex = i;
                optionObj.selected = true;
            }
            else {
                optionObj.selected = false;
            }

            // Find the width
            widthTestOption.innerHTML = optionObj.label;
            width = parseInt(window.getComputedStyle(widthTestSelect).width, 10);

            if (width > settings.widestOption) {
                settings.widestOption = width;
            }

            settings.options.push(optionObj);

            i++;
        }

        // Make sure big text (e.g. lots of capital letters and Ws) doesn't get truncated. This is a magic number and pretty iflow-specific. As an example, the string "AAAA" gets truncated unless at least 5px are added
        settings.widestOption += 5;

        // Cleanup the test element
        this.sourceElem.parentNode.removeChild(widthTestSelect);


        var self = this; // Reference to this instance that can be passed to event handlers
        var selectedIndexText;
        var dropdownWidth = 0;
        var isOneOptionSelected = false; // Track whether an option is marked as selected by the caller

        // Settings
        this.options = this.sourceElem.options || [];
        this.optsArray = settings.options;
        this.selectedIndex = settings.selectedIndex || 0;
        this.widestOption = settings.widestOption || 0;

        // Default properties
        this.elems = {};
        this.isCollapsed = true;
        this.self = this;
        this.callback = settings.callback; // Will be called when the dropdown's value changes
        this.smallScreenWidth = !isNaN(settings.smallScreenWidth) ? settings.smallScreenWidth : 640;

        selectedIndexText = this.options[this.selectedIndex].label || 'Select one';

        // // The maximum width of the dropdown is the narrower of these two items: the parent container of the `<select>`, and the widest `<option>`
        // // In other words, don't let the dropdown get so wide that it will run off the screen and/or expand its container, but at the same time let it shrink down to its natural width if all the options are short
        // dropdownWidth = Math.min(this.elem.parentNode.clientWidth - 10, this.widestOption);

        // // Remove some width to account for help icons
        // if (window.innerWidth < this.smallScreenWidth) {
        //     // Trimming 7px is enough on desktop Chrome, but I didn't have a chance to test this on an actual iOS device with Avenir Next so I'm overcompensating a little
        //     dropdownWidth -= 10;
        // }
        // else {
        //     // Trimming 16px is enough on desktop Chrome, but I'm overcompensating to account for other browsers/fonts
        //     dropdownWidth -= 20;
        // }

        this.elems.container = document.createElement('div');
        this.elems.toggleWrap = document.createElement('div');
        this.elems.toggleLabel = document.createElement('div');
        this.elems.toggleThumb = document.createElement('i');
        this.elems.optionsList = document.createElement('ul');

        // Outer container
        this.elems.container.className = CLASSES.container;
        dropdownWidth = Dropdown.determineTogglerWidth(self);
        this.elems.container.style.width = dropdownWidth + 'px';

        // Accessibility attributes
        this.elems.container.setAttribute('role', 'dropdown');
        this.elems.container.setAttribute('aria-controls', guid(this.elems.optionsList)); // Note that this gives the `optionsList` element a (generated) ID
        this.elems.container.setAttribute('aria-hidden', 'true');
        this.elems.container.setAttribute('aria-expanded', 'false');

        // Use a 1-based index for values used with ARIA
        this.elems.container.setAttribute('aria-valuemin', 1);
        this.elems.container.setAttribute('aria-valuenow', this.selectedIndex + 1);
        this.elems.container.setAttribute('aria-valuemax', this.options.length);

        // Toggle area
        this.elems.toggleWrap.classList.add(CLASSES.toggler);
        this.elems.toggleWrap.setAttribute('tabindex', '1');

        this.elems.toggleWrap.addEventListener('click', function (evt) {
            Dropdown.onToggleClick(evt, self);
        }.bind(self), false);

        this.elems.toggleWrap.addEventListener('keydown', function (evt) {
            Dropdown.onToggleKeydown(evt, self);
        }.bind(self), false);

        this.elems.toggleLabel.innerHTML = selectedIndexText;

        // Build options list
        settings.options.forEach(function (opt, i) {
            var listItem = document.createElement('li');
            var _self = this;

            if (opt.selected) {
                // Make sure we only have one selected item
                if (!isOneOptionSelected) {
                    // Make a note that we have indeed found a selected option
                    isOneOptionSelected = true;
                    listItem.classList.add(CLASSES.selected);
                }
                else {
                    // The caller seems to have selected multiple items, which isn't allowed, so unselect this one
                    opt.selected = false;
                }
            }

            // Set additional properties on the object that we don't expect the caller to provide
            opt.index = i; // So the option knows where it falls in the list (i.e. is it selected? is it at the end? etc)

            listItem.innerHTML = opt.label;
            listItem.setAttribute(ATTRIBUTES.optionIndex, opt.index);
            listItem.setAttribute('tabindex', 1);

            // Event listeners
            listItem.addEventListener('click', function (evt) {
                Dropdown.onItemClick(evt, _self);
            }.bind(_self), false);

            listItem.addEventListener('keydown', function (evt) {
                Dropdown.onItemDown(evt, _self);
            }.bind(_self), false);

            // Append to the DOM
            self.elems.optionsList.appendChild(listItem);

            // Store a reference to the `<li>` element
            opt.element = listItem;
        }.bind(self));

        // Ensure some item is selected. If the caller didn't mark any, then just go with the first one
        if (!isOneOptionSelected) {
            this.options[0].selected = true;
        }

        this.elems.optionsList.className = CLASSES.hidden + ' ' + CLASSES.optionsList;
        this.elems.optionsList.setAttribute('aria-hidden', 'true');
        this.elems.optionsList.setAttribute('aria-expanded', 'false');
        this.elems.optionsList.setAttribute('tabindex', '1');
        this.elems.optionsList.style.width = dropdownWidth + 'px';

        // Add everything to the DOM

        // Build toggler
        this.elems.toggleWrap.appendChild(this.elems.toggleLabel);
        this.elems.toggleWrap.appendChild(this.elems.toggleThumb);

        // Add toggler to container
        this.elems.container.appendChild(this.elems.toggleWrap);

        // Add the options list directly to the `<body>` so we can position it with respect to the entire page
        document.body.appendChild(this.elems.optionsList);

        // Create reference to the container element so the caller can mount it to the DOM as necessary
        this.element = this.elems.container;

        // Add window resize event listener
        window.addEventListener('resize', function (evt) {
            Dropdown.onWindowResize(evt, self);
        }.bind(self), false);

        // Mount the dropdown element right after the `<select>` element so it appears in the same place on the page (i.e. their may be other siblings in the `<select>` container and we want the dropdown to be in the right order)
        this.sourceElem.parentNode.insertBefore(this.element, this.sourceElem.nextSibling);

        // Hide original `<select>`
        this.sourceElem.style.display = 'none';

        // Store the Dropdown instance
        dropdowns[guid(this.sourceElem)] = this;

        return this;
    };

    ////////////////////
    // Public methods //
    ////////////////////

    Dropdown.prototype = {};

    Dropdown.prototype.default = {
    };

    Dropdown.prototype.init = function _init () {
        var dd = this;
        var selectElem;

        // Extend the config options with the defaults
        dd.config = $.extend(true, {}, this.default, this.options);

        // console.log(this);

        // Find the `<select>` element since the class we queried for is usually on the parent
        if (dd.sourceElem.nodeName !== 'SELECT') {
            console.warn('durp ', dd);
            this.sourceElem = dd.sourceElem.getElementsByTagName('select');

            if (!this.sourceElem || !this.sourceElem.length) {
                return false;
            }

            this.sourceElem = this.sourceElem[0];
        }
        else {
            this.sourceElem = dd.sourceElem;
        }

        if (!this.sourceElem) {
             return false;
        }

        // priv.setup(this.sourceElem);

        return dd;
    };

    Dropdown.prototype.teardown = function _teardown () {
        priv.teardown();

        return true;
    };

    Dropdown.version = VERSION;

    Dropdown.getVersion = function _getVersion () {
        return VERSION;
    };

    /////////////////////
    // Private methods //
    /////////////////////

    /**
     * Display the popover
     */
    Dropdown.show = function _show (DD) {
        DD.isCollapsed = false;

        // Position the popover before display
        Dropdown.prePositionPopover(DD);

        // Reveal the popover
        DD.elems.optionsList.style.height = '0px';
        DD.elems.optionsList.classList.remove(CLASSES.hidden);

        // Expansion animation
        $(DD.elems.optionsList).animate(
                {
                    height: DD.elems.optionsList.scrollHeight,
                },
                {
                    easing: ANIMATION.easing,
                    duration: ANIMATION.duration,
                    done: function () {
                        this.style.height = 'auto';
                    },
                }
            );

        // Update visibility attributes
        DD.elems.container.setAttribute('aria-expanded', 'true');
        DD.elems.container.setAttribute('aria-hidden', 'false');
        DD.elems.container.classList.add(CLASSES.expanded);

        // Watch for body clicks
        document.body.addEventListener('click', function (evt) {
            Dropdown.onBodyClick(evt, DD);
        }.bind(DD), false);
    };

    /**
     * Hide the popover
     */
    Dropdown.hide = function _hide (DD) {
        DD.isCollapsed = true;

        // Collapse animation
        $(DD.elems.optionsList).animate(
                {
                    height: '0px',
                },
                {
                    easing: ANIMATION.easing,
                    duration: ANIMATION.duration,
                    done: function () {
                        // Hide the popover
                        // Even though the element is effectively invisible at this point, we use this class as a quick test of whether it's hidden or not
                        DD.elems.optionsList.classList.add(CLASSES.hidden);
                    },
                }
            );

        // Update visibility attributes
        DD.elems.container.setAttribute('aria-expanded', 'false');
        DD.elems.container.setAttribute('aria-hidden', 'true');
        DD.elems.container.classList.remove(CLASSES.expanded);

        // Stop watching for body clicks
        document.body.addEventListener('click', function (evt) {
            Dropdown.onBodyClick(evt, DD);
        }.bind(DD), false);
    };

    /**
     * Position the popover
     */
    Dropdown.positionPopover = function _positionPopover (DD) {
        // console.log('positionPopover ', DD.elems.toggleWrap);
        var popover = DD.elems.optionsList;
        var toggler = DD.elems.toggleWrap;
        var togglerOffset = $(toggler).offset();

        // Small screens
        if (Dropdown.isSmallScreen(DD)) {
            //FIXME: Center it on the viewport
            // For now we will do the same thing that we do on large screens. Mobile users may have to scroll the page down to select their item. This is so that we can ship a working version of this component now, when STMI is going to prod and CSTF is already in prod. Later we need to update this to display the dropdown list as a scrollable modal overlay on mobile.
            popover.style.top = (togglerOffset.top + toggler.clientHeight + 1) + 'px';
            popover.style.left = togglerOffset.left + 'px';

            // When updating this module for mobile, remove the two lines above and instead use the following two lines to position the popover in the center of the viewport
            // popover.style.top = ???;
            // popover.style.left = ((document.body.clientWidth / 2) - (popover.clientWidth / 2)) + 'px';
        }
        // Large screens
        else {
            // Line it up with the toggler
            popover.style.top = (togglerOffset.top + toggler.clientHeight + 1) + 'px';
            popover.style.left = togglerOffset.left + 'px';
        }
    };

    /**
     * Put the popover into place but keep it hidden from the user
     * @param   {Dropdown}  DD  Dropdown instance
     */
    Dropdown.prePositionPopover = function _prePositionPopover (DD) {
        var popover = DD.elems.optionsList;

        popover.style.visibility = 'hidden';
        popover.classList.remove(CLASSES.hidden);
        Dropdown.positionPopover(DD);
        popover.classList.add(CLASSES.hidden);
        popover.style.visibility = 'visible';
    };

    // Adjust the width of the toggler to match the current viewport width (e.g. when resizing the browser with the dropdown closed)
    Dropdown.fixTogglerWidth = function _fixTogglerWidth (DD) {
        DD.elems.container.style.width = Dropdown.determineTogglerWidth(DD) + 'px';
    };

    // Basically determines whether to center the list on the screen when opened
    Dropdown.isSmallScreen = function _isSmallScreen (DD) {
        return (window.innerWidth <= DD.smallScreenWidth);
    };

    Dropdown.determineTogglerWidth = function _determineTogglerWidth (DD) {
        // The maximum width of the dropdown is the narrower of these two items: the parent container of the `<select>`, and the widest `<option>`
        // In other words, don't let the dropdown get so wide that it will run off the screen and/or expand its container, but at the same time let it shrink down to its natural width if all the options are short
        var dropdownWidth = Math.min(DD.sourceElem.parentNode.clientWidth - 10, DD.widestOption);

        // Remove some width to account for help icons
        // Small screens
        if (window.innerWidth < DD.smallScreenWidth) {
            // Trimming 7px is enough on desktop Chrome, but I didn't have a chance to test this on an actual iOS device with Avenir Next so I'm overcompensating a little
            dropdownWidth -= 10;
        }
        // Large screens, but only if the toggler is big enough to actually wrap a help icon, otherwise we risk truncating small dropdowns unnecessarily
        else if (dropdownWidth > 300) { // 300px is semi-arbitrary
            // Trimming 16px is enough on desktop Chrome, but I'm overcompensating to account for other browsers/fonts
            dropdownWidth -= 20;
        }

        // console.log('Source elem: ', DD.sourceElem.parentNode.clientWidth, DD.sourceElem.parentNode);
        // console.log('widest Option: ', DD.widestOption);

        return dropdownWidth;
    };

    Dropdown.setSelectedIndex = function _setSelectedIndex (DD, newIndex, doNotForcefullyHide) {
        console.log(DD.optsArray);
        // Unselect the current selection
        DD.optsArray[DD.selectedIndex].element.classList.remove(CLASSES.selected);

        // Select the new item
        DD.optsArray[newIndex].element.classList.add(CLASSES.selected);

        // Update the toggler text
        DD.elems.toggleLabel.innerHTML = DD.optsArray[newIndex].label;

        DD.elems.container.setAttribute('aria-valuenow', newIndex + 1);

        // Update instance
        DD.selectedIndex = newIndex;

        // Hide popover, unless we were told to keep it open or it's already closed
        if (!doNotForcefullyHide && !DD.isCollapsed) {
            Dropdown.hide(DD);
        }

        // Notify calling function about the new value
        if (typeof DD.callback === 'function') {
            DD.callback({
                value: DD.options[newIndex].value, // New value
                element: DD.sourceElem, // Reference to the original element for this Dropdown (usually a `<select>`)
            });
        }
    };

    Dropdown.handleLetterKey = function _handleLetterKey (code, DD) {
        // Get the letter or number, but account for different codes like the number pad, capital letters, etc
        // See http://stackoverflow.com/a/5829387/348995
        var letter = String.fromCharCode((96 <= code && code <= 105)? code - 48 : code).toLowerCase();
        var foundItemBeforeCurrent = -1;
        var foundItemAfterCurrent = -1;
        var moveFocusToIndex = -1;

        // Find an option that starts with this character
        DD.optsArray.some(function (opt) {
            // Cache the first character of the option for future searches
            if (!opt.firstChar) {
                opt.firstChar = opt.label.substr(0, 1).toLowerCase();
            }

            if (opt.firstChar === letter) {
                // Case 1: This item was already selected
                if (opt.index === DD.selectedIndex) {
                    // We need to look for another item further down the list, so we'll do nothing here and just let the loop keep running
                }
                // Case 2: This item was not selected and it comes *before* the currently selected item
                else if (opt.index < DD.selectedIndex) {
                    // There may be other items further down the list that the focus should jump to instead of this item. However, if there aren't any other such items, we need to keep track of this one so the focus can loop back around to it.
                    // This conditional statement is to make sure we only flag one of these "before" items
                    if (foundItemBeforeCurrent === -1) {
                        foundItemBeforeCurrent = opt.index;
                    }
                    // Let the loop continue searching
                }
                // Case 3: This item was not selected and it comes *after* the currently selected item
                else if (opt.index > DD.selectedIndex) {
                    foundItemAfterCurrent = opt.index;
                    // Quit the loop since we've found a suitable item to shift focus to
                    return true;
                }
            }
        });

        // See if we found an item *after* the current selection
        if (foundItemAfterCurrent !== -1) {
            moveFocusToIndex = foundItemAfterCurrent;
        }
        // If not, then see if we found an item *before* the current selection
        else if (foundItemBeforeCurrent !== -1) {
            moveFocusToIndex = foundItemBeforeCurrent;
        }

        // Focus on it, but don't force the popover to hide if it's already open
        if (moveFocusToIndex !== -1) {
            Dropdown.setSelectedIndex(DD, moveFocusToIndex, true);
        }
    };

    ////////////
    // Events //
    ////////////

    Dropdown.onItemClick = function _onItemClick (evt, DD) {
        // Read the index from the clicked element
        var listItem = evt.target;
        var newIndex = parseInt(listItem.getAttribute(ATTRIBUTES.optionIndex), 10);

        // Check if the clicked item is different than the previous selection
        if (newIndex !== DD.selectedIndex) {
            Dropdown.setSelectedIndex(DD, newIndex);
            DD.elems.toggleWrap.focus();
        }
    };

    Dropdown.onToggleClick = function _onToggleClick (evt, DD) {
        // Cancel event so it doesn't trigger `onBodyClick()`
        evt.preventDefault();

        if (DD.isCollapsed) {
            Dropdown.show(DD);
        }
        else {
            Dropdown.hide(DD);
        }
    };

    Dropdown.onToggleKeydown = function _onToggleKeydown (evt, DD) {
        var code = evt.keyCode;

        // Enter or space
        if (code === 13 || code === 32) {
            // if (DEBUG) { console.info('[Toggler] Enter or space'); }

            // Prevent page scrolling (e.g. if the spacebar was pressed)
            evt.preventDefault();

            if (DD.isCollapsed) {
                // if (DEBUG) { console.log('[Toggler] Toggling the list open'); }
                Dropdown.show(DD);
            }
            else {
                // if (DEBUG) { console.log('[Toggler] Toggling the list closed'); }
                Dropdown.hide(DD);
            }
        }
        // Tab
        else if (code === 9) {
            // if (DEBUG) { console.info('[Toggler] Tab'); }
            // Not shift-tab, and only if dropdown is already open
            if (!evt.shiftKey && !DD.isCollapsed) {
                // if (DEBUG) { console.log('[Toggler] Shifting focus to the list'); }
                DD.elems.optionsList.focus();
            }
        }
        // Escape
        else if (code === 27) {
            // if (DEBUG) { console.info('[Toggler] Escape'); }
            if (!DD.isCollapsed) {
                // if (DEBUG) { console.log('[Toggler] Hiding the list since it was opened'); }
                Dropdown.hide(DD);
            }
        }
        // Down arrow
        else if (code === 40) {
            // if (DEBUG) { console.info('[Toggler] Down arrow'); }

            // Prevent page scrolling
            evt.preventDefault();

            // Not opened yet, so open it
            if (DD.isCollapsed) {
                // if (DEBUG) { console.log('[Toggler] Opening the list since it was closed'); }
                Dropdown.show(DD);
            }

            // Focus on the first item
            // if (DEBUG) { console.log('[Toggler] Setting focus to the first item'); }
            DD.optsArray[0].element.focus();
        }
        // Up arrow
        else if (code === 38) {
            // if (DEBUG) { console.info('[Toggler] Up arrow'); }

            // Prevent page scrolling
            evt.preventDefault();

            // List is opened, so hide it
            if (!DD.isCollapsed) {
                // if (DEBUG) { console.log('[Toggler] Hiding the list since it was opened'); }
                Dropdown.hide(DD);
            }
        }
        // Letters or numbers
        else if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 96 && code <= 105)) {
            Dropdown.handleLetterKey(code, DD);
        }
        // else if (DEBUG) { console.info('[Toggler] Unrecognized key: ', code); }
    };

    // Need to use `keydown` instead of `keyup` so we can prevent the page from scrolling when the user presses an arrow key
    Dropdown.onItemDown = function _onItemDown (evt, DD) {
        var code = evt.keyCode;
        var listItem;
        var itemIndex;

        // Don't let the event bubble to the list
        evt.preventDefault();

        // Enter or space
        if (code === 13 || code === 32) {
            // if (DEBUG) { console.info('[Item] Enter or space'); }
            // if (DEBUG) { console.log('Selecting item'); }
            // if (DEBUG) { console.log('Passing event: ', evt); }
            Dropdown.onItemClick(evt, DD);
        }
        // Tab or down arrow
        else if ((!evt.shiftKey && code === 9) || code === 40) {
            // if (DEBUG) { console.info('[Item] Tab or down arrow'); }
            listItem = evt.target;
            itemIndex = parseInt(listItem.getAttribute(ATTRIBUTES.optionIndex), 10);

            // See if there is another item below this one
            if (DD.optsArray.length > itemIndex + 1) {
                // if (DEBUG) { console.log('Shifting focus down from item ' + itemIndex + ' to item ' + (itemIndex + 1)); }
                DD.optsArray[itemIndex + 1].element.focus();
            }
            // No more items below this one, go back to the top
            else {
                // if (DEBUG) { console.log('Shifting focus back to the top item'); }
                DD.optsArray[0].element.focus();
            }
        }
        // Shift-tab or up arrow
        else if ((evt.shiftKey && code === 9) || code === 38) {
            // if (DEBUG) { console.info('[Item] Shift-tab or up arrow'); }
            listItem = evt.target;
            itemIndex = listItem.getAttribute(ATTRIBUTES.optionIndex);

            // See if there is another item above this one
            if (itemIndex > 0) {
                // if (DEBUG) { console.log('Shifting focus to the previous item'); }
                DD.optsArray[itemIndex - 1].element.focus();
            }
            // No more items above this one, close the list
            else {
                // if (DEBUG) { console.log('Shifting focus back to the toggler and closing the list'); }
                Dropdown.hide(DD);
                DD.elems.toggleWrap.focus();
            }
        }
        // Escape
        else if (code === 27) {
            // if (DEBUG) { console.info('[Item] Escape'); }
            // Hide the list (assume it was open — how else could a keystroke be fired on a list item?)
            // if (DEBUG) { console.log('Hiding the list since it was opened and setting focus back to the toggler'); }
            Dropdown.hide(DD);
            DD.elems.toggleWrap.focus();
        }
        // Letters or numbers
        else if ((code >= 48 && code <= 57) || (code >= 65 && code <= 90) || (code >= 96 && code <= 105)) {
            Dropdown.handleLetterKey(code, DD);
        }
        // else if (DEBUG) { console.info('[Item] Unrecognized key: ', code); }
    };

    Dropdown.onBodyClick = function _onBodyClick (evt, DD) {
        var target = evt.target;

        if (!$(target).closest('.' + CLASSES.container).length) {
            //FIXME: Cancel event only if it's near the popover (rather than anywhere at all on the page)
            // 1. It's weird to have an item next to the popover take action when you only meant to clear the popover (i.e. expanding instructions)
            // 2. If the user leaves the popover open and then scrolls down the page a bit, it will seem broken if they click on something and it doesn't appear to work until the second click
            evt.preventDefault();

            Dropdown.hide(DD);
        }
    };

    /**
     * Adjusts the popover based on the current window size
     */
    Dropdown.onWindowResize = function _onWindowResize (evt, DD) {
        // console.clear(); console.info('resize');
        if (DD.isCollapsed) {
            // Adjust toggler width
            // console.log('Adjusting toggle widths');
            Dropdown.fixTogglerWidth(DD);
        }
        else {
            // Re-position popover
            // console.log('Repositioning popovers');
            Dropdown.positionPopover(DD);
        }
    };

    ////////////////////
    // Public methods //
    ////////////////////

    Dropdown.prototype.destroy = function _destroy () {
        // Remove event listeners
        document.body.removeEventListener('click', Dropdown.onBodyClick);
        window.removeEventListener('resize', Dropdown.onWindowResize);

        this.elems.toggleWrap.removeEventListener('click', this.onToggleClick);

        // Remove elements
        this.elems.container.parentNode.removeChild(container);

        // Reset all public properties
        this.selectedIndex = -1;
        this.elems = {};
        this.options = [];
    };






    // **************************************************************
    // **************************************************************
    // **************************************************************
    // **************************************************************
    // **************************************************************
    // **************************************************************
    // **************************************************************




    // This is a liaison between iflow and the Dropdown class. It finds applicable `<select>` elements, converts them to settings objects, and passes those settings to `Dropdown`. It also listens to changes that come back from `Dropdown` and updates the `<select>` to point to the correct option.

    /////////////////////
    // Private methods //
    /////////////////////

    priv.teardown = function _teardownPage () {
        var id;

        // Loop through all known Dropdown instances
        for (id in dropdowns) {
            if (dropdowns.hasOwnProperty(id) && dropdowns[id]) {
                // Reveal the corresponding `<select>` element
                document.getElementById(id).style.display = 'inline';
                // document.getElementById(id).style.borderColor = 'black';
                // document.getElementById(id).style.borderStyle = 'solid';
                // document.getElementById(id).style.color = 'black';

                // Destroy component
                dropdowns[id].destroy();

                // Remove from list
                delete dropdowns[id];
            }
        }
    };

    priv.onValueChange = function _onValueChange (obj) {
        $(obj.element).val(obj.value);
    };


    ///////////////////////////
    // Expose public methods //
    ///////////////////////////

    Dropdown.version = VERSION;

    // Define and expose the component to jQuery
    $.fn.dropdown = function (options) {
        return this.each(function () {
            new Dropdown(this, options).init();
        });
    };

    $.dropdown = function (elem, options) {
        return new Dropdown(elem, options).init();
    };
});
