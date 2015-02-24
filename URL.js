var Query = require('./Query');

var _parseQueryString = Query.parseQueryString;

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
	if (url.constructor !== String) {
		for (var key in url) {
			if (url.hasOwnProperty(key)) {
				obj[key] = url[key];
			}
		}
		return;
	}

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

var URL = module.exports = function URL(url, query) {
	if (url) {
		_parseUrl(this, url);

		if (this._query) {
			this._query = Query.parse(this._query);
		}
	}

	if (query) {
		if (this._query) {
			_parseQuery(this._query, query);
		} else {
			this._query = Query.parse(query);
		}
	}
};

var URL_prototype = URL.prototype;

URL_prototype.getQuery = function() {
	if (!this._query) {
		this._query = new Query();
	}

	return this._query;
};

URL_prototype.setQuery = function(query) {
	this._query = Query.parse(query);
};

/**
* converts the URL to its string representation
*
* @return {String} string representation of URL
*/
URL_prototype.toString = function() {
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
};

URL_prototype.getPathWithQuery = function() {
	return (this._query) ? this.path + '?' + this._query : this.path;
};

URL_prototype.getPort = function() {
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
};

URL_prototype.setPort = function(port) {
	this.port = port;
};

// generate simple getters and setters
['path', 'host', 'hash', 'protocol'].forEach(function(attr) {
	var title = attr.charAt(0).toUpperCase() + attr.substring(1);
	URL_prototype['get' + title] = function() {
		return this[attr];
	};

	URL_prototype['set' + title] = function(value) {
		this[attr] = value;
	};

	URL_prototype['remove' + title] = function(value) {
		delete this[attr];
	};
});

URL.parse = function(url, query) {
	if (!url) {
		return new URL(null, query);
	}

	if (url.constructor === URL) {
		if (query) {
			url.setQuery(query);
		}
		return url;
	} else {
		return new URL(url, query);
	}
};
