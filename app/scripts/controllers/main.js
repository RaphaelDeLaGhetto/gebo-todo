'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope, Token) {

    /**
     * Configure OAuth2 for interaction with gebo-server
     *
     * The baseUrl stuff seems kind of hacky. The #/ replacement
     * points the redirect back at the server root, as opposed
     * to the application route (I think)
     */
    var baseUrl = document.URL.replace('index.html', '');
    baseUrl = document.URL.replace('#/', '');

    Token.setParams({
      clientId: 'abc123',
      redirectUri: baseUrl + 'oauth2callback.html',
      scopes: ['*'],
      authorizationEndpoint: 'http://localhost:3000/dialog/authorize',
      verificationEndpoint: 'http://localhost:3000\\:3000/api/userinfo',
      localStorageName: 'gebo-token',
    });

    /**
     * See if this client already has a token
     */
    $scope.accessToken = Token.get();

    if ($scope.accessToken) {
      Token.verifyAsync($scope.accessToken).
            then(function(data) {
              $scope.username = data.name;
            }, function() {
              window.alert('Failed to verify token.');
            });
    }

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
            then(function(data) {
              $scope.accessToken = params.access_token;
              $scope.username = data.name;

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

