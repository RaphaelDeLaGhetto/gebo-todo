'use strict';

angular.module('geboClientApp')
  .factory('Token', function ($http, $q, $window, $rootScope, $resource) {

    /**
     * This the data returned on verification.
     */
    var _data = {};

    /**
     *  This response type must be passed to the authorization endpoint using
     *  the implicit grant flow (4.2.1 of RFC 6749).
     */
    var RESPONSE_TYPE = 'token';

    /**
     * Create a special object for config fields that are required and missing.
     * If any config items still contain it when Token is used, raise an error.
     */
    var REQUIRED_AND_MISSING = {};

    /**
     * Default config fields. These need to be set somewhere else.
     */
    var _config = {
      clientId: REQUIRED_AND_MISSING,
      redirectUri: REQUIRED_AND_MISSING,
      authorizationEndpoint: REQUIRED_AND_MISSING,
      verificationEndpoint: REQUIRED_AND_MISSING,
      saveEndpoint: null,
      localStorageName: 'accessToken',
      scopes: []
    };

    /**
     * Get the configuration options
     *
     * @throws Error
     */
    var _getParams = function() {
        var requiredAndMissing = [];

        angular.forEach(_config, function(value, key) {
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
          client_id: _config.clientId,
          redirect_uri: _config.redirectUri,
          scope: _config.scopes.join(' ')
        };
      };

    /**
     * Set the configuration options
     */
    var _setParams = function(config) {
        _config = config;
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
        return localStorage.getItem(_config.localStorageName);
//        return localStorage[_config.localStorageName];
      };

    /**
     * Persist the access token so that it can be retrieved later by.
     *
     * @param accessToken
     */
    var _set = function(accessToken) {
        localStorage.setItem(_config.localStorageName, accessToken);
//        localStorage[_config.localStorageName] = accessToken;
      };

    /**
     * Remove token from local storage and clear
     * authentication data
     */
    var _clear = function() {
        _data = {};
        localStorage.removeItem(_config.localStorageName);
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
     *            are available in the object (`data`, `status`, `headers`, `config`).
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
     *                        `status`, `headers`, `config`).
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
            url = _config.authorizationEndpoint + '?' + _objectToQueryString(params);

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

        var Token = $resource(_config.verificationEndpoint,
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
            function(data, status, headers, config) {
                  deferred.reject({
                    name: 'error_response',
                    data: data,
                    status: status,
                    headers: headers,
                    config: config
                  });
                });
      };

    /**
     * Save data to the user's profile
     */
    var _saveToProfile = function(data, collection) {

        var Data = $resource(_config.saveEndpoint,
                        {  },
                        { store: { method: 'PUT' }});

        if (!data || Object.keys(data).length === 0 || !collection) {
          return;
        }

        var dataResource = new Data();
        dataResource.access_token = _get();
        dataResource.data = data;
        dataResource.collection = collection;

        dataResource.$store(function(val, res) {
            console.log('Success storing');       
            console.log(val);
        },
        function(res) {
            console.log('Error storing');       
            console.log(res);       
        });
      };

    /**
     * API
     */
    return {
      clear: _clear,
      data: function() {
              return _data;
            },
      get: _get,
      getTokenByPopup: _getTokenByPopup,
      getParams: _getParams,
      objectToQueryString: _objectToQueryString,
      verify: _verify,
      verifyAsync: _verifyAsync,
      saveEndpoint: function() {
              return _config.saveEndpoint;
            },
      saveToProfile: _saveToProfile,
      set: _set,
      setParams: _setParams,
    };
  });
