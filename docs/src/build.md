# Building Projects

Core UI uses [GruntJS](http://gruntjs.com/) to build source code into polished, deployable files. Grunt leverages [Node.js](http://nodejs.org/download/) modules to lint, minify, and compile your code.

Grunt can be run from a terminal or command prompt using one of the commands below. Just make sure you've navigated to your project folder (use `cd folder_name` to change directories).

## Commands

### `grunt`

This creates a simple, no-frills build in the `/dist/` folder that is ready for deployment. JavaScript will be linted and all code will be concatenated.

### `grunt dev`

This task is ideal for development. It will lint and compile your code just like `grunt`, however it will also include [source maps](http://www.html5rocks.com/en/tutorials/developertools/sourcemaps/) for easy debugging and start a simple web server at [localhost:8888](http://localhost:8888).

Grunt will continously watch your files for changes and automatically re-compile them. Press `Control+C` to stop this process and the server.

Before deploying you should run plain ol' `grunt` one more time to clean up the source maps and other debugging code.

### `grunt server`

This starts a simple web server at [localhost:8888](http://localhost:8888) so you can view your pages, test ajax requests, etc. It does not build anything, so you must have run `grunt` or `grunt dev` previously.