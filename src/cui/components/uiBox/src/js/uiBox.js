define(['jquery', 'cui', 'guid', 'journal','css!uiBox'], function ($, cui, guid) {
    
    /////////////
    // Globals //
    /////////////
    var NAMESPACE = 'uiBox';

    var VERSION = '';
    var CLASSES = {
        uiBox: 'cui-' + NAMESPACE,
        
        uiBoxHeader: 'cui-' + NAMESPACE + '-header',
    
        uiBoxBody: 'cui-' + NAMESPACE + '-body',
    
        uiBoxFooter: 'cui-' + NAMESPACE + '-footer',
    };
    var SELECTORS = {};
    var EVENT_NAMES = {};
    var DEFAULTS = {};

    ////////////
    // Public //
    ////////////
    
    var UIBox = function (elem, options) { 
        // should never be an instance of node
        if (elem instanceof Node) {

            // Store the element upon which the component was called
            this.elem = elem;
            // Create a jQuery version of the element
            // this.$self = $(elem);

            this.$button = $(elem);

            // This next line takes advantage of HTML5 data attributes
            // to support customization of the plugin on a per-element
            // basis. For example,
            // <div class="item" data-uiBox-options="{'message':'Goodbye World!'}"></div>
            this.metadata = this.$button.data('uiBox-options');
        }
        else {
            this.metadata = {};

            this.$self = false;

            options = elem;
        }

        // Store the options
        this.options = options;
    };

    UIBox.prototype = {};

    UIBox.prototype.default = {
        id:null,
        css:null,
        class:null,
        html:null,
        header: null,
        body: null,
        footer: null,        
    };

    // Init function
    UIBox.prototype.init = function () {
        // Create the uiBox reference object
        var uiBox = this;

        // Extend the config options with the defaults
        if (typeof this.options === 'string') {
            uiBox.config = $.extend(true, {}, this.default);
            uiBox.config.html = this.options;
        }
        else {
            uiBox.config = $.extend(true, {}, this.default, this.options);
        }

        // Create a unique ID for the uiBox if one is not provided.
        if(!uiBox.config.id){
            uiBox.config.id = guid();
        }

        ///////////////////
        // BUILD WRAPPER //
        ///////////////////

        var uiBoxClasses = CLASSES.uiBox;
        if (uiBox.config.class && typeof uiBox.config.class === "string") {
            uiBoxClasses += " " + uiBox.config.class;
        }

        // Create the uiBox
        uiBox.$self = $('<div/>', {
                            'id': uiBox.config.id,
                            'class': uiBoxClasses,
                            'tabindex' : 1,
                        });

        if (uiBox.config.css) {
            uiBox.$self.css(uiBox.config.css);
        }

        ///////////////////////
        // BUILD SIMPLE HTML //
        ///////////////////////

        if(uiBox.config.html){
            uiBox.$self.append(uiBox.config.html);
        }        
     
        //////////////////
        // BUILD HEADER //
        //////////////////

        if(uiBox.config.header && uiBox.config.header.html){

            var uiBoxHeaderClasses = CLASSES.uiBoxHeader;
            if(uiBox.config.header && uiBox.config.header.class && typeof uiBox.config.header.class === "string"){
                uiBoxHeaderClasses += " " + uiBox.config.header.class;
            }

            uiBox.$header = $('<header/>', {
                                'class': uiBoxHeaderClasses
                            });
            
            uiBox.$header.append(uiBox.config.header.html);

            if (uiBox.config.header.css) {
                uiBox.$header.css(uiBox.config.header.css);
            }

            uiBox.$self.append(uiBox.$header);
        }

        ////////////////
        // BUILD BODY //
        ////////////////      
        
        if(uiBox.config.body && uiBox.config.body.html){

            var uiBoxBodyClasses = CLASSES.uiBoxBody;
            if(uiBox.config.body && uiBox.config.body.class && typeof uiBox.config.body.class === "string"){
                uiBoxBodyClasses += " " + uiBox.config.body.class;
            }
            
            uiBox.$body = $('<div/>', {
                                'class': uiBoxBodyClasses,
                            });
            
            uiBox.$body.append(uiBox.config.body.html);
        
            if (uiBox.config.body.css) {
                uiBox.$body.css(uiBox.config.body.css);
            }

            uiBox.$self.append(uiBox.$body);
        }              

        //////////////////
        // BUILD FOOTER //
        //////////////////

        if(uiBox.config.footer && uiBox.config.footer.html){

            var uiBoxFooterClasses = CLASSES.uiBoxFooter;
            if(uiBox.config.footer.class && typeof uiBox.config.footer.class === "string"){
                uiBoxFooterClasses += " " + uiBox.config.footer.class;
            }

            uiBox.$footer = $('<footer/>', {
                                'class' : uiBoxFooterClasses
                            });

            uiBox.$footer.append(uiBox.config.footer.html);

            if (uiBox.config.footer.css) {
                uiBox.$footer.css(uiBox.config.footer.css); 
            }

            uiBox.$self.append(uiBox.$footer);
        }
    
        // return the assembled uiBox
        return uiBox.$self;
    };

    // Set the version number
    UIBox.version = VERSION;

    // Define jQuery plugin with a source element
    $.fn.uiBox = function (options, elem) {
        return this.each(function () {
            return new UIBox(options).init();
        });
    };

    // Create from scratch.
    $.uiBox = function (options) {
        return new UIBox(options).init();
    };

});