# Using Components

Components are standalone modules consisting of JavaScript and/or CSS. Each component is completely independent and may be bundled with the project's JS/CSS or loaded separately (e.g. based on some condition).

*This guide is for **implementing** a pre-made component in your project. For creating your own component, see the [authoring documentation](authoring.html)*

## Usage

Download the component you want to add to your project and place it in its either the `/src/cui/components/` or `src/project/components`. If the component is an official `cui` or Core UI component, place it in the `src/cui/components`. If the component is not officially supported or being developer internally, place it in the `src/projects/components` directory instead. It will be compiled automatically when you use [Grunt](../core/build-process.html).

A component's code may be included in two ways: bundled with `main.js` and/or `main.css`; or as separate `myComponent.js` and `myComponent.css` files which must be conditionally loaded. Components that you will use regularly on most pages should be bundled, while less frequently used components should be loaded conditionally.

## Conditional loading

Use `cui.load()` to load components:

```js
// Check for specific elements
if ($('.tooltip').length) {
    cui.load(['tooltip']); // Loads the tooltip component
}
```

The component will load asynchronously and then initialize itself when it's ready.

You can also load multiple components with a single call:

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

Because assets are managed by [RequireJS](http://requirejs.org) a given component will only load once even if you call `cui.load()` multiple times. Also, if a component has additional dependencies they will be loaded before your callback function is executed.

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

This file contains Sass variables that you may change to alter the component's styles.

