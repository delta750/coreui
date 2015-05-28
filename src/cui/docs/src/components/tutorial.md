# Creating your First Core UI Component

Sooner or later, every developer is going to run across the need of some form of functionality that is not already being provided. But to properly intergrate that component into Core UI could be alittle confusing. So, lets create a simple Hello World component. The purpose of this component is to append a simple text message to any valid jQuery selectable element that a developer could provide. We also want to provide the developers with a way to override the default jQuery setting to change the message out directly using a options provided during execution, or by options attached using the `data-` HTML 5 attributes on the elements.

Before we get started, make sure you have all of the following.

- A recently cloned copy of [Core UI](https://github.com/ny/coreui)
- A copy of Node JS (v0.10.38 and below, Do not use a more modern version)
- A simple text editor or other IDE environment.

To start the creation process, lets add a folder to your project called `hello-world` to your `src/project/components` folder. If you dont have this `components` folder go ahead and create this as well.

Next inside of the `helloWorld` folder, create the following directory structure:

```
helloWorld/
    ├─ js/
    ├─ test/
```

To start, lets flesh our the actual component code. Create the `helloWorld.js` file in the `js` folder; and add the following UMD ceremony boiler plate.

```js
// File: src/project/components/helloWorld/helloWorld.js

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }

}(function ($) {

    // Plugin code will go here.

}));
```

The above code simply does the check to see if the AMD definition was defined. If it can find it, it will register the component using the AMD define method. This code is a requirement and this particular ceremony is the recommended standard for all Core UI components. With the ceremony in place, we can now focus on the actual plugin code. Simply add the following code under the plugin comment.

```js
// File: src/project/components/helloWorld/helloWorld.js

// ... ceremoney start omitted ---

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

// ... ceremoney end omitted ---


```

Thats it! At this point you have create a very simple hello world component. Things to note, there are many different ways to create jQuery components, this tutorial is only going to show you one particular way. It is highly recommended that you do some research on what method to us based on the type of plugin/component being built.

Now to test our new component and jQuery plugin, we should generate a test page. It is recommended that all components have a test page that accompanys them. A component can have as many test files as needed and they should all be specified in the `tests` folder right inside of the component directory. To get started create a `index.html` file inside our components `test` directory. But when we create this test, we could really be testing using the compiled CUI resources. To bootstrap your test page, take a copy of the base template file from `src/cui/templates/base-test.html`. This template will take care of all your pathing issues as long as the test page is being created inside of the component test folder. Once copied, add the following code to the body section of the HTML right before the Core UI (`main.js`) script tag.

```html
<!-- ID based test -->
<h2 id="helloWorld">
</h2>

<!-- Class based test -->
<p class="helloWorld">
</p>

<!-- Element based test -->
<ul>
    <li data-plugin-options='{"message":"Hello Item 1!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 2!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 3!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 4!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 5!"}'></li>
</ul>

```
Next we need to create a new script section just underneth the `main.js`. This is where we will start using our newly created plugin, but first we need to use require to load it and its dependancies. To do this start by adding the following:

```html
<script>

    $(document).ready(function) {

        // Setup the id (h2)
        $('#helloWorld').helloWorld();

        // Setup the classe (p)
        $('.helloWorld').helloWorld({message: "Hello Classe Element!"});

        // Setup the element selctors (ul li's)
        $('ul li').helloWorld();

    });

</script>
```

By default we created a very simple module and because we didnt not declare it in any special why, the module was prebuilt and shipped inside of Core UI main.js. So in order to use this module we simply need to wait for the document to be ready and then we just need to call it. To test your plugin, open a terminal or command prompt window that has access to nodejs. Then simple travel to the project folder root and enter the command `grunt dev`. Once the terminal returns the status of `Waiting...` Simply go check you [test page](http://localhost:8888/dist/tests/helloWolrd/). You should see something similar to the image below.

![Finished hello world component page](/docs/_includes/images/hello-world-done.png "Finished hello world component page")