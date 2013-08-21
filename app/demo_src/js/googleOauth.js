'use strict';

/**
 * A module to include instead of `angularOauth` for a service preconfigured
 * for Google OAuth authentication.
 *
 * Guide: https://developers.google.com/accounts/docs/OAuth2UserAgent
 */
angular.module('googleOauth', ['angularOauth']).
//  config(['$httpProvider'], function($httpProvider) {
//    $httpProvider.defaults.headers.common['X-Requested-With'] = 'XMLHttpRequest';
//  }).
  constant('GoogleTokenVerifier', function(config, accessToken, deferred) {
    var $injector = angular.injector(['ng']);
    return $injector.invoke(['$http', '$rootScope', function($http, $rootScope) {
      //var verificationEndpoint = 'https://www.googleapis.com/oauth2/v1/tokeninfo';
      var verificationEndpoint = 'http://localhost:3000/api/userinfo';

      console.log('GoogleTokenVerifier');

      $rootScope.$apply(function() {
//        console.log($http.defaults.headers.common);
//        delete $http.defaults.headers.common['X-Requested-With'];
//        console.log($http.defaults.headers.common);

        $http({method: 'GET', url: verificationEndpoint, params: { 
                access_token: accessToken,
                token_type: 'bearer',
//                callback: 'JSON_CALLBACK'
            }}).
          success(function(data) {
            console.log(data);
//            if (data.audience == config.clientId) {
//              console.log(config.clientId);
              deferred.resolve(data);
//            } else {
//              console.log(deferred);
//              deferred.reject({name: 'invalid_audience'});
//            }
          }).
          error(function(data, status, headers, config) {
            console.log(data);
            console.log(status);
            console.log(headers);
            console.log(config);
            deferred.reject({
              name: 'error_response',
              data: data,
              status: status,
              headers: headers,
              config: config
            });
          });
      });

      return deferred;
    }]);
  }).

  config(function(TokenProvider, GoogleTokenVerifier) {
    TokenProvider.extendConfig({
      //authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
      authorizationEndpoint: 'http://localhost:3000/dialog/authorize',
      //scopes: ["https://www.googleapis.com/auth/userinfo.email"],
      scopes: ["*"],
      verifyFunc: GoogleTokenVerifier
    });
  });
