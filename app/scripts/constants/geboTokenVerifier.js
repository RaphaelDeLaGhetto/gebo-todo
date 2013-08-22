'use strict';

angular.module('geboClientApp').

  constant('GeboTokenVerifier', function(config, accessToken, deferred) {
    var $injector = angular.injector(['ng']);

    return $injector.invoke(['$http', '$rootScope', function($http, $rootScope) {
      var verificationEndpoint = 'http://localhost:3000/api/userinfo';


      $rootScope.$apply(function() {

        $http({
            method: 'GET',
            url: verificationEndpoint,
            params: {
                access_token: accessToken,
//                        callback: '?',
//                        token_type: 'bearer',
              }
            }).
          success(function(data) {
              if (data.audience === config.clientId) {
                deferred.resolve(data);
              } else {
                deferred.reject({name: 'invalid_audience'});
              }
            }).
          error(function(data, status, headers, config) {
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
  });
