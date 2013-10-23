'use strict';

angular.module('geboClientApp')
  .factory('Token', function ($http, $q, $window, $rootScope, $resource, $filter) {

    /**
     * This is the data returned on verification.
     */
    var _data = {};

    /**
     *  This response type must be passed to the authorization endpoint using
     *  the implicit grant flow (4.2.1 of RFC 6749).
     */
    var RESPONSE_TYPE = 'token';

    /**
     * Create a special object for endpoint fields that are required and missing.
     * If any endpoint items still contain it when Token is used, raise an error.
     */
    var REQUIRED_AND_MISSING = {};

    /**
     * Default endpoint fields. These need to be set somewhere else.
     */
    var _endpoint = {
      gebo: REQUIRED_AND_MISSING,
      redirect: REQUIRED_AND_MISSING,
      clientId: 'todo@example.com',
      authorize: '/authorize',
      verify: '/verify',
      request: '/request',
      propose: '/propose',
      inform: '/inform',
      localStorageName: 'todo-token',
      scopes: []
    };

    /**
     * Get the token request parameters
     *
     * @throws Error
     */
    var _getParams = function() {
        var requiredAndMissing = [];

        angular.forEach(_endpoint, function(value, key) {
            if (value === REQUIRED_AND_MISSING || value === undefined) {
              requiredAndMissing.push(key);
            }
          });

        if (requiredAndMissing.length) {
          throw new Error('Token is insufficiently configured. Please ' +
                          'configure the following options: ' +
                          requiredAndMissing.join(', '));
        }

        // TODO: Facebook uses comma-delimited scopes.
        // This is not compliant with section 3.3 but perhaps support later.

        return {
          response_type: RESPONSE_TYPE,
          client_id: _endpoint.clientId,
          redirect_uri: _endpoint.redirect,
          scope: _endpoint.scopes.join(' ')
        };
      };

    /**
     * Set the configuration options
     */
    var _setEndpoints = function(endpoint) {
        _endpoint = angular.extend(_endpoint, endpoint);
      };

    // TODO: get/set might want to support expiration to reauthenticate
    // TODO: check for localStorage support and otherwise perhaps use other
    // methods of storing data (e.g. cookie)

    /**
     * Returns the stored access token.
     *
     * @returns {string} The access token.
     */
    var _get = function() {
        return localStorage.getItem(_endpoint.localStorageName);
//        return localStorage[_endpoint.localStorageName];
      };

    /**
     * Persist the access token so that it can be retrieved later by.
     *
     * @param accessToken
     */
    var _set = function(accessToken) {
        localStorage.setItem(_endpoint.localStorageName, accessToken);
//        localStorage[_endpoint.localStorageName] = accessToken;
      };

    /**
     * Remove token from local storage and clear
     * authentication data
     */
    var _clear = function() {
        _data = {};
        localStorage.removeItem(_endpoint.localStorageName);
      };

    /**
     * Verifies that the access token was issued to the current client.
     *
     * @param accessToken An access token received from the authorization server.
     *
     * @returns {Promise} Promise that will be resolved when the authorization 
     *          server has verified that the token is valid, and we've verified
     *          that the token is passed back has audience that matches our client
     *          ID (to prevent the Confused Deputy Problem).
     *
     *          If there's an error verifying the token, the promise is rejected 
     *          with an object identifying the `name` error
     *          in the name member.  The `name` can be either:
     *
     *          - `invalid_audience`: The audience didn't match our client ID.
     *          - `error_response`: The server responded with an error, typically
     *            because the token was invalid.  In this
     *            case, the callback parameters to `error` callback on `$http` 
     *            are available in the object (`data`, `status`, `headers`, `endpoint`).
     */
    var _verifyAsync = function(accessToken) {
        var deferred = $q.defer();
        _verify(accessToken, deferred);
        return deferred.promise;
      };

    /**
     * Verifies an access token asynchronously.
     *
     * @param extraParams An access token received from the authorization server.
     * @param popupOptions Settings for the display of the popup.
     *
     * @returns {Promise} Promise that will be resolved when the authorization
     *                    server has verified that thetoken is valid, and we've
     *                    verified that the token is passed back has audience
     *                    that matches our client ID (to prevent the Confused
     *                    Deputy Problem).
     *
     *  If there's an error verifying the token, the promise is rejected with an
     *  object identifying the `name` error in the name member. The `name` can 
     *  be either:
     *
     *    - `invalid_audience`: The audience didn't match our client ID.
     *    - `error_response`: The server responded with an error, typically
     *                        because the token was invalid.  In this
     *                        case, the callback parameters to `error` callback
     *                        on `$http` are available in the object (`data`,
     *                        `status`, `headers`, `endpoint`).
     */
    var _getTokenByPopup = function(extraParams, popupOptions) {
        popupOptions = angular.extend({
            name: 'AuthPopup',
            openParams: {
                width: 650,
                height: 300,
                resizable: true,
                scrollbars: true,
                status: true
              }
            }, popupOptions);

        var deferred = $q.defer(),
            params = angular.extend(_getParams(), extraParams),
            url = _endpoint.authorize + '?' + _objectToQueryString(params);

        var formatPopupOptions = function(options) {
            var pairs = [];
            angular.forEach(options, function(value, key) {
                if (value || value === 0) {
                  value = value === true ? 'yes' : value;
                  pairs.push(key + '=' + value);
                }
              });

            return pairs.join(',');
          };

        var popup = window.open(
            url,
            popupOptions.name,
            formatPopupOptions(popupOptions.openParams));

        // TODO: binding occurs for each reauthentication,
        // leading to leaks for long-running apps.

        angular.element($window).bind('message', function(event) {
            if (event.source === popup && event.origin === window.location.origin) {
              $rootScope.$apply(function() {
                if (event.data.access_token) {
                  deferred.resolve(event.data);
                } else {
                  deferred.reject(event.data);
                }
              });
            }
          });

          // TODO: reject deferred if the popup was closed without
          // a message being delivered + maybe offer a timeout

        return deferred.promise;
      };

    /**
     * Given an flat object, return an URL-friendly query string.  Note
     * that for a given object, the return value may be.
     *
     * @example
     * <pre>
     *    // returns 'color=red&size=large'
     *    _objectToQueryString({color: 'red', size: 'large'})
     * </pre>
     *
     * @param {Object} A flat object containing keys for a query string.
     * 
     * @returns {string} An URL-friendly query string.
     */
    var _objectToQueryString = function(obj) {
      var str = [];
      angular.forEach(obj, function(value, key) {
        str.push(encodeURIComponent(key) + '=' + encodeURIComponent(value));
      });
      return str.join('&');
    };

    /**
     * Verify the user is still authenticated
     */
    var _verify = function(accessToken, deferred, next) {

        var Token = $resource(_getEndpointUri('verify'),
                        { access_token: accessToken },
                        { verify: { method: 'GET' }});

        Token.verify(
            function(data) {
                _data = data;
                deferred.resolve(data);

                if (next) {
                  next();
                }
              },
            function(data, status, headers, endpoint) {
                  deferred.reject({
                    name: 'error_response',
                    data: data,
                    status: status,
                    headers: headers,
                    endpoint: endpoint
                  });
                });
      };

    /**
     * Remove a collection
     *
     * @param string
     *
     * @return promise
     */
//    var _rmdir = function(id) {
//        var deferred = $q.defer();
//
//        $http.delete(_endpoint.rmdirDataEndpoint, { params: { _id: id, access_token: _get() }}).
//                success(
//                    function(res) {
//                        deferred.resolve(res);
//                      }).
//                error(
//                    function(err) {
//                        deferred.reject(err);
//                      });
//
//        return deferred.promise;
//      };

    /**
     * Send a request
     *
     * @param Object 
     */
    function _request(content) {
        var deferred = $q.defer();

        content.access_token = _get();

        $http.defaults.headers.common['Content-Type'] = 'application/x-www-form-urlencoded';
        $http.post(_getEndpointUri('request'), content).
                success(
                    function(response) {
                        deferred.resolve(response);
                      }).
                error(
                    function(obj, err) {
                        deferred.reject(err);
                      });

        return deferred.promise;
      };

    /**
     * Encode embedded JSON
     *
     * Not currently using this, but it may be useful soon
     *
     * From: http://blog.tryfinally.co.za/2012/12/form-url-encoded-post-with-angularjs.html
     */
    function _formEncode(obj) {
        var jsonString = '';
        for (var key in obj) {
          if (jsonString.length !== 0) {
            jsonString += '&';
          }
          jsonString += key + '=' + $filter('json')(obj[key]);
        }
        return jsonString;
      }

    /**
     * Get an endpoint URI
     *
     * @param string
     */
    function _getEndpointUri(endpoint) {
        return _endpoint.gebo + _endpoint[endpoint]; 
      }

    /**
     * API
     */
    return {
      clear: _clear,
      data: function() {
              return _data;
            },
      formEncode: _formEncode,
      get: _get,
      getEndpoints: function() {
              return _endpoint;
            },
      getEndpointUri: _getEndpointUri,
      getParams: _getParams,
      getTokenByPopup: _getTokenByPopup,
      objectToQueryString: _objectToQueryString,
      verify: _verify,
      verifyAsync: _verifyAsync,
      request: _request,
      //rmdir: _rmdir,
      set: _set,
      setEndpoints: _setEndpoints,
    };
  });
