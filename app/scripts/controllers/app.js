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
    $scope.destroy = function(index) {
        if (index < 0 || index > $scope.todoLists.length - 1) {
          return;
        }
        $scope.todoLists.splice(index, 1);
      };

    /**
     * Add a todo to a list
     *
     * @param listIndex
     * @param description
     */
    $scope.addTodo = function(index, description) {
        if (index < 0 || index > $scope.todoLists.length - 1) {
          return;
        }
 
      };
  });
