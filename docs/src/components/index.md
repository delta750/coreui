# Using Components

Components are standalone modules consisting of JavaScript and/or CSS. Each component is completely independent and may be bundled with the project's JS/CSS or loaded separately (e.g. based on some condition).

*This guide is for **implementing** a pre-made component in your project. For creating your own component, see the [authoring documentation](authoring.html)*

## Usage

Download the component you want to add to your project and place it in its own folder under `/src/components/`. It will be compiled automatically when you use [Grunt](../core/build-process.html).

A component's code may be included in two ways: bundled with `cui.js` and/or `cui.css`; or as separate `myComponent.js` and `myComponent.css` files which must be conditionally loaded. Components that you will use regularly on most pages should be bundled, while less frequently used components should be loaded conditionally.

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

Inside a component's folder you will find two files that you may edit: `component.json` and `_settings.scss`.

```
src/
    ├─ components/
        ├─  validator/
            ├─ images/
            ├─ js/
            ├─ scss/
            ├─ component.json
            ├─ _settings.scss
```

### `component.json`

This file defines how your component will be built.

#### Options

Option        | Data Type    | Description
--------------|--------------|-------------
**lazy**      | Boolean | Indicates that this component should be lazy-loadable or not. If `true`, separate `myComponent.js` and `myComponent.css` files will be generated and you will need to include them in your project manually. If `false`, the JS and CSS will be bundled with `cui.js`. *(Default: `true`)*
**name**      | String       | Overrides the component folder name with a developer-defined name. Please note this does not prevent or override other items with the same name. It also does not override the default concatenation of defined names when components have multiple asset types. For example, component called `alpha` the script would be defined as `alpha` but the stylesheet would still be defined as `alphaStyle`.

### _settings.scss

This file contains Sass variables that you may change to alter the component's styles.

