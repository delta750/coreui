# Creating Components

A component should be used whenever a particular feature or function can be abstracted enough to live and work on its own. By default components are self-contained and should not need to many external dependencies. jQuery and the `cui.` namespace will likely cover most external dependencies.

*This documentation is meant for advanced developers who are already familiar with [using components](index.html) in Core UI.*

## Structure

Each component resides in its own folder under `/src/components/`. This folder follows a standardized structure that makes development simple and flexible.

### Simple example

Consider a component called "validator":

```
src/
    ├─ components/
        ├─  validator/
            ├─ images/
            ├─ js/
                ├─ validator.js
            ├─ scss/
                ├─ validator.scss
            ├─ component.json
            ├─ _settings.scss
```

Since this follows a standard naming structure (all files are named `validator`) the component will be compiled automatically by Grunt. This structure should be sufficient for most components.

The `component.json` file contains information about how the component should be built. You can find a [sample file and read about more configuration options](#component-json) below.

The `_settings.scss` file allows developers to customize your component's style. You should put any customizable styles (i.e. Sass variables) into this file that a developer may want to change.

Ideally, a developer should never have to change your `js/validator.js` or `scss/validator.scss` files to suit their needs &mdash; the component should be completely configurable by changing `component.json` and `_settings.scss` and should inherit the project's look and feel as much as possible.

## `component.json`

This file defines how your component will be built. By including the `component.json` file, developers have a few options they can customize.

If this file is not present the default options will be applied. Also, if the build process can find a `.js` or `.scss` file with the same name as the component folder it will be built as a lazy loadable component.

### Options

Option        | Data Type    | Description
--------------|--------------|-------------
**lazy**      | Boolean | Indicates that this component should be lazy-loadable or not. If `true`, separate `myComponent.js` and `myComponent.css` files will be generated and you will need to include them in your project manually. If `false`, the JS and CSS will be bundled with `cui.js`. *(Default: `true`)*
**name**      | String       | Overrides the component folder name with a developer-defined name. Please note this does not prevent or override other items with the same name. It also does not override the default concatenation of defined names when components have multiple asset types. For example, component called `alpha` the script would be defined as `alpha` but the stylesheet would still be defined as `alphaStyle`.
**assets**    | Array | Indicates the asset types the component should include when built. For example, if a component has styles that do not need to be included with the build you would set this to `["script"]` to ensure the styles (Sass file) are ignored.

Sample file:

```js
{
    "name": "myComponent",
    "lazy": true,
    "assets": ["script", "style"]
}
```

## JavaScript

When creating script files, be sure to use the proper RequireJS [AMD](https://en.wikipedia.org/wiki/Asynchronous_module_definition) ceremony.

Consider this example:

```js
define(['jquery', 'cui', 'css!styles'], function($, cui) {
    // Write your component script code here
});
```

This component is dependent on 3 other assets. The first two are `jquery` and the `cui` object. These two items match up with the arguments listed in its anonymous callback function found after the array. You may choose any variable names, but for the best practice is to reflect the standard way developers should be interacting with the dependencies (e.g. jQuery is accessed with `$()`).

Developers might also notice that the `css!styles` dependency is declared but is not accessible and does not have a defined argument. This is because the `css!` prefix identifies the asset as a stylesheet which is not applicable in a JavaScript function. Prefixes are discussed further in the next section.

### Loading different asset types

By default, declaring the name of file in `define()` implies that it is a JavaScript asset. However this is not always the case so Core UI has bundled 3 additional load and definable types:

Load Type | Description
--------- | -----------
css!      | Use when declaring `css` dependencies
json!     | Use when declaring `json` specific file. For this type, be sure to add `.json` to the name of the define
text!     | Use when loading any other type of text-based assets, including HTML, `.hbs` templates, etc. Also be sure to define the proper file extention with this item.

## Advanced example

TODO. A component with mulitple JS files, etc.