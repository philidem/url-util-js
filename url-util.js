var protocolChars = 'abcdefghijklmnopqrstuvwxyz0123456789+-.';
var validProtocolChars = {};

for ( var i = 0; i < protocolChars.length; i++) {
    validProtocolChars[protocolChars.charAt(i)] = true;
}

function _isValidProtocol(protocol) {
    for (var i = 0; i < protocol.length; i++) {
        /*
         * If we find an illegal character in the protocol then this is not
         * the protocol...
         */
        if (!validProtocolChars[protocol.charAt(i)]) {
            return false;
        }
    }

    return true;
}

/**
 * Parse the network location which will contain the host and possibly
 * the port.
 *
 * @param networkLocation
 *            the network location portion of URL being parsed
 */
function _parseNetworkLocation(networkLocation, obj) {
    var pos = networkLocation.indexOf(':');
    if (pos === -1) {
        obj.host = networkLocation;
    } else {
        obj.host = networkLocation.substring(0, pos);
        if (pos < (networkLocation.length - 1)) {
            obj.port = networkLocation.substring(pos + 1);
        }
    }
}

function _parseUrl(obj, url) {

    var pos;

    /*
     * parse the fragment (part after hash symbol) first according to
     * RFC
     */
    pos = url.indexOf('#');
    if (pos !== -1) {
        if ((pos + 1) < url.length) {
            obj.hash = url.substring(pos + 1);
        }

        /* continue parsing everything before the hash symbol */
        url = url.substring(0, pos);
    }

    /* parse the protocol according to RFC */
    pos = url.indexOf(':');
    if (pos !== -1) {
        /*
         * We found what might be the protocol but let's make sure it
         * doesn't contain any invalid characters..
         */
        var possibleProtocol = url.substring(0, pos).toLowerCase();
        
        if (_isValidProtocol(possibleProtocol)) {
            obj.protocol = possibleProtocol;
            pos++;

            if (pos === url.length) {
                /*
                 * reached the end of the string (input was something
                 * like "http:"
                 */
                return;
            }

            /* continue parsing everything past the protocol */
            url = url.substring(pos);
        }
    }

    if ((url.charAt(0) === '/') && (url.charAt(1) === '/')) {

        // URL will contain network location (i.e. <host>:<port>)

        /* find where the path part starts */
        pos = url.indexOf('/', 2);
        if (pos === -1) {
            /*
             * There is no path and there can't be a query according to
             * the RFC
             */
            if (url.length > 2) {
                _parseNetworkLocation(url.substring(2), obj);
            }
            return;
        } else {
            /*
             * there is a path so parse network location before the path
             */
            _parseNetworkLocation(url.substring(2, pos), obj);
            url = url.substring(pos);
        }
    }

    var protocol = obj.protocol;
    if (!protocol || (protocol === 'http') || (protocol === 'https')) {
        /*
         * Now parse the path and query string.. If there is no '?'
         * character then the remaining portion is just the path.
         */
        pos = url.indexOf('?');

        if (pos === -1) {
            obj.path = url;
        } else {
            obj.path = url.substring(0, pos);
            if ((pos + 1) < url.length) {
                obj._query = new Query(url.substring(pos + 1));
            }
        }
    } else {
        obj.path = url;
    }
}

function _parseQueryString(obj, queryStr) {
    var parameters = queryStr.split('&');

    var pos;
    for (var i = 0; i < parameters.length; i++) {
        var param = parameters[i];
        pos = param.indexOf('=');

        var name, value;

        if (pos == -1) {
            name = param;
            value = null;
        } else {
            name = param.substring(0, pos);
            value = decodeURIComponent(param.substring(pos + 1));
        }

        if (name === '') {
            continue;
        }

        obj.add(name, value);
    }
}

function _parseQuery(obj, query) {
    if (query.constructor === String) {
        _parseQueryString(obj, query);
    } else {
        for (var key in query) {
            if (query.hasOwnProperty(key)) {
                obj.add(key, query[key]);
            }
        }
    }
}

function Query(query) {
    if (query) {
        if (query.constructor === String) {
            this._params = {};
            _parseQueryString(this, query);
        } else {
            // initial params is simply the query obj
            this._params = query;
        }
    } else {
        this._params = {};
    }
}



