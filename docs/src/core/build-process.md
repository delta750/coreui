# Build Process

Core UI uses GruntJS to build all of the files needed to create robust sites and applications. Below are explanations to all of the different tasks found inside of the `Gruntfile.js`

## JSHint

JSHint is a JavaScript linting tool. By default all JavaScript files are linted with the exceptions for the js files stored in the `src/cui/js/vendor` folder. JSHint is run on both the production and development builds and will prevent the build process from continuing if any errors are found.

## Uglify

Uglify is a JavaScript minification tool. By default all compiled JavaScript files in Core UI or in the project folders are minified. This is to ensure proper serving asset files come production time. The only difference between a production and a development build is the addition of `sourcemap` files. Source map files should be auto discovered when developing in chrome and link developers directly to any errors that might exist in minified files.

### Dev CUI

This task handles the cui core vendor files. By default jQuery, RequireJS, domReady (require plugin), text (require plugin), json (require plugin) and css (require plugin) libraries are ignored as they are included in the default RequireJS build. The contents of the include and utility folder are also ignored because they are standard parts of the RequireJS core build. Please see the RequireJS section below for more information.

### Dev Components

This task handles all the development components minification. By default all components are minified and saved in the `dist/js/components` directory. The flatten tag is used as all component files should be served from a single directory.

### Prod CUI

This task handles all the production copy of all cui core vendor files. The same files are ignored as in the development build. The only difference is the production build removed all occurrences of the console.log if it exists in any script files. Sourcemaps are not generated.

### Prod Components

Matches the development components task. Only exception is the removal of any console.log commands found in script files and the exclusion of sourcemap file creation.

## Sass

The sass task simply handles the conversion of all `scss` files to `css` files. Depending on the file specifically the location of the file is different.

### Dev

This sass task handles the development build of the cui and project `scss` files. These files will be generated and stored in `dist/css/cui/cui.css` and `dist/css/project/project.css` respectfully. The difference between the two is the project.css file includes all the contents of the cui.css file. This means developers should only include one or the other.

### Dev Component

This sass task handles the component development style builds. Per core-ui standards, all component files should be stored in a `src/project/scss` folder and be named accordingly. These files are only needed for components that are going to be lazy loaded. If you component is not lazy loaded, simply remove this scss file and the build tool will not generate any special component styles. If a project wishes to include component styles as part of its core stylesheet, be sure it import the component stylesheet at the bottom of the `project.scss` file.
