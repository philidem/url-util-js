var chai = require('chai');
chai.config.includeStack = true;
chai.should();

var expect = require('chai').expect;

var urlUtil = require('../url-util');

describe('url-util', function() {
    var origUrl = 'http://www.google.com:8080/?q=red%20roses#this#is#a#test';
    var url = urlUtil.parse(origUrl);
    var queryString = url.getQueryString();
    
    it('should format ' + url, function() {
        expect(url.toString()).to.equal(origUrl);
    });
    
    it('should parse protocol in ' + url, function() {
        expect(url.protocol).to.equal('http');
    });
    
    it('should parse host in ' + url, function() {
        expect(url.host).to.equal('www.google.com');
    });
    
    it('should parse port in ' + url, function() {
        expect(url.port).to.equal('8080');
    });
    
    it('should parse query string in ' + url, function() {
        expect(queryString.get('q')).to.equal('red roses');
    });
    
    it('should parse hash in ' + url, function() {
        expect(url.hash).to.equal('this#is#a#test');
    });
});