# Creating Components

A component should be used whenever a particular feature or function can be abstracted enough to live and work on its own. By default components are self-contained and should not need to many external dependencies. jQuery and the `cui.` namespace will likely cover most external dependencies.

*This documentation is meant for advanced developers who are already familiar with [using components](index.html) in Core UI.*

## Structure

Each component resides in one of two folders, `/src/cui/components/` or `src/project/components`. The component folders themselve may vary slightly, but the specific folder being used is significiantly different. Components included at the `cui` component folder are considered core components. These are components that are test and have been deemed to have functionality that benefits more than a single project. On the other hand project components are the most specific to the project at hand. Whenever a `cui` or core component folder is replicated in the `project` folder. The project folder version is the one the build process will default to. This allows developers to extend base components in a safe location and help develope additional functionality into a core component.

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

The `asset.json` file contains information about how the component should be built. You can find a [sample file and read about more configuration options](#asset-json) below.

The `_settings.scss` file allows developers to customize your component's style. You should put any customizable styles (i.e. Sass variables) into this file that a developer may want to change.

Ideally, a developer should never have to change your `js/validator.js` or `scss/validator.scss` files to suit their needs &mdash; the component should be completely configurable by changing `asset.json` and `_settings.scss` and should inherit the project's look and feel as much as possible.

## `asset.json`

This file defines how your component will be built. By including the `asset.json` file, developers have a few options they can customize.

If this file is not present the default options will be applied. Also, if the build process can find a `.js` or `.scss` file with the same name as the component folder it will be built as a lazy loadable component.

### Options

Option        | Data Type    | Description
--------------|--------------|-------------
**lazy**      | Boolean | Indicates that this component should be lazy-loadable or not. If `true`, separate `myComponent.js` and `myComponent.css` files will be generated and you will need to include them in your project manually. If `false`, the JS and CSS will be bundled with `cui.js`. *(Default: `true`)*
**name**      | String       | Overrides the component folder name with a developer-defined name. Please note this does not prevent or override other items with the same name. It also does not override the default concatenation of defined names when components have multiple asset types. For example, component called `alpha` the script would be defined as `alpha` but the stylesheet would still be defined as `alphaStyle`.
**sources**    | String/Array | Indicates the asset types the component should include when built. For example, if a component does not include any styles, be setting the sources option to either `script` or `[`script`], will ensure the build manager only looks for script source files.

Sample file:

```js
{
    "name": "myComponent",
    "lazy": true,
    "sources": ["script", "style"]
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

Before attempting to build a new component form scratch or modifying an existing component, please try out the [simple component creation](tutorial.html) tutorial. It will go over it more fine detail the steps require to register, build and test components.