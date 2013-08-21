'use strict';

angular.module('geboClientApp')
  .controller('MainCtrl', function ($scope) {

//    $scope.accessToken = Token.get();

    console.log('MainCtrl');
//    console.log($scope.accessToken);

    $scope.authenticate = function() {
      console.log('authenticate');

//      var extraParams = $scope.askApproval ? {approval_prompt: 'force'} : {};
//      Token.getTokenByPopup(extraParams)
//        .then(function(params) {
//          // Success getting token from popup.
//
//          // Verify the token before setting it, to avoid the confused deputy problem.
//          Token.verifyAsync(params.access_token).
//            then(function(data) {
//              console.log('verifyAsync');
//              $scope.accessToken = params.access_token;
//              $scope.expiresIn = params.expires_in;
//
//              Token.set(params.access_token);
//            }, function() {
//              alert("Failed to verify token.")
//            });
//
//        }, function() {
//          // Failure getting token from popup.
//          alert("Failed to get token from popup.");
//        });
    };




  });
