var Query = require('./Query');
var URL = require('./URL');

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
