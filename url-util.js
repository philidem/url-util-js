define('url-util', function(require) {
   
    var URL = require('url-util/URL');
    var QueryString = require('url-util/QueryString');
    
    return {
    
        url : function() {
            return new URL();
        },
        
        queryString : function() {
            return new QueryString();
        },
        
        parse : function(url, queryString) {
            return URL.parse.apply(this, arguments);
        }
    
    };
    
});