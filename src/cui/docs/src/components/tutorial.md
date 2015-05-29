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

This allows the component to be defined as an [asynchronous module](https://en.wikipedia.org/wiki/Asynchronous_module_definition). All Core UI components are defined this way ***(...because why? lazyloading, and what else?)***

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

And now the plugin is ready. For reference, here is the [complete `helloWorld.js` file](And now the plugin is ready. For reference, here is the [complete `helloWorld.js` file]https://gist.github.com/patik/4943ee297b0b75d23409).

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

Open the page in a browser and you should see "Hello World!" printed in large letters. If you only see a blank page, make sure you've [built the project](../getting-started.html) at least once.

## Testing

Now to test our new component and jQuery plugin, we should generate a test page. It is recommended that all components have a test page that accompanys them. A component can have as many test files as needed and they should all be specified in the `tests` folder right inside of the component directory. To get started create a `index.html` file inside our components `tests` directory. But, when we create this test, we could really be testing using the compiled CUI resources. To bootstrap your test page, take a copy of the base test template file from `src/cui/templates/base-test.html`. This template will take care of all your pathing issues as long as your test pages are inside of the component tests folder. Once copied, add the following code to the body section of the HTML right before the Core UI (`main.js`) script tag.

```html
<!-- File: src/project/components/helloWorld/tests/helloWorld.html -->

<!-- Template start omitted -->

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

<!-- Template end omitted -->
```

Next we need to create a new script section just underneth the `main.js`. This is where we will start using our newly created plugin, but first we need to use require to load it and its dependancies. To do this start by adding the following:

```html
<!-- File: src/project/components/helloWorld/tests/helloWorld.html -->

<!-- Template start omitted -->

<script>

    require(['helloWorld', 'domReady!'], function() {

        // Setup the id (h2)
        $('#helloWorld').helloWorld();

        // Setup the classe (p)
        $('.helloWorld').helloWorld({message: "Hello Classe Element!"});

        // Setup the element selctors (ul li's)
        $('ul li').helloWorld();

    });

</script>

<!-- Template end omitted -->
```

Since we are using requireJS we will need build our in page script to match the syntax preferred by requireJS. In order to test our component, we all need to call it and we want to only execute it once we know the page is ready. To meet these dependancy requirements we simple need to list `helloWorld` and `domReady!`. The name of our component has defaulted to the name of our component directory since we didnt specify a specific name. The `domReady!` functionality is a requireJS plugin that has been prebaked into Core UI from the start and is the recommended method for waiting for the page to be ready before executing code. You may have notices, we didnt list jQuery specifically. This is because jQuery is already a dependancy of the `helloWorld` component and requireJS will make sure its include for us before executing any of the code below.

Now that you have all of these im place, it a great time to test your newely create component. To do this in a node command prompt or terminal, move to the project directory and execute the command `grunt dev`. This will actively build your project and start a test web server. Once you see the `Waiting ... ` in the command propmt, simple visit your new test server in any browser at [http://localhost:8888/dist/test/helloWorld](http://localhost:8888/dist/test/helloWorld). You should see something similar to the image below.

![Finished hello world component page](/docs/_includes/images/hello-world-done.png "Finished hello world component page")

## Adding in some style.

This is a great first start, but it would be nice to include some styles as well. So first, we need to make a slight change to the existing `helloWorld.js` file to add classes to the elements we add text too. This will allow use to create special styles that can override the base Core UI styles. To do this lets add one more step to the appendText method of our component.

```js
// File: src/project/components/js/helloWorld/helloWorld.js

// beggining of file omitted

appendText: function() {
    this.$elem.addClass("helloText");

}

// end of file omitted

```

Next we need to create the component styles we want to add based off the additional style classe. To do this, we need to add a folder for our component project called `scss`. Inside of this folder create a file called helloWorld.scss and add the following contents.

```scss
// File: src/project/components/js/helloWorld/helloWorld.js

$primary: blue;

.helloText {
    color: $primary;
}
```
Now lets test these changes. If you are still running the old `grunt dev` task, kill it via `ctrl+c` and then start another `grunt-dev` task. If you still have the old browser open, simply refresh the [page](http://localhost:8888/dist/test/helloWorld).

![Finished hello world component page with styles](/docs/_includes/images/hello-world-done-blue.png "Finished hello world component page with styles")

## Lets load this conditionally

So now that we have this component all setup; lets make it conditionally loadable. This is pretty simple actually. First we need to make a component `asset.json` config file. This will allow component developers and consumers to control its loading method. To do this in the root of your component folder create the `asset.json` and set its contents to be:

```json
// File: src/project/components/js/helloWorld/asset.json

{
    "lazy": true
}
```

At this point, if you rebuild the project with another `grunt dev` command, the project will build correctly, but the text will no longer have any styles. This is because we switched the component from a included state to an external lazy loadable state. This means that all dependancies have to be declared that are to be loaded seperately. To fix this style bug we need to make a small change to the UMD definition portion of the plugin. In the very top of the plugin we have to add the component stylesheet rules. To do this simply add `css!helloWorld-style` to the AMD define part of the UMD header of the component JavaScript file. It should look like this.

```js
// File: src/project/components/js/helloWorld/helloWorld.js

(function (factory) {

    if (typeof define === 'function' && define.amd) {
        // AMD. Register as an anonymous module.
        define(['jquery', 'css!helloWorld-style'], factory);
    } else {
        // Browser globals
        factory(jQuery);
    }

}(function ($) {

    // Plugin code will go here.

}));
```

One of the big advantages of using Core UI is that it will do to the best of its ability concatinate and minify similar resources down to into a single http requests per asset type. When we build the included verson of component stylesheets it was bundled with the Core UI `main.css`. Now that it is marked as a lazy loaded component, we need to declare this dependancey.

You might have also noticed that a special prefix (`css!`) is added in front of the new dependancy. This is because requireJS by default does not support loading of anything other than Javascript files. But when you use Core UI we have baked in all the additional functionality needed to lazy load stylesheet (`css!`), JSON dataset (`json!`) and text (`text!`) based contents like Handlebars templates. You might have also notices, that although we added a an additional dependancy to the definition the `factory` function still only hase the `$` in the function argument. This is because script styles provide no useable return to the function, so it is safe to omit the argument.

At this point you should have a fully working lazy loadable component. If you wanted to toggle this componenet back, simple remove the style dependancy from the AMD define section and in the `asset.json` file switch the `lazy` property value to `false`.

