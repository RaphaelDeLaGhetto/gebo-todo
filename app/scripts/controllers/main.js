'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope, Token) {

    $scope.accessToken = Token.get();

    /**
     * Allow gebo-client access to the gebo user's resources
     */
    $scope.authenticate = function() {

      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
      Token.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid the confused deputy problem.
          Token.verifyAsync(params.access_token).
            then(function() {
              $scope.accessToken = params.access_token;
              $scope.expiresIn = params.expires_in;

              Token.set(params.access_token);
              $scope.accessToken = Token.get();
            }, function() {
              window.alert('Failed to verify token.');
            });
        }, function() {
          // Failure getting token from popup.
          window.alert('Failed to get token from popup.');
        });
    };
  }).config(function(TokenProvider, GeboTokenVerifier) {
    // Is this a dumb way to get a relative URL?
    var baseUrl = document.URL.replace('index.html', '');

    TokenProvider.extendConfig({
      clientId: 'abc123',
      redirectUri: baseUrl + 'oauth2callback.html',
      scopes: ['*'],
      verifyFunc: GeboTokenVerifier,
      authorizationEndpoint: 'http://localhost:3000/dialog/authorize'
    });
  });

