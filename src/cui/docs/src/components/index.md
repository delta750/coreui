# Using Components

Components are standalone modules consisting of JavaScript and/or CSS. Each component is completely independent and may be bundled with the project's JS/CSS or loaded separately (e.g. based on some condition).

*This guide is for **implementing** a pre-made component in your project. For creating your own component, see the [simple tutorial documentation](tutorial.html). You may also wish to view the repository of [example components](https://github.com/nyfrg/coreui-sample-components) as a reference.*

## Usage

Download the component you want to add to your project and place it in its either the `/src/cui/components/` or `src/project/components`. If the component is an official `cui` or Core UI component, place it in the `src/cui/components`. If the component is not officially supported or being developer internally to your project, place it in the `src/projects/components` directory instead. It will be compiled automatically when you use [Grunt](../core/build-process.html).

A component's code may be included in two ways: bundled with `main.js` and/or `main.css`; or as separate `myComponent.js` and `myComponent.css` files which must be conditionally loaded. Components that you will use regularly on most pages should be bundled, while less frequently used components should be loaded conditionally.

## Conditional loading

There are a few different way to load components conditional. If a page is going to include and need a lazy loadable component right from the start, try including it as part of a in page `require` script.

```js
require(['component', 'domReady!'], function(c) {

    // Page code

});
```
Or, components can be lazy loaded based on dynamic in page checks like by using `cui.load()` to load components:

```js
// Check for specific elements
require(['domReady!'], function(c) {

    // Check to see if a tool tip exists before loading it!
    if ($('.tooltip').length) {

        // Load it!
        cui.load(['tooltip'],function() {

            // Initialize tooltips
            $('.tooltip').tooltip();
        });
    }
}
```

In the above example a instance of the tooltip plugin was found so it was load. The developer then simply inited the tooltips functionality based on tooltips component specification.

`cui.load` can also be used to load many files all at once.

```js
cui.load(['tooltip', 'validator']);
```

If you need to interact with a component (for example, a component that doesn't do anything automatically), pass a callback function to `cui.load()`:

```js
cui.load(['validator'], function() {
    console.info('Validator has loaded!');
    // Your code here
});
```

Because assets are managed by [RequireJS](http://requirejs.org) a given component will only load once even if you call multiple times via a `requirq`, `define`, or `cui.load()` request. Also, if a component has additional dependencies they will be loaded before your callback function is executed.

## Configuration

Inside a component's folder you will find two files that you may edit: `asset.json` and `_settings.scss`.

```
src/
    ├─ components/
        ├─  validator/
            ├─ images/
            ├─ js/
            ├─ scss/
            ├─ asset.json
            ├─ _settings.scss
```

### `asset.json`

This file defines how your component will be built. For more information on the different options, take a look at [authoring components](authoring.html) documentation.


### _settings.scss

This file contains Sass variables that you may change to alter the component's styles. For more information on Sass variables see [their documenation](http://sass-lang.com/guide) page.

