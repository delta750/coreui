define(['jquery', 'cui', 'guid'], function ($, cui, guid) {
    ///////////////
    // Constants //
    ///////////////
    var VERSION = '1.0.2';
    var NAMESPACE = 'popover';

    var EVENT_NAMES = {
        show:   'show.cui.' + NAMESPACE,
        shown:  'shown.cui.' + NAMESPACE,
        hide:   'hide.cui.' + NAMESPACE,
        hidden: 'hidden.cui.' + NAMESPACE,
    };

    var CLASSES = {
        popover: 'cui-' + NAMESPACE,
        toggle: 'cui-' + NAMESPACE + '-toggle',
    };

    var PADDING = 6;

    var priv = {};
    var popoverList = {};
    var $body = $('body');
    var $window = $(window);

    /////////////////
    // Constructor //
    /////////////////

    var Popover = function _Popover (elem, options) {
        // Create both a jQuery copy and a regular DOM copy of the element
        if (elem instanceof $) {
            this.$button = elem;
            this.button = elem.get(0);
        }
        else if (elem instanceof HTMLElement) {
            this.button = elem;
            this.$button = $(elem);
        }

        // Store the options
        this.options = options;

        // Extract data attribute options
        this.metadata = this.$button.data('popover-options');

        return this;
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    Popover.prototype = {};

    // Default user options
    Popover.prototype.defaults = {
        html: '',
        display: {
            css: {
            },
            className: '',
            offset: {
                top: 0,
                left: 0,
            },
        },
        location: 'below-right',
        showPop: true,
        hideOnResize: false,
        hideOnEscape: true,
        gainFocus: false,
        isModal: true,
    };

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Popover.prototype.init = function _Popover_init () {
        var popover;
        var isInPageLink = (this.button.hasAttribute('href') && /^\#/.test(this.button.getAttribute('href')));

        // Introduce defaults that can be extended either globally or using an object literal
        if (typeof this.options === 'string') {
            this.config = $.extend(true, {}, this.defaults);
            this.config.html = this.options;
        }
        else {
            this.config = $.extend(true, {}, this.defaults, this.options, this.metadata);
        }

        // Create new popover object using this instance
        popover = this;

        popover.id = NAMESPACE + '_' + guid();
        popover.isShown = false;

        if (popover.config.html === '' && popover.$button.attr('title')) {
            popover.config.html = '<span>' + popover.$button.attr('title') + '</span>';
        }

        // Add a class to the button so we can tell whether it was clicked in `priv.onBodyClick()`
        popover.$button.addClass(CLASSES.toggle);

        // Create the popover element
        popover.$popover = priv.createPopover(popover);

        // Set up event listeners

        // Show/hide the popover when its button is clicked
        popover.$button.on('click', function _popover_onClick (evt) {
            // Prevent the page from jumping when the button links to another element
            if (isInPageLink) {
                evt.preventDefault();
            }

            if (popover.isShown === false) {
                priv.showPopover(popover);
            }
            else {
                priv.hidePopover(popover);
            }
        }.bind(popover));

        // Show/hide the popover when the user clicks outside of it
        // We need to give this function a name so it can be referenced later since we will turn it on and off. Other event listeners (e.g. window resize) are only ever turned on so we can just use anonymous functions without storing them.
        popover.onBodyClick = function _popover_onBodyClick (evt) {
            priv.onBodyClick(evt, popover);
        }.bind(popover);

        // Hide the popover when the Escape key is pressed
        if (popover.config.hideOnEscape) {
            $window.on('keyup', function _popover_onKeyup (evt) {
                priv.onWindowKeyup(evt, popover);
            }.bind(popover));
        }

        // Keep the popover aligned properly when window is resized
        $window.on('resize', function _popover_onResize (evt) {
            priv.onWindowResize(evt, popover);
        }.bind(popover));

        // Adds this Popover instance to our list so we can track all of them
        popoverList[popover.id] = popover;

        // Return this instance of the plugin
        return popover;
    };

    /**
     * Hides the popover
     *
     * @param   {Function}  callback         Optional function to run after closing the popover. It will receive the Popover instance as an argument.
     * @param   {Boolean}   hideImmediately  Set to `true` to skip animation and event triggering
     */
    Popover.prototype.hide = function _Popover_hide (callback, hideImmediately) {
        priv.hidePopover(this, hideImmediately);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Display the popover
     *
     * @param   {Function}  callback  Optional function to run after closing the popover. It will receive the Popover instance as an argument.
     */
    Popover.prototype.show = function _Popover_show (callback) {
        priv.showPopover(this);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * (Re)position the popover
     *
     * @param   {Function}  callback  Optional function to run after closing the popover. It will receive the Popover instance as an argument.
     */
    Popover.prototype.position = function _Popover_position (callback) {
        priv.positionPopover(this);

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(this);
        }
    };

    /**
     * Destroy the popover
     *
     * @param   {Function}  callback  Optional function to run after closing the popover. It will receive the Popover instance as an argument.
     */
    Popover.prototype.destroy = function _Popover_destroy (callback) {
        var popover = this;
        var index = -1;

        // Hide it
        if (popover.isShown) {
            // Pass the "hide immediately" flag. A few lines below here we will remove the element so we don't want it to awkwardly disappear during the closing animation
            priv.hidePopover(popover, true);
        }

        // Undo any changes to the button
        popover.$button
            .removeClass(CLASSES.toggle)
            .off('click');

        // Remove the element
        popover.$popover
            .empty()
            .remove();

        // Remove event listeners from other elements

        if (popover.config.hideOnEscape) {
            $window.off('keyup');
        }

        $window.off('resize');

        $body.off('click', popover.onBodyClick);
        popover.onBodyClick = null;

        // Remove this Popover instance from our list
        delete popoverList[popover.id];

        // Check to see if the caller included a callback function
        if (typeof callback === 'function') {
            callback(popover);
        }

        return popover;
    };

    /////////////////////
    // Private methods //
    /////////////////////

    // Opens a new popover window
    priv.showPopover = function _showPopover (popover) {
        // Hide other popovers
        if (popover.config.isModal) {
            priv.hideAllPopovers();
        }

        // Position it
        priv.positionPopover(popover);

        // Reveal it
        popover.$popover
            .animate(
                {opacity: 1},
                400,
                function _showPopover_animate () {
                    if (popover.gainFocus) {
                        $(this).focus();
                    }

                    popover.$popover.trigger(EVENT_NAMES.shown);
                    $window.trigger(EVENT_NAMES.shown);
                }
            );

        popover.isShown = true;

        // Add event listeners
        $body.on('click', popover.onBodyClick);

        popover.$popover.trigger(EVENT_NAMES.show);
        $window.trigger(EVENT_NAMES.show);
    };

    // Hides all popover instances
    priv.hideAllPopovers = function _hideAllPopovers () {
        Object.keys(popoverList).forEach(function (id) {
            priv.hidePopover(popoverList[id], true);
        });
    };

    /**
     * Hides a popover element
     *
     * @param   {Object}   popover           Popover instance
     * @param   {Boolean}  hideImmediately  Set to `true` to skip animation and event triggering
     */
    priv.hidePopover = function _hidePopover (popover, hideImmediately) {
        // Hide with animation and fire an event
        // This usually happens when a single popover is dismissed
        if (!hideImmediately) {
            // Animate it to hidden
            popover.$popover
                .animate(
                    {opacity: 0},
                    400,
                    function _hidePopover_animate () {
                        this.style.opacity = '0';
                        // Reset the position so that it doesn't cover other elements while invisible
                        this.style.top = '0';
                        this.style.left = '-9999em';

                        popover.$popover.trigger(EVENT_NAMES.hidden);
                        $window.trigger(EVENT_NAMES.hidden);
                    }
                )
                .trigger(EVENT_NAMES.hide);

            $window.trigger(EVENT_NAMES.hide);
        }
        // Hide it immediately without animation or events
        // This usually means we're closing all popovers before opening a new one and we don't want to create a delay
        else {
            popover.$popover
                .css({
                    opacity: 0,
                    top: '0',
                    left: '-9999em',
                })
                .trigger(EVENT_NAMES.hide)
                .trigger(EVENT_NAMES.hidden);

            $window.trigger(EVENT_NAMES.hide);
            $window.trigger(EVENT_NAMES.hidden);
        }

        popover.isShown = false;

        $body.off('click', popover.onBodyClick);
    };

    // Create the popover container element
    priv.createPopover = function _createPopover (popover) {
        // Defines the popover window div and makes it fade in
        var $popover = $('<div/>')
                            .addClass(CLASSES.popover)
                            .addClass(popover.config.display.className)
                            .attr('tabindex', '1')
                            .css(popover.config.display.css)
                            .css('opacity', '0') // Keep it hidden for now
                            .appendTo(document.body);

        // Add content
        if (popover.config.html instanceof $) {
            $popover.append(popover.config.html);
        }
        else {
            $popover.html(popover.config.html);
        }

        return $popover;
    };

    // Function that will position the popover on the page - Aligned to right side of Notifications button
    priv.positionPopover = function _positionPopover (popover) {
        var position = {
            top: 0,
            left: 0,
        };
        var addedRightMargin = false;
        var windowWidth;
        var popoverWidth;
        var popoverHeightActual;
        var popoverHeightWithPadding;
        var buttonOffset;
        var buttonWidth;
        var buttonHeight;
        var difference;

        /**
         * Determines the position based on the requested location, detects boundary collisions, and falls back to other locations if necessary
         *
         * @param   {String}  location  Location of the popover
         * @param   {Object}  position  Position definition
         *
         * @return  {Object}            Updated position definition
         */
        var __determinePosition = function __determinePosition (location, position) {
            /**
             * Determines the top and left positioning for the popover
             * This is a very simple, nearly logic-less function that does not do boundary testing or fallbacks
             */
            var __getTopAndLeft = function __getTopAndLeft (placement) {
                // Returns the `top` value when the popover is above the button
                var __getTopWhenAbove = function __getTopWhenAbove () {
                    return buttonOffset.top - popoverHeightWithPadding;
                };

                // Returns the `top` value when the popover is below the button
                var __getTopWhenBelow = function __getTopWhenBelow () {
                    return buttonOffset.top + buttonHeight + PADDING;
                };

                if (placement === 'below-left') {
                    position.left = buttonOffset.left + buttonWidth - popoverWidth + (PADDING / 2);
                    position.top = __getTopWhenBelow();
                }
                else if (placement === 'above-left') {
                    position.left = buttonOffset.left + buttonWidth - popoverWidth + (PADDING / 2);
                    position.top = __getTopWhenAbove();
                }
                else if (placement === 'below-right') {
                    position.left = buttonOffset.left;
                    position.top = __getTopWhenBelow();
                }
                else if (placement === 'above-right') {
                    position.left = buttonOffset.left;
                    position.top = __getTopWhenAbove();
                }
                else if (/^(above|below)\-center$/.test(placement)) {
                    // Vertical position is different for each `center` location
                    if (placement === 'below-center') {
                        position.top = __getTopWhenBelow();
                    }
                    else if (placement === 'above-center') {
                        position.top = __getTopWhenAbove();
                    }

                    // Horizontal position is the same for both `center` locations

                    // To determine the `left` value, start at the left edge of the button...
                    position.left = buttonOffset.left;

                    // ...then add half of the difference between the button's width and the popover's width
                    // If the popover is wider than the button, the difference will be a negative number which will actually pull the popover to the right (which is what we'd want to happen)
                    position.left += ((buttonWidth - popoverWidth) / 2);
                }
                else if (/^inline\-(right|left)$/.test(placement)) {
                    // Horizontal position is different for each `inline` location
                    if (placement === 'inline-left') {
                        position.left = buttonOffset.left - popoverWidth - PADDING;
                    }
                    else if (placement === 'inline-right') {
                        position.left = buttonOffset.left + buttonWidth + PADDING;
                    }

                    // Vertical position is the same for both `inline` locations

                    // To determine the `top` value, start at the top edge of the button...
                    position.top = buttonOffset.top;

                    // ...then add half of the difference between the button's height and the popover's height
                    // If the popover is taller than the button, the difference will be a negative number which will actually pull the popover upward (which is what we'd want to happen)
                    position.top += ((buttonHeight - popoverHeightActual) / 2);
                }
            };

            // Start off with a simple guess at the top and left values
            __getTopAndLeft(location);

            // Perform boundary detection and fallbacks based on the requested location
            // Note that not all locations have fallbacks. If they did, then we might create an infinite loop as each test fails and calls another fallback in turn. Instead, some of the locations merely tweak the positioning to find the most practical position for the popover. These locations are marked with a 'safe' comment -- falling back to a safe location will avoid infinite looping. Do not use a 'not safe' location as a fallback.

            // Safe (no recursive fallback)
            if (location === 'below-left') {
                // Clipped by the left edge of the screen
                if (position.left < 0) {
                    // Determine how far it is from the left edge (a negative value means it's being clipped)
                    difference = windowWidth - (position.left + popoverWidth + PADDING);

                    // Shift the popover to the right just enough to fit on-screen
                    position.left = 0;

                    // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                    popover.$popover.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'above-left') {
                // We need to verify two things in conjunction: that it's not clipped by the top of the window, and that it's not running off the left edge of the screen

                // Condition: clipped by the top edge of the window
                if (position.top < 0) {
                    // It does not matter whether the popover is also clipped by the left edge. While we can fix the `left` value easily (see next condition), our only recourse for `top` is to fallback to a safe location
                    position = __determinePosition('below-left', position);
                }
                // Condition: clipped by the left edge of the window only
                else if (position.left < 0) {
                    // Shift the popover to the right just enough to fit on-screen
                    position.left = 0;

                    // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                    popover.$popover.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
            }
            // Safe (no recursive fallback)
            else if (location === 'below-right') {
                // Determine how far it is from the right edge (a negative value means it's being clipped)
                difference = windowWidth - (position.left + popoverWidth + PADDING);

                // Clipped by the right edge
                if (difference < 0) {
                    // Shift the popover to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                        popover.$popover.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'above-right') {
                // We need to verify two things inconjunction: that it's not clipped by the top of the window, and that it's not running off the left edge of the screen

                // Determine how far it is from the right edge (a negative value means it's being clipped)
                difference = windowWidth - (position.left + popoverWidth + PADDING);

                // Condition: clipped by the top of the window
                if (position.top < 0) {
                    // It doesn't matter if it is also clipped by the right edge. While we could fix the `left` value easily (see next condition), our only recourse for `top` is to fallback to a safe location
                    position = __determinePosition('below-right', position);
                }
                // Condition: clipped by the right edge of the window only
                else if (difference < 0) {
                    // Shift the popover to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                        popover.$popover.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'inline-left') {
                // Condition: clipped by the left edge of the screen
                if (position.left < 0) {
                    position = __determinePosition('below-left', position);
                }
            }
            // Not safe (includes recursive fallback)
            else if (location === 'inline-right') {
                // Condition: clipped by the right edge of the screen
                if (position.left + popoverWidth > windowWidth) {
                   __determinePosition('below-right', position);
                }
            }
            // Not safe (includes recursive fallback) unless only the `top` is broken
            else if (location === 'below-center') {
                // There are two bad scenarios: the popover is clipped by the right edge of the screen, or it's clipped by the left edge

                // Condition: clipped by the left edge of the screen
                if (position.left < 0) {
                    // Shift it to the right just enough to be on-screen
                    position.left = 0;

                    // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                    popover.$popover.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
                // Clipped by the right edge
                else if (position.left + popoverWidth > windowWidth) {
                   __determinePosition('below-right', position);
                }
            }
            // Not safe (includes recursive fallback) when the `top` is broken
            else if (location === 'above-center') {
                // There are three bad scenarios we need to check for. The popover can be clipped by these edges of the screen:
                // 1. top
                // 2. left
                // 3. right
                // We do not need to check for combinations (e.g. clipped by the right and top edges) because our fallback for `top` will handle any horizontal issues

                // 1. Clipped by the top edge
                if (position.top < 0) {
                    // If the top is broken we are forced to move the popover below the button. There's no point looking into whether it also fails the left or right edge since our fallback will take care of that.
                    __getTopAndLeft('below-center');
                    position = __determinePosition('below-center', position);
                }
                // 2. Clipped by the left edge, but not the top
                else if (position.left < 0) {
                    // Shift it to the right just enough to be on-screen
                    position.left = 0;

                    // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                    popover.$popover.css('margin-right', PADDING + 'px');
                    addedRightMargin = true;
                }
                // 3. Clipped by the right edge, but not the top
                else if (position.left + popoverWidth > windowWidth) {
                    // Determine how far it is from the left edge (a negative value means it's being clipped)
                    difference = windowWidth - (position.left + popoverWidth + PADDING);

                    // Shift the popover to the right just enough to fit on-screen
                    position.left += difference;
                    position.left -= PADDING;

                    // But make sure we didn't just push it off the left edge of the screen
                    if (position.left < 0) {
                        position.left = 0;

                        // Add a margin to prevent the popover from butting up against the edge of the screen. We cannot simply change the `left` value to create this gap because if the popover contains wrapping text the text will simply reflow and keep using as much width as possible.
                        popover.$popover.css('margin-right', PADDING + 'px');
                        addedRightMargin = true;
                    }
                }
            }
            else {
                journal.log({type: 'error', owner: 'UI', module: 'popover', submodule: 'positionPopover', func: '__determinePosition'}, 'Unsupported location "', popover.config.location, '" ', popover);

                return null;
            }

            return position;
        };

        // Gather measurements about key elements

        buttonOffset = popover.$button.offset();
        buttonWidth = popover.$button.outerWidth();
        buttonHeight = popover.$button.outerHeight();

        popoverWidth = popover.$popover.outerWidth() + (PADDING / 2);
        popoverHeightActual = popover.$popover.outerHeight(); // For inline positioning we want the actual height of the popover
        popoverHeightWithPadding = popoverHeightActual + (PADDING / 2); // Above and below the button we want to account for padding, but only half of it because the button already has some visual padding built in

        windowWidth = window.innerWidth;

        // Get the positioning values for the requested location
        // Hint: this is the "main" operation of this function and a good place to start for debugging. Most of the real work is done in `__determinePosition()`.
        position = __determinePosition(popover.config.location, position);

        // No position found (e.g. the location was invalid)
        if (position === null) {
            return false;
        }

        // Remove the margin that may have been added earlier in the page's lifecycle (e.g. before the window was resized)
        if (!addedRightMargin) {
            popover.$popover.get(0).style.removeProperty('margin-right');
        }

        // Apply user-specified offsets
        if (popover.config.display.offset) {
            if (popover.config.display.offset.top) {
                position.top += popover.config.display.offset.top;
            }

            if (popover.config.display.offset.left) {
                position.left += popover.config.display.offset.left;
            }
        }

        // Apply the positioning styles
        popover.$popover
            .css({
                left: position.left,
                top: position.top,
            });
    };

    ////////////
    // Events //
    ////////////

    // Handles clicks away from the popover
    priv.onBodyClick = function _onBodyClick (evt, popover) {
        var $target = $(evt.target);

        // Make sure the user didn't click in/on the toggle button, or on the popover itself
        if (evt.target !== popover.$button.get(0) && !$target.closest('.' + CLASSES.popover + ', .' + CLASSES.toggle).length) {
            if (popover.isShown) {
                priv.hidePopover(popover);
            }
        }
    };

    // Handles the window resize event
    priv.onWindowResize = function _onWindowResize (evt, popover) {
        if (popover.isShown) {
            if (popover.config.hideOnResize) {
                priv.hidePopover(popover);
            }
            else {
                priv.positionPopover(popover);
            }
        }
    };

    // Watches for the escape key to be pressed and hides any open popover with the relevant setting
    priv.onWindowKeyup = function _onWindowKeyup (evt, popover) {
        // Escape key was pressed
        if (popover.isShown && evt.keyCode === 27) {
            priv.hidePopover(popover);
        }
    };

    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    Popover.defaults = Popover.prototype.defaults;

    Popover.version = VERSION;

    // Define jQuery plugin
    window.$.fn.popover = function $_fn_popover (options) {
        return this.each(function $_fn_popover_each () {
            new Popover(this, options).init();
        });
    };

    window.$.popover = function $_popover (toggler, options) {
        return new Popover(toggler, options).init();
    };
});
