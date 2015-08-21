# Upgrading to the latest Core UI

After starting a project with Core UI, developers will need to manually add git connection back, to the Core UI repo to pull future updates.

To do this, create a new remote connect in a git command prompt by entering:

```
git remote add upstream https://github.com/ny/coreui.git
```

You will need access to the Core UI repository in order to download or view changes.

When a new release of Core UI has been push to its master branch, developers will need to fetch the master branch. To do this enter:

```
git fetch upstream
```

Fetching a repositories information will not cause any code to change.

Next it is recommend to to pull these changes into a separate working branch for testing purposes. Do this enter:

```
git checkout -b [test-branch-name]
```

Next merge in the upstream master to this branch.

```
git merge upstream/master [test-branch-name]
```

At this point the newest version of Core UI has is now in the test branch. This might cause some merge conflict that developers will need to handle locally.

Once the upstream has been merged, developer need to test their project. Once testing has finished, developers can follow normal project pull request procedures.
