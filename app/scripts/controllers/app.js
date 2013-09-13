'use strict';

angular.module('geboClientApp')
  .controller('AppCtrl', function ($scope, List, Token) {

    /**
     * The table of contents (so we don't have to 
     * download everything all at once
     */
    $scope.tableOfContents = [];

    /**
     * The list of todo lists
     */
    $scope.todoLists = {};

    $scope.init = function() {
        Token.ls().
          then(function(data) {
                $scope.tableOfContents = data;
              });
      };

    /**
     * Create a new todo list
     */
    $scope.create = function() {
        if (!$scope.name) {
          return;
        }
        var list = List.getNewObject($scope.name, Token.data());

        Token.save(list).then(function(savedList) {
            $scope.todoLists[savedList._id] = savedList;
            $scope.name = '';
            $scope.init();
          });
      };

    /**
     * Copy a todo list from the server
     */
    $scope.cp = function(index) {
        if (!_inRange(index)) {
          return;
        }

        var copyId = $scope.tableOfContents[index]._id;
        Token.cp(copyId).then(function(copiedList) {
            $scope.todoLists[copyId] = List.restoreObject(copiedList);
          });
      };

    /**
     * Remove a todo list
     *
     * @param index
     */
    $scope.rm = function(index) {
        if (!_inRange(index)) {
          return;
        }
        var removeId = $scope.tableOfContents[index]._id;
        Token.rm(removeId).then(function() {
            $scope.tableOfContents.splice(index, 1);
            delete $scope.todoLists[removeId];
          });
      };

    /**
     * Add a todo to a list
     *
     * @param int
     * @param string
     */
    $scope.addTodo = function(index) {
        if (!_inRange(index) || !$scope.todoDescription) {
          return;
        }
        var id = $scope.tableOfContents[index]._id;
        $scope.todoLists[id].add($scope.todoDescription, Token.data());

        Token.save($scope.todoLists[id]).then(function() {
            $scope.todoDescription = '';
          });
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].destroy(todoIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].completeTodo(todoIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].abandonTodo(todoIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].reopenTodo(todoIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].makeNote(todoIndex, content, Token.data());
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].destroyNote(todoIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].strikeNote(todoIndex, noteIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].unstrikeNote(todoIndex, noteIndex);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].assignTodo(todoIndex, user);
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
        var id = $scope.tableOfContents[listIndex]._id;
        $scope.todoLists[id].relieveTodo(todoIndex, assigneeIndex);
      };

    /**
     * Is the provided index in range?
     *
     * @param int
     *
     * @return bool
     */
    var _inRange = function(index) {
        if (index < 0 ||
            index >= $scope.tableOfContents.length) {
          return false;
        }
        return true;
      };
  });
