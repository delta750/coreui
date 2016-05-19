# Modal

## Overview

The modal plugin displays HTML in an overlay on top of the current page. It can be triggered by clicking on an element or by calling the plugin directly. Once created, the modal can be displayed and hidden at will.

The plugin optionally provides an overlay "shield" between the page and the modal to prevent interaction with the page while the modal is displayed.

## Usage

The plugin must be provided with an options object.

### Opening

To open a modal when a button is clicked:

```js
$('.my-button').modal(options);
```

To open a modal programmatically, call it on the `window` object:

```js
var $myModal = $(window).modal(options);
```

### Closing

There are two ways to close a modal depending on whether you stored a reference to it.

With a stored reference, call `$myModal.close()`.

Without a stored reference, call `$('.my-button').modal().close()` where `.my-button` is an element that has a modal associated with it.

## Options

At minimum, the options must contain HTML to display:

```js
$('.my-button').modal({
    html: '<p>Hello world</p>'
});
```

For shorthand, if you only need to specify the HTML you can just pass a string:

```js
// Equivalent to the previous example
$('.my-button').modal('<p>Hello world</p>');
```

### Options

Property | Type | Description
--- | --- | ---
`html` | String | Contents to be displayed (required)
`display` | Object | Defines the display properties of the modal (see below)
`shield` | Object | Defines properties related to the overlay shield

### Display options

Property | Type | Description
--- | --- | ---
`width` | String | The width of the modal (must be a CSS-friendly value; default: `90%`)
`height` | String | The height of the modal (must be a CSS-friendly value; default: `75%`)
`id` | String | Optional ID to be added to the modal element
`className` | String | Optional class name(s) to be added to the modal element
`css` | Object | Optional inline CSS to be added to the modal element. Should be in a jQuery-ready format (e.g. `{color: 'red', maxWidth: '40%'}`).

### Shield options

Property | Type | Description
--- | --- | ---
`suppress` | Boolean | Prevents the shield from being rendered (default: `false`)
`opacity` | Number | Optional opacity for the shield element, between `0` (completely transparent) and `1` (completely opaque)
`className` | String | Optional class name(s) to add to the shield DOM element

## Example with default values

```js
$('.my-button').modal({
    html: '',
    display: {
        width: '90%',
        height: '75%',
        id: '',
        className: '',
        css: {}
    },
    shield: {
        suppress: false,
        opacity: 0.1,
        className: ''
    }
});
```

## Specifications

If a shield is rendered, clicking on the shield (outside of the modal) will close the modal and the shield.

Only one modal may be open at a time. If a modal is open when a second modal is triggered, the first modal is closed before opening the second modal.

The modal container has the class `.cui-modal`.

![](http://i.imgur.com/ryRnmRS.png)

![](http://i.imgur.com/05k01Hb.png)
