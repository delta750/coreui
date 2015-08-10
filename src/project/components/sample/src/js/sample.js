define(['jquery', 'cui', 'css!sample-style'], function ($, cui) {
    ///////////////
    // Constants //
    ///////////////

    var VERSION = '1.0.0';

    /////////////////
    // Constructor //
    /////////////////

    var Sample = function (elem, options) {
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

    Sample.prototype = {};

    // Default user options
    Sample.prototype.defaults = {};

    /**
     * Initializes the plugin
     * May be called multiple times
     */
    Sample.prototype.init = function () {
        // Introduce defaults that can be extended either
        // globally or using an object literal.
        this.config = $.extend({}, this.defaults, this.options, this.metadata);

        // Sample usage:
        // No options:
        //     $('#elem').sample();
        // Set options per instance:
        //     $('#elem').sample({ propName: 'value'});
        // or
        //     var p = new Sample(document.getElementById('elem'), { propName: 'value'}).init()
        // or, set the global default message:
        //     Sample.defaults.propName = 'value'


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

    Sample.defaults = Sample.prototype.defaults;

    Sample.version = VERSION;

    // Define jQuery plugin
    $.fn.menujs = function (options) {
        return this.each(function () {
            new Sample(this, options).init();
        });
    };
});