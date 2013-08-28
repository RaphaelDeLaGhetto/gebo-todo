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
        if (!description) {
          return;
        }
        var list = List.getNewObject(description, Token.data());
        $scope.todoLists.push(list);
      };

    /**
     * Delete a todo list
     *
     * @param index
     */
    $scope.destroy = function(index) {
        if (!_inRange(index)) {
          return;
        }
        $scope.todoLists.splice(index, 1);
      };

    /**
     * Add a todo to a list
     *
     * @param int
     * @param string
     */
    $scope.addTodo = function(index, description) {
        if (!_inRange(index)) {
          return;
        }
        $scope.todoLists[index].add(description, Token.data());
      };

    /**
     * Remove a todo from a list
     *
     * @param int
     * @param int
     */
    $scope.destroyTodo = function(listIndex, todoIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].destroy(todoIndex);
      };

    /**
     * Mark a todo as complete
     *
     * @param int
     * @param int
     */
    $scope.completeTodo = function(listIndex, todoIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].completeTodo(todoIndex);
      };

    /**
     * Mark a todo as abandoned
     *
     * @param int
     * @param int
     */
    $scope.abandonTodo = function(listIndex, todoIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].abandonTodo(todoIndex);
      };

    /**
     * Remove a todo's status as completed or abandoned
     *
     * @param int
     * @param int
     */
    $scope.reopenTodo = function(listIndex, todoIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].reopenTodo(todoIndex);
      };

    /**
     * Attach a note to a todo
     *
     * @param int
     * @param int
     */
    $scope.makeNote = function(listIndex, todoIndex, content) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].makeNote(todoIndex, content, Token.data());
      };

    /**
     * Destroy a note on a todo
     *
     * @param int
     * @param int
     */
    $scope.destroyNote = function(listIndex, todoIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].destroyNote(todoIndex);
      };

    /**
     * Flag a note as irrelevant
     *
     * @param int
     * @param int
     * @param int
     */
    $scope.strikeNote = function(listIndex, todoIndex, noteIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].strikeNote(todoIndex, noteIndex);
      };

    /**
     * Flag a note as relevant
     *
     * @param int
     * @param int
     * @param int
     */
    $scope.unstrikeNote = function(listIndex, todoIndex, noteIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].unstrikeNote(todoIndex, noteIndex);
      };

    /**
     * Assign a user to a task
     * 
     * @param int
     * @param int
     * @param Object
     */
    $scope.assignTodo = function(listIndex, todoIndex, user) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].assignTodo(todoIndex, user);
      };

    /**
     * Relieve a user of a task
     * 
     * @param int
     * @param int
     * @param Object
     */
    $scope.relieveTodo = function(listIndex, todoIndex, assigneeIndex) {
        if (!_inRange(listIndex)) {
          return;
        }
        $scope.todoLists[listIndex].relieveTodo(todoIndex, assigneeIndex);
      };

    /**
     * Is the provided index in range?
     *
     * @param int
     *
     * @return bool
     */
    var _inRange = function(index) {
        if (index < 0 || index >= $scope.todoLists.length) {
          return false;
        }
        return true;
      };
  });
