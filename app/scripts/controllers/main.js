/**
 * This controller was inspired by:
 * enginous/angular-oauth
 * https://github.com/enginous/angular-oauth
 */
'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope, Token, $location) {

    $scope.verified = false;

    /**
     * Configure OAuth2 for interaction with gebo-server
     */
    var baseUrl = window.location.origin;

    Token.setEndpoints({
//      gebo: 'https://192.168.1.25:3443/dialog/authorize',
      gebo: 'https://localhost:3443',
      redirect: baseUrl + '/oauth2callback.html',
    });

    /**
     * See if this client already has a token
     */
    $scope.accessToken = Token.get();

    if ($scope.accessToken) {
      Token.verifyAsync($scope.accessToken).
            then(function(data) {
              $scope.agentName = data.agentName;
              $scope.verified = true;
            }, function() {
              window.alert('You have an expired or invalid token.');
            });
    }

    /**
     * Allow gebo-client access to the gebo user's resources
     */
    $scope.authenticate = function() {

      var extraParams = {};//$scope.askApproval ? { approval_prompt: 'force' } : {};
      Token.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid
          // the confused deputy problem (uh, what's the 
          // confused deputy problem?)
          Token.verifyAsync(params.access_token).
            then(function(data) {
              $scope.accessToken = params.access_token;
              $scope.agentName = data.agentName;
              $scope.verified = true;

              Token.set(params.access_token);
            }, function() {
              window.alert('Cannot verify token.');
            });
        }, function() {
          // Failure getting token from popup.
          window.alert('Failed to get token from popup.');
        });
    };

    /**
     * Disallow gebo-client access to the gebo user's resources
     */
    $scope.deauthenticate = function () {
        delete $scope.agentName;
        delete $scope.accessToken;
        $scope.verified = false;
        Token.clear();
        $location.path('/');
      };
  });

