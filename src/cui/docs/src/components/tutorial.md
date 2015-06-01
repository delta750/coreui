# Creating a component in Core UI

Components in Core UI are structured in a standardized way. This helps to your project maintain separation between each moving part and ensures that testing is simplified and consistent.

Here we will create a Hello World component which will append a simple text message to an element. It will also want to provide developers the option of overriding the default settings, either at the time of execution or by embedding the settings in a `data-` attribute.

## Prerequisites

Be sure to have the following:

- An up-to-date copy of [Core UI](https://github.com/ny/coreui)
- [Node JS](https://nodejs.org/) (version 0.10 is recommended; newer versions are not yet supported)

## Adding JavaScript

Create a folder called `hello-world` to the `src/project/components` folder. If you dont have a `components` folder go ahead and create one.

Next, inside of the `helloWorld` folder, create two more folders, `js` and `tests`. The former will contain the actual script while the latter will be used for automated testing of the component.

You should have the following structure:

```
helloWorld/
    ├─ js/
    ├─ tests/
```

Let's flesh out the actual component code. Create a file called `helloWorld.js` in the `js` folder and add the following boilerplate.

```js
// File: src/project/components/js/helloWorld/helloWorld.js

(function (factory) {
    if (typeof define === 'function' && define.amd) {
        // Register as an anonymous module (AMD)
        define(['jquery'], factory);
    }
    else {
        // Browser globals
        factory(jQuery);
    }
}(function ($) {

    // Component code

}));
```

This allows the component to be defined as an [asynchronous module](https://en.wikipedia.org/wiki/Asynchronous_module_definition). All Core UI components are defined this way as it make the components modular in nature. Core UI use the AMD specification because it was written with the web in mind and is the preferred structure for [RequireJS](http://requirejs.org) modules.

Now we can write the actual code for our component. There are many ways to [structure jQuery plugins](https://github.com/jquery-boilerplate/jquery-patterns). Here we will use a [highly configurable, mutable](https://github.com/jquery-boilerplate/jquery-patterns/blob/master/patterns/jquery.highly-configurable.plugin.boilerplate.js) plugin pattern, but of course when authoring your own components you may choose a more suitable pattern.

Start by defining the plugin's name under the `Component code` comment:

```js
    // Plugin name, abstracted for single point of control
    var pluginName = 'helloWorld';
```

This lets us abstract the name from the rest of our code to keep it portable. Note that we are not creating a global variable because we're inside a an anonymous function wrapper.

Next, below the name, add the constructor:

```js
    // Plugin constructor
    var HelloWorld = function (elem, options) {
        this.elem = elem;
        this.$elem = $(elem);
        this.options = options;

        // Look for additional options in the element's data attribute
        this.metadata = this.$elem.data('helloworld-options');
    };
```

The contructor is pretty barebones &mdash; essentially it gathers and stores the element and any options that were passed.

Next we build the constructor's prototype object which will contain its public properties and methods. Add the following below the constructor:

```js
    // Plugin options and methods
    HelloWorld.prototype = {
        // Default options
        defaults: {
            message: 'Hello World'
        },

        // Initialization code
        init: function () {
            this.config = $.extend({}, this.defaults, this.options, this.metadata);

            // Call the default function that should be executed
            this.appendText();

            return this;
        },

        // Example method
        appendText: function() {
            this.$elem.append(document.createTextNode(this.config.message));
        }
    };
```

Now we have some default options (`message`), an `init` function which we'll come back to later, and the "main" function of this example, `appendText`.

Since the `prototype` properties are public and may be overwritten, we'll store a copy of our default settings in a "private" property:

```js
    // Copy the default plugin definitions
    HelloWorld.defaults = HelloWorld.prototype.defaults;
```

Finally, we need to register the plugin with jQuery. By leveraging its `$.fn` method we can make our plugin chainable so it behaves like any other jQuery function.

```js
    // Create the plugin in the jQuery namespace
    $.fn[pluginName] = function (options) {
        // Iterate of each plugin individually and create a new instance for each occurance
        return this.each(function () {
            // Create an instance of the plugin for each individual element
            new HelloWorld(this, options).init();
        });
    };
```

And now the plugin is ready. For reference, here is the [complete `helloWorld.js` file](https://gist.github.com/patik/4943ee297b0b75d23409).

### Try it

To try out the component we can create a short HTML file. Let's put it in the `tests` folder so we can reuse the file for testing later. Create the file `src/project/components/helloWorld/tests/helloWorld.html` and add the following:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Hello World Test</title>
        <link href="../../css/main.css" rel="stylesheet" type="text/css" media="all">
        <!--[if lt IE 9]><script src="../js/components/html5shiv.js"></script><![endif]-->
    </head>
    <body>
        <h2 id="helloWorld"></h2>

        <script id="require" src="../../js/main.js"></script>
        <script>
            require(['helloWorld', 'domReady!'], function() {
                // ID test
                $('#helloWorld').helloWorld();
            });
        </script>
    </body>
</html>
```

Open the page in a browser and you should see "Hello World!" printed in large letters. If you only see a blank page, make sure you've [built the project](../getting-started.html) at least once. When the page loads, the words "Hello World" should appear at the top of the page.

#### JavaScript settings

Inside the test page, just under the `h2` element add a paragraph tag and use a `class` as the script hook for the `helloWorld` component.

```html
<p class="helloWorld"></p>
```

Next, back in the script tag under the ID test selector, add a new jQuery selector using the newly create `.helloWorld` class. But this time pass an object that overrides the message text with `Hello Class Element!`.

```js
// Class Test
$('.helloWorld').helloWorld({message: 'Hello Class Element!'});
```

Rebuild the project and refresh the test page. This time two hello messages appear: one saying "Hello World", the other saying "Hello Class Element!"

#### HTML settings

For a final test of the component, try passing the options using the `data-` attribute. Below the other test elements, add an unordered list and a handful of list items. On each of the list items create a `data-` attribute similar to the example below:

```html
<ul>
    <li data-helloworld-options='{"message":"Hello Item 1!"}'></li>
    <li data-helloworld-options='{"message":"Hello Item 2!"}'></li>
    <li data-helloworld-options='{"message":"Hello Item 3!"}'></li>
    <li data-helloworld-options='{"message":"Hello Item 4!"}'></li>
    <li data-helloworld-options='{"message":"Hello Item 5!"}'></li>
</ul>
```

Next, let's alter the page script one last time. This time using a jQuery selector that selects all of the list items using an element selector.

```js
// HTML test
$('li').helloWorld();
```

Rebuild the project and reload the test page again. You should see three different sets of customized messages in the `h2`, `p`, and `li` elements:

![Finished hello world component page](/docs/_includes/images/hello-world-done.png "Finished hello world component page")

For reference, here is the [complete `helloWorld.html` file](https://gist.github.com/JeffHerb/9a80f42c2fb81a87d6fb).

## Adding Sass

Start by creating a `scss` folder alongside the `js` and `tests` folders. Inside, create a `helloWorld.scss` file and add the following:

```scss
$primary: blue;

.helloText {
    color: $primary;
}
```

Now we need to add a class hook in our HTML so the style will get applied. Modify the `appendText` method in the `helloWorld.js` file to add a class to each element that it appends text too.

```js
appendText: function() {
    this.$elem.addClass('helloText');
}
```

Rebuild the project again and refresh the test page. The contents of the page should remain the same, but the color of all the appended text should have turned `blue`:

![Finished hello world component page with styles](/docs/_includes/images/hello-world-done-blue.png "Finished hello world component page with styles")

For your reference, here is the [updated `helloWorld.js`](https://gist.github.com/JeffHerb/7772ce8eb1bab095a49b) file and the [complete `helloWorld.scss` file](https://gist.github.com/JeffHerb/5fc2a41859b277136302).

## Lazy loading

Sometimes a component is only needed under certain circumstances. It's best practices not to include those additional resources in your base assets (`main.js` and `main.css`). Instead they should be lazy loaded so they only download when necessary. (This is not to be confused with [#conditional-loading](conditional loading) which is covered later.)

To make a component lazy-loadable it needs a configuration file. In the root of the `helloWorld` component create a file called `asset.json` and add the following:

```json
{
    "lazy": true
}
```

Now when you rebuild the project it will recreate the base assets separate from the `helloWorld` assets. But one more change has to be made if we want to include styles.

Lazy loaded components and their asset types (script, styles, etc) are not automatically bundled together by default. To give developers the maximum amount of control possible, developers must specify all of the dependencies a component might have when it is lazy loaded.

To add the styles you'll need to edit the `helloWorld.js` file. In the `define` statement add `css!helloWorld-style` to the dependency array.

```js
define(['jquery', 'css!helloWorld-style'], factory);
```

Note the special `css!` prefix &mdash; this tells Core UI that the dependency `helloWorld-style` is a style sheet and therefore it needs to be loaded in a different manner than other assets.

### Conditional lazy loading

In the lazy load example you may have noticed that the browser had to make additional `http` requests for each asset of the `helloWorld` component on *every* page load. We can avoid that by loading the assets conditionally.

The built in method `cui.load` can load components, for example:

```js
    cui.load('helloWorld', function() {
        // Kick of the helloWorldPlugin
        conditionalElem.helloWorld();
    });
```

To run this conditionally we can wrap an `if` statement around it. Suppose you only want the message to appear when the page contains a paragraph:

```js
    if ($('p').length > 0) {
        cui.load('helloWorld', function() {
            // Kick of the helloWorldPlugin
            conditionalElem.helloWorld();
        });
    }
```

To try this, create a second test page in the component's `tests` folder called `helloWorld-lazy.html` and add the following:

```html
<!doctype html>
<html lang="en">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">
        <title>Hello World Conditional Test</title>
        <link href="../../css/main.css" rel="stylesheet" type="text/css" media="all">
        <!--[if lt IE 9]><script src="../js/components/html5shiv.js"></script><![endif]-->
    </head>
    <body>

        <!-- <p></p> -->

        <script id="require" src="../../js/main.js"></script>
        <script>

            // Wait for the page to be ready
            require(['domReady!'], function() {

                // Query the page for specific elements with specific classes
                var $paragraphs = $('p');

                // Check to see if the page has any paragraphs
                if ($paragraphs.length > 0) {

                    // We have elements, so using the `cui` namespace load the helloWorld Component
                    cui.load('helloWorld', function() {

                        // Call the helloWorldPlugin
                        $paragraphs.helloWorld();
                    });
                }

            });

        </script>
    </body>
</html>
```

Launch the page and notice that no "Hello world!" message appears. If you open your browser's developer tools and watch the network tab you'll notice that the helloWorld assets are never loaded.

Now edit the file to uncomment the `<p>` element and refresh the page. This time, the script tag finds a conditional element that meets our requirement and the `cui.load` process requests the helloWorld assets.

For reference, here is a complete of the [helloWorld-lazy.html test page](https://gist.github.com/JeffHerb/aa9d25c9b615093fb324).

