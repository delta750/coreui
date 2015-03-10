# Project Structure

## Intro

- Everything goes in `/src/project/`
- Your project can be thought of as a layer on top of Core

### Overview

Your working directory is `/src/project/`. Keeping your files contained in this folder ensures that you will be able to update to future versions of Core UI quickly and easily.

```
repository/
    ├─ src/
        ├─ components/
        ├─ cui/
        ├─ project/
```

While it's up you how you structure files inside the `project` folder, it's recommended that you use this general approach:

```
repository/
    ├─ src/
        ├─ project/
            ├─ fonts/
            ├─ images/
            ├─ js/
            ├─ scss/
```

You may leave out any folders that you do not need.

## Styles

- Where to put them
    + Folder structure and naming patterns

```
repository/
    ├─ src/
        ├─ project/
            ├─ scss/
                ├─ _base/
                ├─ _settings.scss
                ├─ project.scss
```

## Scripts

- Where to put them
    + Folder structure and naming patterns
- Incorporating them
    + Grunt
    + Require

```
repository/
    ├─ src/
        ├─ project/
            ├─ js/
                ├─ project.js
```


## Components

- When to create a project-level component versus when to augment a Core component
    + When to consider proposing your component "graduate" into a Core component
    + See our [contribution guidelines](../contributing.html)
- Where to put them
    + Folder structure and naming patterns
