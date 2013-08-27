'use strict';

angular.module('geboClientApp', ['ngResource'])
  .config(function ($routeProvider) {
    $routeProvider
      .when('/', {
        templateUrl: 'views/main.html',
        controller: 'MainCtrl'
      })
      .when('/token', {
        templateUrl: 'views/token.html',
        controller: 'MainCtrl'
      })
      .when('/app', {
        templateUrl: 'views/app.html',
        controller: 'AppCtrl'
      })
      .otherwise({
        redirectTo: '/'
      });
  });

