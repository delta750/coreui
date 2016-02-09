define(['jquery', 'cui'], function ($, cui) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '1.0.0';

    /////////////////
    // Constructor //
    /////////////////

    var SampleAdvanced = function (elem, options) {
        // Store the element upon which the component was called
        this.elem = elem;
        // Create a jQuery version of the element
        this.$elem = $(elem);
        // Store the options
        this.options = options;

        // This next line takes advantage of HTML5 data attributes
        // to support customization of the plugin on a per-element
        // basis. For example,
        // <div class='item' data-sample-options='{"message":"Goodbye World!"}'></div>
        this.metadata = this.$elem.data('sample-options');
    };

    //////////////////////
    // Plugin prototype //
    //////////////////////

    // This is where you define "public" functions and properties for the plugin. Most simple plugins won't have any besides `init`.

    SampleAdvanced.prototype = {};

    // Default user options
    SampleAdvanced.prototype.defaults = {};

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    SampleAdvanced.prototype.init = function () {
        // Introduce defaults that can be extended either
        // globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        // Example usage:
        // No options:
        //     $('#elem').sample();
        // Set options per instance:
        //     $('#elem').sample({ propName: 'value'});
        // or
        //     var p = new SampleAdvanced(document.getElementById('elem'), { propName: 'value'}).init()
        // or, set the global default message:
        //     SampleAdvanced.defaults.propName = 'value'


        // Your code begins here...


        // Return this instance of the plugin when you're finished
        return this;
    };

    /////////////////////
    // Private methods //
    /////////////////////


    // Write any "private" functions that you need here. This will likely contain the bulk of your code.


    //////////////////////////////////////////
    // Expose public properties and methods //
    //////////////////////////////////////////

    SampleAdvanced.defaults = SampleAdvanced.prototype.defaults;

    SampleAdvanced.version = VERSION;

    // Define jQuery plugin
    $.fn.menujs = function (options) {
        return this.each(function () {
            new SampleAdvanced(this, options).init();
        });
    };
});
