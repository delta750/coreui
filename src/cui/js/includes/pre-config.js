var scripts = document.getElementById('require'),
    src = scripts.src,
    baseUrl = src.substring(src.indexOf(document.location.pathname), src.lastIndexOf('/cui'));
