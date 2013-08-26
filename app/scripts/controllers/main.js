'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope, Token) {

    /**
     * Configure OAuth2 for interaction with gebo-server
     */
    var baseUrl = document.URL.replace('index.html', '');
    Token.setParams({
      clientId: 'abc123',
      redirectUri: baseUrl + 'oauth2callback.html',
      scopes: ['*'],
      authorizationEndpoint: 'http://localhost:3000/dialog/authorize',
      verificationEndpoint: 'http://localhost:3000\\:3000/api/userinfo',
    });

    $scope.accessToken = Token.get();

    /**
     * Allow gebo-client access to the gebo user's resources
     */
    $scope.authenticate = function() {

      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
      Token.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid
          // the confused deputy problem (uh, what's the 
          // confused deputy problem?)
          Token.verifyAsync(params.access_token).
            then(function() {
              $scope.accessToken = params.access_token;
              $scope.expiresIn = params.expires_in;

              Token.set(params.access_token);
            }, function() {
              window.alert('Failed to verify token.');
            });
        }, function() {
          // Failure getting token from popup.
          window.alert('Failed to get token from popup.');
        });
    };
  });

