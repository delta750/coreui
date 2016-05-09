define([], function () {
    // Private method namespace
    var priv = {};

    ///////////////////
    // Public method //
    ///////////////////

    var _guid = function _guid () {
        return priv.stringOf4RandChars();
    };

    /////////////////////
    // Private methods //
    /////////////////////

    priv.stringOf4RandChars = function _stringOf4RandChars () {
        return Math.floor((1 + Math.random()) * 0x10000).toString(16).substring(1);
    };

    /////////////////////
    // Expose publicly //
    /////////////////////

    return _guid;
});
