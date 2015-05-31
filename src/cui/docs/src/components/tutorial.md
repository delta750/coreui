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
    var pluginName = "helloWorld";
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
    }
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
    }
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

#### Lets try to use some options

Inside our test page, just under the `h2` reference lets add a paragraph tag and use a class to test the component.

```html
<p class="helloWorld"></p>

```

Next, back in the script tag under the id test selector, add a new jQuery selector using the newly create `.helloWorld` class. But, this time we will pass in an options object overrideing the message text to be `Hello Class Element!`.

```js
// Class Test
$('.helloWorld').helloWorld({message: "Hello Class Element!"});
```

Once finished, rebuild the project and refreash the test page. This time two hello messages should appear, one saying "Hello World", the other saying "Hello Class Element!"

#### Trying html options.

For a final test of the component, we need to try passing in options via the html `data-` attribute. To begin, under the element test, add an unordered list and a handful of list items. On each of the list items create a data attribute similar to the example below:

```html
<ul>
    <li data-plugin-options='{"message":"Hello Item 1!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 2!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 3!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 4!"}'></li>
    <li data-plugin-options='{"message":"Hello Item 5!"}'></li>
</ul>

```

Next, lets alter the page script one last time. This time using a jQuery selector that selects all of the list items.

```js
$('ul li').helloWorld();

```

Rebuild the project and reload the test page again. The test page should now appear with the appended messages in the `h2`, `p` and in a different message in each `li` elements. The image below represents an example of what you should expect to see. For reference, here is the [complete `helloWorld.html` file](https://gist.github.com/JeffHerb/9a80f42c2fb81a87d6fb).

![Finished hello world component page](/docs/_includes/images/hello-world-done.png "Finished hello world component page")

## Adding SASS.

Start by creating a `scss` folder in the root of the `helloWorld` component. Inside this new folder, create a `helloWorld.scss` file and add the following contents:

```scss
$primary: blue;

.helloText {
    color: $primary;
}

```

Now we need to add a class hook in our HTML so these style get applied. To do this, modify the components `appendText` method in the `helloWorld.js` file to add a class to each element that it appends text too.

```js
appendText: function() {
    this.$elem.addClass('helloText');
}

```

Once finished, rebuild the project again and browse to the test page. The contents of the page should remain the same, but the color of all the appended text should have turned blue. The image below represents and example of how the test page should render. For your reference, a copy of the [updated `helloWorld.js`](https://gist.github.com/JeffHerb/7772ce8eb1bab095a49b) file and the [complete `helloWorld.scss` file](https://gist.github.com/JeffHerb/5fc2a41859b277136302).

![Finished hello world component page with styles](/docs/_includes/images/hello-world-done-blue.png "Finished hello world component page with styles")

## Making the component lazy loadable.

When building out a project, some of the functionality or style used in that project may only apply for a handful of circumstances. When this happens its best practices to not include these additional resources in your base assets (`main.js` and `main.css`). In stead they should be lazy loadable so they can be directly or conditionally loaded on pages that need them.

To make a component lazy loadable we need to creat a new component configuration file. In the root of our `helloWorld` component create a `asset.json` file. Inside it add the following contents:

```json
{
    "lazy": true
}

```

With this single file in place, simply rebuilding the project will recreate the base assets and list `helloWorld` component as being lazy loadable. But, before it can be considered the conversion complete, one more change has to be made, and that is to make the component styles a dependancy of the component itself. Lazy loadable components and there asset types (script, styles, etc...) are not auto bundled together on purpose. To give developers the maximum amount of control possible, developers must specifiy in all of the required dependancies. Now to add back the styles, lets change the `helloWorld.js` file. In the AMD define statment we nedd to add one more item to the array and; `css!helloWorld-style`. Note that special `css!` command in fornt. This prefix to the component tells requireJS that the this specific dependancy is a style sheet and will change the load process during runtime.

```js
define(['jquery', 'css!helloWorld-style'], factory);

```
### Trying it out with conditional lazy loading.

Now rebuilding the project and refreash the test page should cause the page to render simliar to our prior examples. The only diffrence this time is the in page code will make additional `http` request on launch to get the component `helloWorld` assets. But, lets try to load this resource conditionally. To do that, lets create a second test page in the components `tests` folder. Lets call this one `helloWolrd-lazy.html` and bootstrap it with the same `base-test.html`. The only difference here is we will add a few different elements to the page. The script section has also changed so that is is going to attempt to find specific elements and load them only if them using the `cui.load` function if elments are found.

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

        <p class="conditional"></p>
        <p class="conditional"></p>
        <p class="conditional"></p>

        <script id="require" src="../../js/main.js"></script>
        <script>

            // Wait for the page to be ready
            require(['domReady!'], function() {

                // Poll the page for specific elements with specific classes
                var conditionalElem = $('.conditional-true');

                // Check to see if the page has any elements with our specific class.
                if (conditionalElem.length >= 1) {

                    // We have elements, so using the cui namespace load the helloWorld Component
                    cui.load('helloWorld', function() {

                        // Kick of the helloWorldPlugin
                        conditionalElem.helloWorld();
                    });
                }

            });
        </script>
    </body>
</html>

```

When you build the project and run the above test page, nothing should happen. Now go back and change one of the elements `conditional` classes to be `conditional-true`. When you reload the page this time, the script tag should find a conditional element that meets our requirements and the `cui.load` process will request the helloWorld resources. For your reference, here is a complete of the [helloWorld-lazy.html test page](https://gist.github.com/JeffHerb/aa9d25c9b615093fb324).

