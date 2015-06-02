# Getting Started

1. Be sure you have [Grunt](http://gruntjs.com/) and [Node.js](http://nodejs.org/download/) installed. On Windows, also install a Bash shell such as the one that comes with [Git](http://git-scm.com/downloads).
1. Grab a copy of Core UI:
    1. [Fork Core UI](https://github.com/ny/coreui/fork) to create your own repository
    1. Alternatively, you may add Core to an existing project by [downloading the latest release](https://github.com/ny/coreui/archive/master.zip) and unzipping it to your folder or by running `git clone https://github.com/ny/coreui.git` from a command line
1. Add your project files to the `/src/project/` folder ([more details](project/index.html))
1. Open a command line and type `npm install` to install the necessary Node modules for building the project
1. At the command line type `grunt` to build the project

You will now have a `/dist/` folder which contains all of the CSS, JS, images, and fonts ready for deployment.

From here you may want to start [adding components](components/index.html) or dive into the other available [grunt tasks](build.html).