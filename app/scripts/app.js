'use strict';

angular.module('geboClientApp', ['ngResource', 'ui.bootstrap', 'ui.compat']).
    run(['$rootScope', '$state', '$stateParams',
                    function($rootScope, $state, $stateParams) {
                        $rootScope.$state = $state;
                        $rootScope.$stateParams = $stateParams;
                      }]).
    config(function($stateProvider, $urlRouterProvider, $httpProvider) {

        // Enable CORS
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];

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
            url: '/lists',
            templateUrl: 'views/app.lists.html',
          }).
          state('app.lists.todos', {
            url: '/todos',
            templateUrl: 'views/app.lists.todos.html'
          }).
          state('app.lists.todos.details', {
            url: '/details',
            templateUrl: 'views/app.lists.todos.details.html'
          });
      });

