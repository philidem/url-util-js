var raptor = require('raptor');
var resources = raptor.require('raptor/resources');
var files = raptor.require('raptor/files');
var packaging = raptor.require('raptor/packaging');

require = raptor.require;

var moduleManifest = resources.createFileResource(files.joinPaths(__dirname, '../package.json'));
packaging.load(packaging.getPackageManifest(moduleManifest));

var urlUtil = require('url-util');

var URL = require('url-util/URL');


describe('url-util/URL', function() {
    
    (function() {
        var origUrl = 'http://www.google.com:8080/?q=red%20roses#this#is#a#test';
        var url = URL.parse(origUrl);
        var queryString = url.getQueryString();
        
        it('should format ' + url, function() {
            expect(url.toString()).toEqual(origUrl);
        });
        
        it('should parse protocol in ' + url, function() {
            expect(url.protocol).toEqual('http');
        });
        
        it('should parse host in ' + url, function() {
            expect(url.host).toEqual('www.google.com');
        });
        
        it('should parse port in ' + url, function() {
            expect(url.port).toEqual('8080');
        });
        
        it('should parse query string in ' + url, function() {
            expect(queryString.get('q')).toEqual('red roses');
        });
        
        it('should parse hash in ' + url, function() {
            expect(url.hash).toEqual('this#is#a#test');
        });
    })();

    (function() {
        var origUrl = 'http://www.google.com:8080/?q=red%20roses&q=something#this#is#a#test';
        var url = URL.parse(origUrl);
        var queryString = url.getQueryString();
        
        it('should format ' + url, function() {
            expect(url.toString()).toEqual(origUrl);
        });
        
        it('should parse protocol in ' + url, function() {
            expect(url.protocol).toEqual('http');
        });
        
        it('should parse host in ' + url, function() {
            expect(url.host).toEqual('www.google.com');
        });
        
        it('should parse port in ' + url, function() {
            expect(url.port).toEqual('8080');
        });
        
        it('should parse query string in ' + url, function() {
            expect(queryString.get('q')).toEqual(['red roses', 'something']);
        });
        
        it('should parse hash in ' + url, function() {
            expect(url.hash).toEqual('this#is#a#test');
        });
    })();
});