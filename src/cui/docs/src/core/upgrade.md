# Upgrading Core UI

## Forked projects

If you started your project by forking the Core UI repository, all you have to do is... (TODO: can you just pull from coreui/master into your own repo?)

## Standalone projects

Since all of your files are in the `/src/project/` folder, upgrading is easy.

1. Download and unzip the [latest release](https://github.com/ny/coreui/archive/master.zip)
    - You can also download [specific releases](https://github.com/ny/coreui/releases)
1. Replace everything in `/src/` except your `project` folder
    - It's recommended that you delete the `/dist/` folder to clear out any old files. All necessary files and folders will be recreated.
1. On the command line, run `npm install` to make sure you have the latest Node modules for the release
1. Use Grunt to build your project as usual