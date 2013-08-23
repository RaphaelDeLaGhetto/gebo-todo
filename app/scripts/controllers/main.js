'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope, TokenOld, Verifier, $http) {

    $scope.accessToken = TokenOld.get();

    $scope.entries = [];
    this.load = function(callback) {
        $http.get('/test').success(function(data) {
                $scope.entries = data;
                callback();
              });
      };

    /**
     * Allow gebo-client access to the gebo user's resources
     */
    $scope.authenticate = function() {

      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
      TokenOld.getTokenByPopup(extraParams)
        .then(function(params) {
          // Success getting token from popup.

          // Verify the token before setting it, to avoid
          // the confused deputy problem (uh, what's the 
          // confused deputy problem?)
          TokenOld.verifyAsync(params.access_token, Verifier).
            then(function() {
              $scope.accessToken = params.access_token;
              $scope.expiresIn = params.expires_in;

              TokenOld.set(params.access_token);
              $scope.accessToken = TokenOld.get();
            }, function() {
              window.alert('Failed to verify token.');
            });
        }, function() {
          // Failure getting token from popup.
          window.alert('Failed to get token from popup.');
        });
    };
  }).config(function(TokenOldProvider, GeboTokenVerifier) {
    // Is this a dumb way to get a relative URL?
    var baseUrl = document.URL.replace('index.html', '');

    TokenOldProvider.extendConfig({
      clientId: 'abc123',
      redirectUri: baseUrl + 'oauth2callback.html',
      scopes: ['*'],
      verifyFunc: GeboTokenVerifier,
      authorizationEndpoint: 'http://localhost:3000/dialog/authorize'
    });
  });

