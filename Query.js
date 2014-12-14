var _parseQueryString;

var Query = module.exports = function Query(query) {
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
};

_parseQueryString = Query.parseQueryString = function(obj, queryStr) {
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
};

var Query_prototype = Query.prototype;

Query_prototype.object = function() {
	return this._params;
};

/**
* removes a parameter from the query string
*
* @param {String} name parameter name
*/
Query_prototype.remove = function(name) {
	delete this._params[name];
};

/**
* sets the value of a query string parameter
*
* @param {String|Object} name parameter name or object that contains name/value pairs
* @param {Strign} value parameter value
*/
Query_prototype.set = function(name, value) {
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
};

/**
* sets the value of a query string parameter
*
* @param {String} name parameter name
* @param {Strign} value parameter value
*/
Query_prototype.add = function(name, value) {
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
};

/**
* retrieves a value of parameter from the query string
*
* @param {String} name parameter name
*/
Query_prototype.get = function(name) {
	var value = this._params[name];
	if (value === undefined) {
		return null;
	}
	
	return value;
};

/**
* This function is used to return a value array. If there is only one
* parameter with the given name then a new array is returned that
* contains the single item.
*/
Query_prototype.getValues = function(name) {
	var value = this._params[name];
	if (value === undefined) {
		return null;
	}
	
	if (Array.isArray(value)) {
		return value;
	} else {
		return [ value ];
	}
};

/**
* converts the URL to its string representation
*
* @return {String} string representation of URL
*/
Query_prototype.toString = function() {
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
