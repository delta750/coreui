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
    var defaults = {
        color: false,
        fontSize: false
    };

    // Plogin logic in a private variable
    function Plugin(element, options) {

        this.element = element;

        this.options = $.extend({}, defaults, options);

        this._defaults = defaults;
        this._name = pluginName;
    }


    // Create the plugin in the jQuery namespace
    $.fn[pluginName] = function (options) {

        return this.each(function (i) {

            var this = $(this);

            var text = "Hello World";

            this.append(text);

        });
    };

}));