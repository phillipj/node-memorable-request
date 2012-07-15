var should = require('should'),
    nock = require('nock'),
    querystring = require('querystring'),
    memorable = require('..');

var DOMAIN = 'http://nodejs.org',
    PATH = '/',
    PAYLOAD = {some: 'val', other: 'value'},
    RESPONSE = 'howdy';

var requestMock;

describe('GET requests', function() {
  it('should perform GET request to URL', function(done) {
    requestMock = nock(DOMAIN)
                      .get(PATH)
                      .reply(200, RESPONSE);

    memorable.get({url: DOMAIN + PATH}, function() {
      done();
    });

    requestMock.isDone().should.be.true;
  });

  it('should deliver data as query string', function(done) {
    requestMock = nock(DOMAIN)
                      .get(pathWithQueryString(PATH, PAYLOAD))
                      .reply(200, RESPONSE);

    memorable.get({url: DOMAIN + PATH, data: PAYLOAD}, function() {
      done();
    });

    requestMock.isDone().should.be.true;
  });

  it('should provide response content as callback parameter', function(done) {
    requestMock = nock(DOMAIN)
                      .get(PATH)
                      .reply(200, RESPONSE);

    memorable.get({url: DOMAIN + PATH}, function(content) {
      content.should.equal(RESPONSE);
      done();
    });
  });

  function pathWithQueryString(path, payload) {
    return path + '?' + querystring.stringify(payload);
  }
});

describe('POST requests', function() {
  it('should perform POST request to URL', function(done) {
    requestMock = nock(DOMAIN)
                      .post(PATH)
                      .reply(200, RESPONSE);

    memorable.post({url: DOMAIN + PATH}, function() {
      done();
    });

    requestMock.isDone().should.be.true;
  });

  it('should deliver data as request body', function(done) {
    requestMock = nock(DOMAIN)
                      .post(PATH, querystring.stringify(PAYLOAD))
                      .reply(200, RESPONSE);

    memorable.post({url: DOMAIN + PATH, data: PAYLOAD}, function() {
      done();
    });

    requestMock.isDone().should.be.true;
  });

  it('should provide response content as callback parameter', function(done) {
    requestMock = nock(DOMAIN)
                      .post(PATH)
                      .reply(200, RESPONSE);

    memorable.post({url: DOMAIN + PATH}, function(content) {
      content.should.equal(RESPONSE);
      done();
    });
  });
});

describe('Cookies', function() {
  var A_COOKIE = 'some=var;',
      SEVERAL_COOKIES = ['some=val;', 'other=value;'];

  afterEach(function() {
    memorable.forget();
  });

  it('should remember a cookie between requests', function(done) {
    requestMock = nock(DOMAIN)
                      .get(PATH)
                      .reply(200, RESPONSE, {'Set-Cookie': A_COOKIE});

    memorable.get({url: DOMAIN + PATH}, function() {
      requestMock = nock(DOMAIN)
                        .matchHeader('cookie', A_COOKIE)
                        .get(PATH + 'second')
                        .reply(200, RESPONSE);

      memorable.get({url: DOMAIN + PATH + 'second'}, function() {
        done();
      });
    });

    requestMock.isDone().should.be.true;
  });

  it('should remember several cookies between requests', function(done) {
    requestMock = nock(DOMAIN)
                      .get(PATH)
                      .reply(200, RESPONSE, {'Set-Cookie': SEVERAL_COOKIES});

    memorable.get({url: DOMAIN + PATH}, function() {
      requestMock = nock(DOMAIN)
                        .matchHeader('cookie', SEVERAL_COOKIES.join(''))
                        .get(PATH + 'second')
                        .reply(200, RESPONSE);

      memorable.get({url: DOMAIN + PATH + 'second'}, function() {
        done();
      });
    });

    requestMock.isDone().should.be.true;
  });
});