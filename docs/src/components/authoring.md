# Components

A component should be used whenever a particular feature or function can be abstracted enough to live and work on its own. By default components are self-contained and should not need to many external dependencies. jQuery and the CUI namespace will likely cover most external dependencies.

## Usage

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

Since this follows a standard naming structure (all files are named `validator`) this component will be compiled automatically when you use Grunt. This structure should be sufficient for most components.

The `component.json` file contains information about how the component should be built. You can find a [sample file and read about more configuration options](#component-json).

The `_settings.scss` file defines...... ?

### Advanced example

TODO. A component with mulitple JS files, etc.

## `component.json`

This file defines how your component will be built.

### Options

- `name` (string)
    + The name of the component which should match the folder and JS/SCSS file names
- `lazy` (Boolean)
    + Whether or not the component will be lazy-loaded. If `true`, separate `myComponent.js` and `myComponent.css` files will be generated and you will need to include them in your project manually. If `false`, the JS and CSS will be bundled with `cui.js`.
- `assets` (array of string)
    + This should list the types of assets your component has (e.g. `script` and `style`).

### Installation

To install a component drop the component folder into the `src/components/` directory. Please note file system directories must all be different names. Simple adding a component (that is in the proper component strucutre) should be all that is needed to make the component to your project. Simply rebuild your project using the command `grunt` or `grunt dev` and the component should be included. If a component is a core part of your project (meaning the component is used heavely through-out the project in question) you may want to consider making the component part of your default `cui` bundle. To do this see the section below outlining component configs.

### Folder structure

Components should have a very specific folder structure. By default a component folder should look similar to:

```
[component_name]
   L images
   L js
      L [component_name].js
   L scss
      L [component_name].scss
   L component.json
   L _settings.scss
```

#### component.json

The `component.json` file is the components level setting file. If this file is not present, it is assumed that if the component is a lazyloadable component with no special settings. This means that if the build process can find a script or stylesheet file with the same name as the component folder, it will be added as a lazy loadable item.

By including the `component.json` file, developers have a few items they can customize. Please see the next section for all the current component.json options.

##### Component options

Option        | Data Type    | Description
--------------|--------------|-------------
**name**      | String       | Overrides the component folder name with a developer-defined name. Please note this does not prevent or override other items with the same name. It also does not override the default concatenation of defined names when components have multiple asset types. For example, component called `alpha` the script would be defined as `alpha` but the stylesheet would still be defined as `alphaStyle`.
**lazy**      | Boolean | Indicates that this component should be lazy loadable or not. Default if this option is missing is `true`
**assets**    | Array | Indicates the asset types the component should be looking for come build time. IE. If the component has styles that do not need to be included at build, then a value of `["script"] will ensure the styles (sass file) are ignored.

Sample file:

```js
{
    "name": "myComponent",
    "lazy": true,
    "assets": ["script", "style"]
}
```

### _settings.scss

This allows developers to customize the component's style. Component developers should include this file with any customizable styles (i.e. Sass variables) that apply to the component directly.

### How to create a custom component

When creating a component follow the defined structure above. Include only the folders and files that you need, also be sure to include the component.json file as its a best practice.

When creating script files, be sure to use the proper RequireJS AMD ceremony:

```js
define(['jquery', 'cui', 'css!styles'], function($, cui) {
    // Component script code.
});
```

In the above example, this component is defines itself and says its dependent on 3 other assets. The first being `jquery` and the second being the `cui` object. Note that these two items match up with the arguements listed in its anonymous function found after the array. In this particular example, we define jquery and it is made accessible to the component through the standard `$` shortcut. For the `cui` object the `cui` argument is its access point. In the case of this component these variable names could be anything, but for the sake of best practice, these arguments reflect the standard way developer should be interacting with both jQuery and cui.

Developers might also notice that the `css!styles` dependancy is declared but is not accessilbe or have a defined argument. This is because this simply flags the asset as a stylesheet depedancy. We dont provide an argument because the argument would not have any usable content in the end.

#### Loading different asset types.

By default, by declaring the name of file in a define statement, requireJS assumes that the item being defined is a JavaScript asset. This is not always the case. In-fact CUI has bundled 3 additional load and definable types. These are `css!`, `json!` and `text!`.

Load Types | Description
---------- | -----------
css!       | use when declaring `css` dependancies
json!      | use when declaring `json` specific file. For this type, be sure to add `.json` to the name of the define, if its not know to th standard build system
text!      | use when loading any other type of text base assets. Examples include `.html`, `.hbs`, etc. Also be sure to define the proper extention with this item.

### Bundling with your project

TODO:

- How to update the gruntfile to spit out the JS file (that's how we do it, right?)
- How to `@import` the Sass file in your `project.scss`
    + Do they need to use `@include` as well?

### Conditional loading

Once a page loads the components that load by default are only those included in the `cui` bundle. To load addtional components based on logic or existance of specific elements use the `cui.load()` function. Only lazy loadable components defined during the build time are currently avaliable. Below shows a simple example of `cui.load()` in use:

```js
// Check for specific element
if ($('.tooltip').length) {
    cui.load(['tooltip']); // Loads the tooltip component.
}
```

Based on the example above, as long as the `tooltip` component was part of the project `dist` folder when it was compiled, require should already know about the component and load it onto the page. Because requireJS is still managing our resources, even if the `tooltip` load is called multiple times throught out the script based on different conditions, it wil still ensure that it is only loaded once. Also if `tooltip` has additional dependancies, as long as those dependancies are also know to require a build tip, require will make sure all of the proper components are loaded into memory and will only execute the script once all those depedancies have been meet.
