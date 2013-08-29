'use strict';

angular.module('geboClientApp', ['ngResource', 'ui.bootstrap', 'ui.compat'])
    .config(function($stateProvider, $urlRouterProvider) {

        // For an unmatched URL
        $urlRouterProvider.otherwise('/');

        // States
        $stateProvider.
            state('home', {
                url: '/',
                templateUrl: 'views/main.html',
                controller: 'MainCtrl'
            }).
            state('token', {
                url: '/token',
                templateUrl: 'views/token.html',
                controller: 'MainCtrl'
            }).
            state('app', {
                url: '/app',
                templateUrl: 'views/app.html',
                controller: 'AppCtrl'
            }).
            state('app.lists', {
                templateUrl: 'views/app.lists.html'
            });

     });
//  .config(function ($routeProvider) {
//    $routeProvider
//      .when('/', {
//        templateUrl: 'views/main.html',
//        controller: 'MainCtrl'
//      })
//      .when('/token', {
//        templateUrl: 'views/token.html',
//        controller: 'MainCtrl'
//      })
//      .when('/app', {
//        templateUrl: 'views/app.html',
//        controller: 'AppCtrl'
//      })
//      .otherwise({
//        redirectTo: '/'
//      });
//  });

