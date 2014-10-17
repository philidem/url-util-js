var chai = require('chai');
chai.config.includeStack = true;
chai.should();

var expect = require('chai').expect;

var urlUtil = require('../url-util');
var URL = urlUtil.URL;
var Query = urlUtil.Query;

describe('url-util', function() {
    var origUrl = 'http://www.company.com:8080/?q=red%20roses#this#is#a#test';
    
    it('should for', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.toString()).to.equal(origUrl);
    });
    
    it('should parse protocol', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.protocol).to.equal('http');
    });
    
    it('should parse host', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.host).to.equal('www.company.com');
    });
    
    it('should parse port', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.port).to.equal('8080');
    });
    
    it('should parse query string', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.getQuery().get('q')).to.equal('red roses');
    });
    
    it('should parse hash', function() {
        var testUrl = urlUtil.parse(origUrl);
        expect(testUrl.hash).to.equal('this#is#a#test');
    });

    it('should allow object as query', function() {
        var url = new URL();
        var query = url.getQuery();
        query.set({
            a: 1,
            b: 2
        });

        query.set({
            c: 3,
            d: 4
        });

        expect(query.object()).to.deep.equal({a:1, b: 2, c: 3, d: 4});
    });

    it('should allow query obj', function() {
        var url;
        var query;

        url = new URL('http://www.company.com', {a: 1});
        expect(url.getQuery().object()).to.deep.equal({a: 1});

        query = Query.parse({a: 1});
        expect(query.object()).to.deep.equal({a: 1});

        query = new Query({a: 1});
        expect(query.object()).to.deep.equal({a: 1});
    });

    it('should merge initial query string from URL add given query', function() {
        var url;

        url = new URL('http://www.company.com/?a=1');
        expect(url.getQuery().object()).to.deep.equal({a: '1'});

        url = new URL('http://www.company.com/?a=1', 'a=1');
        expect(url.getQuery().object()).to.deep.equal({a: ['1', '1']});

        url = new URL('http://www.company.com/?a=1', {a: '1'});
        expect(url.getQuery().object()).to.deep.equal({a: ['1', '1']});
    });
});