# Upgrading Core UI

## Automatic updates

*These instructions apply if you started your project by forking or cloning the Core UI repository.*

### Setup

If you add a connection back to the Core UI repository with git you can pull in updates automatically.

Open a command prompt and `cd` to your project directory. Create a new remote connect by entering the following:

```
git remote add upstream https://github.com/ny/coreui.git
```

This step only needs to be followed once per project and per developer.

### Applying an update

When a new release of Core UI is available you can get the update by fetching the master branch. To do this, enter:

```
git fetch upstream
```

Note that we are merely fetching the repository's information so it will not cause any code to change in your project yet.

It is recommended that you pull the changes into a separate branch so you can test the update before applying it to your project. Enter the following (you may change the branch name):

```
git checkout -b coreui-update
```

Now merge in the upstream branch from Core UI to your test branch:

```
git merge upstream/master coreui-update
```

At this point the newest version of Core UI is in your test branch. This might cause some merge conflicts that you will need to handle.

Once the upstream has been merged, you will need to test your project. Then you can follow your project's usual pull request procedure to merge the test branch into your master branch.

## Manual updates

If you started your project by download a zip file of Core UI, or you added Core UI to an existing project, you will need to apply the update manually. However since all of your files are in the `/src/project/` folder upgrading is usually easy.

1. Download and unzip the [latest release](https://github.com/ny/coreui/archive/master.zip)
    - You can also download [specific releases](https://github.com/ny/coreui/releases)
1. Navigate to the `/src/` folder and delete the `cui` folder.
1. Put the newly-downloaded copy of the `cui` folder into `/src/`. (You don't need to touch your `project` folder.)
1. On the command line, run `npm install` to make sure you have the latest Node modules for the release.