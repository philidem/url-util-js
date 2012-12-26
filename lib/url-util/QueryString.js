define('url-util/QueryString', function() {

    function QueryString(queryString) {
        this.parameterMap = {};

        if (queryString) {
            this.parse(queryString);
        }
    }

    QueryString.encodeExclusions = {};
    
    QueryString.addEncodeExclusion = function(exclusion) {
        if (exclusion.constructor === Array) {
            for (var i = 0; i < exclusion.length; i++) {
                this.encodeExclusions[exclusion[i]] = true;
            }
        } else {
            this.encodeExclusions[exclusion] = true;
        }
    };

    QueryString.parse = function(queryString) {
        if (!queryString) {
            return new QueryString();
        }

        if (queryString.constructor === QueryString) {
            return queryString;
        } else {
            return new QueryString(queryString.toString());
        }
    };

    QueryString.prototype = {
        parse : function(queryString) {

            if (typeof queryString === 'object') {
                for (var key in queryString) {
                    if (queryString.hasOwnProperty(key)) {
                        this.add(key, queryString[key]);
                    }
                }
            } else {
                var parameters = queryString.split("&");

                for (var i = 0; i < parameters.length; i++) {
                    var param = parameters[i];
                    pos = param.indexOf("=");

                    var name, value;

                    if (pos == -1) {
                        name = param;
                        value = null;
                    } else {
                        name = param.substring(0, pos);
                        value = decodeURIComponent(param.substring(pos + 1));
                    }

                    if (name == "") {
                        continue;
                    }

                    this.add(name, value);
                }
            }
        },

        /**
         * removes a parameter from the query string
         * 
         * @param {String} name parameter name
         */
        remove : function(name) {
            delete this.parameterMap[name];
        },

        /**
         * sets the value of a query string parameter
         * 
         * @param {String} name parameter name
         * @param {Strign} value parameter value
         */
        set : function(name, value) {
            if (value === null) {
                this.remove(name);
            } else {
                this.parameterMap[name] = value;
            }
        },

        /**
         * sets the value of a query string parameter
         * 
         * @param {String} name parameter name
         * @param {Strign} value parameter value
         */
        add : function(name, value) {
            var existingValue = this.parameterMap[name];

            if (existingValue !== undefined) {
                if (existingValue.constructor === Array) {
                    if (value.constructor === Array) {
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

            this.parameterMap[name] = value;
        },

        /**
         * retrieves a value of parameter from the query string
         * 
         * @param {String} name parameter name
         */
        get : function(name) {
            var value = this.parameterMap[name];
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
        getValues : function(name) {
            var value = this.parameterMap[name];
            if (value === undefined) {
                return null;
            }

            if (value.constructor === Array) {
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
        toString : function() {
            var parts = [];

            for ( var name in this.parameterMap) {
                if (this.parameterMap.hasOwnProperty(name)) {
                    var value = this.parameterMap[name];

                    if ((value === undefined) || (value === null)) {
                        parts.push(name);
                    } else if (value.constructor === Array) {

                        var doNotEncode = QueryString.encodeExclusions[name];
                        for ( var i = 0; i < value.length; i++) {
                            parts.push(name
                                    + "="
                                    + (doNotEncode ? value[i]
                                            : encodeURIComponent(value[i])));
                        }
                    } else {
                        var doNotEncode = QueryString.encodeExclusions[name];
                        parts.push(name
                                + "="
                                + (doNotEncode ? value
                                        : encodeURIComponent(value)));
                    }
                }
            }

            return parts.join("&");
        }
    };

    return QueryString;
});