(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }

}(function ($) {

    // Plugin name, abstracted for single point of control
    var pluginName = "helloWorld";

    // Pluggin constructor
    var Plugin = function (elem, options) {

        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;

        // Get HTML 5 data-attribute options
        this.metadata = this.$elem.data('plugin-options');
    }

    // Plugin options and methods
    Plugin.prototype = {

        // Plugin default options
        defaults: {
            message: 'Hello World'
        },

        // Plugin initialization code
        init:  function() {

            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            // Call the default function that should be executed
            this.appendText();

            return this;
        },

        // Plugin method
        appendText: function() {

            this.$elem.addClass("helloText");

            this.$elem.append(document.createTextNode(this.config.message));
        }

    }

    // Create a short cut path to the default plugin definitions
    Plugin.defaults = Plugin.prototype.defaults;


    // Create the plugin in the jQuery namespace
    $.fn[pluginName] = function (options) {

        // Iterate of each plugin individually and create a new instance for each occurance.
        return this.each(function() {

            // Create an instance of the plugin for each specific element.
            new Plugin(this, options).init();

        });
    };

}));