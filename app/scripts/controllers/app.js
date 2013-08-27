'use strict';

angular.module('geboClientApp')
  .controller('AppCtrl', function ($scope, List, Token) {

    /**
     * The list of todo lists
     */
    $scope.todoLists = [];

    /**
     * Create a new todo list
     */
    $scope.create = function(description) {
        var list = List.getNewObject(description, Token.data());
        $scope.todoLists.push(list);
      };

    /**
     * Delete a todo list
     *
     * @param index
     */
    $scope.delete = function(index) {
        delete $scope.todoLists[index];
      };


  });
