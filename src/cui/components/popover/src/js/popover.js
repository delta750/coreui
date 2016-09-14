define(['jquery', 'cui', 'guid', 'uiBox', 'uiPosition'], function ($, cui, guid) {
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
        closeButton: 'cui-' + NAMESPACE + '-hide',
        // useArrow: 'cui-' + NAMESPACE + '-use-arrow',
        // arrow: 'cui-' + NAMESPACE + '-arrow',
    };

    var MOBILE_BREAKPOINT = 600;

    // var PADDING = 6;



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
        // useArrow:false,
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

        popover.onWindowScroll = function _popover_onWindowScroll (evt) {
            priv.onWindowScroll(evt, popover);
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

        $(window).off('scroll', popover.onWindowScroll);

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
        
        $(window).scroll(popover.onWindowScroll);

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
        $(window).off('scroll', popover.onWindowScroll);
    };

    // Create the popover container element
    priv.createPopover = function _createPopover (popover) {
        var boxOptions = [];

        boxOptions.className = CLASSES.popover + " " + popover.config.display.className;
        boxOptions.css = {'opacity':'0'};
        if(popover.config.display.css){
            $.extend(boxOptions.css, popover.config.display.css);  
        }

        popover.$close = $('<button/>', {
                                'class': CLASSES.closeButton,
                                'tabindex': '1',
                            })
                            .text('Close Popover')
                            .on('click', function (evt) {
                                evt.preventDefault();
                               priv.hidePopover(popover);
                            });

        boxOptions.html = popover.config.html;

        var $popoverBox = $.uiBox(boxOptions);

        $popoverBox.append(popover.$close);
        $popoverBox.appendTo(document.body);
        
        return $popoverBox;
    };

    // Function that will position the popover on the page using uiPosition
    priv.positionPopover = function _positionPopover (popover) {
        // if(popover.config.useArrow){
        //     priv.removeArrow(popover);
        //     priv.resetInnerContentHeight(popover);
        // }

        var popoverOffset = {};
        var popoverDefaultCSS = {};

        // Convert popover offset call into uiPosition config call
        if (popover.config.display.offset) {
            if (popover.config.display.offset.top) {
                popoverOffset.offsetY = popover.config.display.offset.top;
            }

            if (popover.config.display.offset.left) {
                popoverOffset.offsetX = popover.config.display.offset.left;
            }
        }

        if(popover.config.display && popover.config.display.css){
            popoverDefaultCSS = popover.config.display.css;
        }

        if(window.innerWidth > MOBILE_BREAKPOINT){
            
            //remove mobile class
            popover.$popover.removeClass('mobile-breakpoint');

            $(popover.$popover).uiPosition({
                positionType:popover.config.location, 
                respectTo:popover.$button, 
                offset:popoverOffset,
                defaultCSS:popoverDefaultCSS
            });   
            // if(popover.config.useArrow){
            //     priv.positionArrow(popover);
            //     priv.setInnerContentHeight(popover);
            // }
           
        }
        else{
            //add mobile class

            popover.$popover.addClass('mobile-breakpoint');

            $(popover.$popover).uiPosition({
                positionType:"center-center",
            });   

        }
        

    };

    // priv.positionArrow = function _positionArrow(popover){

    //     var arrowPosition = 'below';
    //     var adjustedTop;

    //     var arrowHeight = 7;

    //     var buttonOffset = popover.$button.offset();
    //     var buttonWidth = popover.$button.outerWidth();
    //     var buttonHeight = popover.$button.outerHeight();

    //     var buttonCenterX = buttonOffset.left + buttonWidth / 2;
    //     var buttonCenterY = buttonOffset.top + buttonHeight / 2;

    //     var popoverLeft = parseInt(popover.$popover.css('left'));
        
    //     var arrowLeft = buttonCenterX - popoverLeft;

    //     popover.$arrow = $('<div/>', {
    //                         'class': CLASSES.arrow,
    //                     });

    //     if(arrowPosition == 'above'){
    //         popover.$arrow.css({'left':arrowLeft});
    //         popover.$arrow.css({'bottom':"100%"});

    //         adjustedTop = parseInt(popover.$popover.css('top')) + arrowHeight;
    //         popover.$popover.css({'top': adjustedTop+'px'});
    //     }
    //     else if(arrowPosition == 'below'){
    //         popover.$arrow.css({'left':arrowLeft});
    //         popover.$arrow.css({'bottom': (2*-arrowHeight)+'px'});
    //         popover.$arrow.css({'border-color':'black transparent transparent transparent'});

    //         adjustedTop = parseInt(popover.$popover.css('top')) - arrowHeight;
    //         popover.$popover.css({'top': adjustedTop+'px'});
    //     }
    //     else if(arrowPosition == 'left'){
            
    //     }
    //     else if(arrowPosition == 'right'){

    //     }
    //     popover.$popover.append(popover.$arrow);

    //     var adjustedHeight = parseInt(popover.$popover.css('max-height')) - 5;
    //     popover.$popover.css({'max-height':adjustedHeight+'px'});
    // };

    // priv.removeArrow = function _removeArrow(popover){
    //     if(popover.$arrow){
    //         popover.$arrow.remove();
    //     }
    // };

    // priv.resetInnerContentHeight = function _resetInnerContentHeight(popover){       
    //     var popoverBody = popover.$popover.find('.cui-uiBox-body');
    //     popoverBody.css({'max-height':""});
    // };

    // priv.setInnerContentHeight = function _setInnerContentHeight(popover){       
    //     var popoverBody = popover.$popover.find('.cui-uiBox-body');

    //     var popoverHeight = popover.$popover.height();        
    //     popoverBody.css({'max-height':popoverHeight+"px"});
    // };

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

    priv.onWindowScroll = function _onWindowScroll(evt, popover){
        if (popover.isShown) {
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
