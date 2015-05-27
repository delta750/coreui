(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }

}(function ($) {

    var pluginName = "helloWorld";

    // Pluggin Constructor
    var Plugin = function (elem, options) {

        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;

        // Get HTML 5 data-attribute options
        this.metadata = this.$elem.data('plugin-options');
    }

    // Plugin Options and methods
    Plugin.prototype = {

        defaults: {
            message: 'Hello World'
        },
        init:  function() {

            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            // Call the default function that should be executed
            this.appendText();

            return this;
        },
        appendText: function() {

            console.log(this.config);

            this.$elem.append(document.createTextNode(this.config.message));
        }

    }

    Plugin.defaults = Plugin.prototype.defaults;


    // Create the plugin in the jQuery namespace
    $.fn[pluginName] = function (options) {

        return this.each(function() {

            // Create an instance of the plugin for each specific element.
            new Plugin(this, options).init();

        });
    };

}));