Query.prototype = {

    object: function() {
        return this._params;
    },

    /**
     * removes a parameter from the query string
     *
     * @param {String} name parameter name
     */
    remove: function(name) {
        delete this._params[name];
    },

    /**
     * sets the value of a query string parameter
     *
     * @param {String|Object} name parameter name or object that contains name/value pairs
     * @param {Strign} value parameter value
     */
    set: function(name, value) {
        if (arguments.length === 1) {
            if (name.constructor !== String) {
                var obj = arguments[0];
                for (name in obj) {
                    if (obj.hasOwnProperty(name)) {
                        this._params[name] = obj[name];
                    }
                }
                return;
            }
        }
        if (value === null) {
            this.remove(name);
        } else {
            this._params[name] = value;
        }
    },

    /**
     * sets the value of a query string parameter
     *
     * @param {String} name parameter name
     * @param {Strign} value parameter value
     */
    add: function(name, value) {
        var existingValue = this._params[name];

        if (existingValue !== undefined) {
            if (Array.isArray(existingValue)) {
                if (Array.isArray(value)) {
                    for ( var i = 0; i < value.length; i++) {
                        existingValue.push(value[i]);
                    }
                } else {
                    existingValue.push(value);
                }
                value = existingValue;
            } else {
                value = [ existingValue, value ];
            }
        }

        this._params[name] = value;
    },

    /**
     * retrieves a value of parameter from the query string
     *
     * @param {String} name parameter name
     */
    get: function(name) {
        var value = this._params[name];
        if (value === undefined) {
            return null;
        }

        return value;
    },

    /**
     * This function is used to return a value array. If there is only one
     * parameter with the given name then a new array is returned that
     * contains the single item.
     */
    getValues: function(name) {
        var value = this._params[name];
        if (value === undefined) {
            return null;
        }

        if (Array.isArray(value)) {
            return value;
        } else {
            return [ value ];
        }
    },


    /**
     * converts the URL to its string representation
     *
     * @return {String} string representation of URL
     */
    toString: function() {
        var parts = [];

        for ( var name in this._params) {
            if (this._params.hasOwnProperty(name)) {
                var value = this._params[name];

                if ((value === undefined) || (value === null)) {
                    parts.push(name);
                } else if (Array.isArray(value)) {
                    for ( var i = 0; i < value.length; i++) {
                        parts.push(name + '=' + encodeURIComponent(value[i]));
                    }
                } else {
                    parts.push(name + '=' + encodeURIComponent(value));
                }
            }
        }

        return parts.join('&');
    }
};

function URL(url, query) {
    if (url) {
        _parseUrl(this, url);
    }

    if (query) {
        if (this._query) {
            _parseQuery(this._query, query);
        } else {
            this._query = Query.parse(query);
        }
    }
}

URL.prototype = {
    
    setPath: function(path) {
        this.path = path;
    },

    getPath: function() {
        return this.path;
    },

    getQuery: function() {
        if (!this._query) {
            this._query = new Query();
        }

        return this._query;
    },

    setQuery: function(query) {
        this._query = Query.parse(query);
    },

    /**
     * converts the URL to its string representation
     *
     * @return {String} string representation of URL
     */
    toString: function() {
        var query = (this._query) ? this._query.toString() : null;

        var str = '';
        
        if (this.protocol) {
            str += this.protocol;
            str += '://';
        }
        
        if (this.host !== undefined) {
            str += this.host;
        }

        if (this.port !== undefined) {
            str += ':';
            str += this.port;
        }
        
        if (this.path) {
            str += this.path;
        }
        
        if (query) {
            if (!this.path) {
                str += '/';
            }

            str += '?';
            str += query;
        }

        if (this.hash) {
            if (!this.path) {
                str += '/';
            }
            
            str += '#';
            str += this.hash;
        }

        return str;
    },

    getPathWithQuery: function() {
        return (this._query) ? this.path + '?' + this._query : this.path;
    },

    getPort: function() {
        if (this.port !== undefined) {
            return this.port;
        }

        if (this.protocol === 'http') {
            return 80;
        }

        if (this.protocol === 'https') {
            return 443;
        }

        return undefined;
    },

    getHost: function() {
        return this.host;
    },

    getHash: function() {
        return this.hash;
    },

    getProtocol: function() {
        return this.protocol;
    },

    removePort: function() {
        delete this.port;
    },

    removeQuery: function() {
        delete this._query;
    },

    removePath: function() {
        delete this.path;
    }
};

URL.parse = function(url) {
    if (!url) {
        return new URL();
    }

    if (url.constructor === URL) {
        return url;
    } else {
        return new URL(url);
    }
};

Query.parse = function(query) {
    if (!query) {
        return new Query();
    }

    if (query.constructor === Query) {
        return query;
    } else {
        return new Query(query);
    }
};

module.exports = {
    URL: URL,
    
    Query: Query,

    create: function() {
        return new URL();
    },

    parse: function(url, query) {
        return URL.parse(url, query);
    }
};