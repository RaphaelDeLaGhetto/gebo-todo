'use strict';

angular.module('geboClientApp')
  .factory('Verifier', function ($http) {

    var _userInfo = {},
        _token = null,
        _verificationEndpoint = null;

    /**
     * Ping the gate keeper to make sure that this client
     * is authorized.
     */
    var _verify = function(next) {
        $http.get('/test').success(function(data) {
            _setCredentials(data, '1234');
            next();
        }); 

//        $http({
//            method: 'GET',
//            url: verificationEndpoint,
//            params: {
//                access_token: accessToken,
////                        callback: '?',
////                        token_type: 'bearer',
//              }
//            }).
//          success(function(data) {
//              // It looks like the client needs to send its
//              // ID here. That isn't happeing at the moment,
//              // hence all the commented stuff.
////              if (data.audience === config.clientId) {
//                console.log(data);
//                verifier.authenticate(data);
//                deferred.resolve(data);
////              } else {
////                deferred.reject({name: 'invalid_audience'});
////              }
//              }).
//          error(function(data, status, headers, config) {
//
//              deferred.reject({
//                name: 'error_response',
//                data: data,
//                status: status,
//                headers: headers,
//                config: config
//              });
//            });
    };

    /**
     * Store the user's credentials
     */
    var _setCredentials = function(info, token) {
        _userInfo = info;
        _token = token;
    };
    
    /**
     * Public API here
     */
    return {
      id: function() {
              return _userInfo.id;
            },
      name: function() {
              return _userInfo.name;
            },
      email: function() {
              return _userInfo.email;
            },
      scope: function() {
              return _userInfo.scope;
            },
      token: function() {
              return _token;
            },
      deauthenticate: function() {
              _userInfo = {};
              _token = '';
            },
      setCredentials: _setCredentials,
      verificationEndpoint: _verificationEndpoint,
      verify: _verify,
    };
  });
