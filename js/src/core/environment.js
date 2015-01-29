/* ----------------------------------------
   .cui.environment
   ---------------------------------------- */
cui.environment = (function environment() {
    var IMAGE_PATHS = {
            core:       '../images/core/',
            components: '../../../../images/dist/components/',
            skin:       '../images/skin/',
            template:   '../images/template/'
        },
        SPACE = ' ',

        ////////////////////
        // Public methods //
        ////////////////////

        /**
         * Decodes a URL parameter string
         *
         * @param   {String}  string  Encoded URL component
         *
         * @return  {String}          The decoded URL component
         */
        _decodeURL = function _decodeURL(string) {
            return decodeURIComponent(string.replace(/\+/g, SPACE));
        },

        /**
         * Encodes a URL parameter string
         *
         * @param   {String}  string  Unencoded URL component
         *
         * @return  {String}          The encoded URL component
         */
        _encodeURL = function _encodeURL(string) {
            return encodeURIComponent(string).replace(/%20/g, '+');
        },

        /**
         * Gets the value for a given URL parameter
         *
         * @param   {String}  parameterName  Parameter to find
         * @param   {String}  url            URL (if not provided, the current URL will be used)
         *
         * @return  {String}                 The value of the parameter
         */
        _getQueryStringParameter = function _getQueryStringParameter(parameterName, url) {
            var index = 0,
                queryString = '',
                parameters = [],
                i = 0,
                tokens = [];

            url = url || self.location.href;

            index = url.indexOf('?');
            if (index > -1) {
                queryString = url.substring(index + 1);

                // Remove the hash if any
                index = queryString.indexOf('#');
                if (index > -1) {
                    queryString = url.substring(0, index);
                }

                parameters = queryString.split('&');
                i = parameters.length;

                while ((i -= 1) >= 0) {
                    tokens = parameters[i].split('=');
                    if (tokens.length >= 2) {
                        if (tokens[0] === parameterName) {
                            return _decodeURL(tokens[1]);
                        }
                    }
                }
            }

            return null;
        },

        /**
         * Returns the image path for a given category
         *
         * @param   {String}  category  Name of category
         *
         * @return  {String}            Relative path to images folder
         */
        _getImagesPath = function _getImagesPath(category) {
            return IMAGE_PATHS[category];
        };

    // reveal public API
    return {
        decodeURL: _decodeURL,
        encodeURL: _encodeURL,
        getImagesPath: _getImagesPath,
        getQueryStringParameter: _getQueryStringParameter
    };
}());
