var http = require('http'),
    url = require('url'),
    querystring = require('querystring'),
    _ = require('underscore');

var requestCookies = '';

function requestUrlByPOST(options, dataCallback) {
  options.method = 'POST';
  requestUrl(options, dataCallback);
}

function requestUrl(options, dataCallback) {
  var requestOptions = _.extend(options, {headers: {}}, url.parse(options.url));

  if (requestCookies) {
    _.extend(requestOptions.headers, {Cookie: requestCookies});
  }

  if (isGET(options)) {
    addQueryStringToUrl(requestOptions);
  }

  var request = http.request(requestOptions, function(response) {
    var responseContent = '';

    rememberCookies(response);

    response.on('data', function(chunk) {
      responseContent += chunk;
    });

    response.on('end', function() {
      dataCallback(responseContent);
    });
  });

  if (isPOST(options) && options.data) {
    request.write(querystring.stringify(options.data));
  }

  request.end();
}

function rememberCookies(response) {
  var headers = response.headers,
      cookies = headers['set-cookie'];

  if (typeof cookies === 'undefined') {
    return;
  }

  if (typeof cookies === 'string') {
    cookies = [cookies];
  }

  cookies.forEach(function(cookieValue) {
    requestCookies += cookieValue.split(';')[0] + ';';
  });
}

function flushCookies() {
  requestCookies = '';
}

function isGET(options) {
  return !options.method || options.method === 'GET';
}

function isPOST(options) {
  return options.method && options.method === 'POST';
}

function addQueryStringToUrl(options) {
  if (!options.data) {
    return;
  }

  options.path += '?' + querystring.stringify(options.data);
}

module.exports = {
  get: requestUrl,
  post: requestUrlByPOST,
  forget: flushCookies
};