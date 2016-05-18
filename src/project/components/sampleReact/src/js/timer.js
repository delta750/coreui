define(['jquery', 'cui', 'react', 'reactdom', 'App'], function ($, cui, React, ReactDOM, App) {
    var start = new Date();
    var MyTimer = React.createFactory(App);

    // Mount the JSX component in the app container
    ReactDOM.render(
        MyTimer({start: start}),
        document.getElementById('main')
    );
});
