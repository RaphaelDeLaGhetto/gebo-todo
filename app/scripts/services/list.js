'use strict';

angular.module('geboClientApp')
  .factory('List', function () {

    /**
     * List
     */
    var List = function(description, owner) {
        this.description = description;
        this.owner = owner;
        this.date = new Date();
        this.watchers = [];
        this.todos = [];

        /**
         * Add a watcher to the list
         *
         * @param user
         */
        this.watch = function(user) {
            this.watchers.push(user);
          };

        /**
         * Add a todo to the list
         *
         * @param Todo
         */
        this.add = function(description, owner) {
            this.todos.push(new Todo(description, owner));
          };

        /**
         * Remove a todo to the list
         *
         * @param int
         */
        this.destroy = function(index) {
            if (index < 0 || index >= this.todos.length) {
              return;
            }
            this.todos.splice(index, 1);
          };

        /**
         * Set a todo as completed
         *
         * @param int
         */
        this.completeTodo = function(index) {
            if (index < 0 || index >= this.todos.length) {
              return;
            }
            this.todos[index].complete();
          };

        /**
         * Set a todo as abandoned
         *
         * @param int
         */
        this.abandonTodo = function(index) {
            if (index < 0 || index >= this.todos.length) {
              return;
            }
            this.todos[index].abandon();
          };

        /**
         * Reopen completed or abandoned todos
         *
         * @param int
         */
        this.reopenTodo = function(index) {
            if (index < 0 || index >= this.todos.length) {
              return;
            }
            this.todos[index].reopen();
          };

        /**
         * Add a note to a todo 
         *
         * @param string
         * @param string
         */
        this.makeNote = function(index, content, owner) {
            if (index < 0 || index >= this.todos.length) {
              return;
            }
            this.todos[index].makeNote(content, owner);
          };

        /**
         * Remove a note from a todo 
         *
         * @param int 
         * @param int
         */
        this.destroyNote = function(todoIndex, noteIndex) {
            if (todoIndex < 0 || todoIndex >= this.todos.length) {
              return;
            }
            this.todos[todoIndex].destroyNote(noteIndex);
          };

        /**
         * Flag a note as irrelevant 
         *
         * @param int
         */
        this.strikeNote = function(todoIndex, noteIndex) {
            if (todoIndex < 0 || todoIndex >= this.todos.length) {
              return;
            }
            this.todos[todoIndex].strikeNote(noteIndex);
          };

        /**
         * Flag a note as relevant 
         *
         * @param int
         */
        this.unstrikeNote = function(todoIndex, noteIndex) {
            if (todoIndex < 0 || todoIndex >= this.todos.length) {
              return;
            }
            this.todos[todoIndex].unstrikeNote(noteIndex);
          };

        /**
         * Assign a user to a todo
         *
         * @param int
         * @param Object
         */
        this.assignTodo = function(todoIndex, user) {
            if (todoIndex < 0 || todoIndex >= this.todos.length) {
              return;
            }
            this.todos[todoIndex].assign(user);
          };

        /**
         * Relieve a user of todo responsibilities
         *
         * @param int
         * @param int
         */
        this.relieveTodo = function(todoIndex, assigneeIndex) {
            if (todoIndex < 0 || todoIndex >= this.todos.length) {
              return;
            }
            this.todos[todoIndex].relieve(assigneeIndex);
          };


      };

    /**
     * Todo
     */
    var Todo = function(description, owner) {
        this.description = description;
        this.owner = owner;
        this.assignees = [];
        this.date = new Date();
        this.deadline =  null;
        this.completed = null;
        this.abandoned = null;
        this.notes = [];

        /**
         * Add a note to the notes list
         *
         * @param string
         * @param string
         */
        this.makeNote = function(content, owner) {
            this.notes.push(new Note(content, owner));
          };

        /**
         * Remove a note from the notes list
         *
         * @param int
         */
        this.destroyNote = function(index) {
            if (index < 0 || index >= this.notes.length) {
              return;
            }
            this.notes.splice(index, 1);
          };

        /**
         * Flag a note as irrelevant 
         *
         * @param int
         */
        this.strikeNote = function(index) {
            if (index < 0 || index >= this.notes.length) {
              return;
            }
            this.notes[index].strike();
          };

        /**
         * Flag a note as relevant 
         *
         * @param int
         */
        this.unstrikeNote = function(index) {
            if (index < 0 || index >= this.notes.length) {
              return;
            }
            this.notes[index].unstrike();
          };


        /**
         * Set the date this todo was completed
         */
        this.complete = function() {
            this.completed = new Date();
            this.abandoned = null;
          };

        /**
         * Set the date this todo was abandoned
         */
        this.abandon = function() {
            this.abandoned = new Date();
            this.completed = null;
          };

        /**
         * Clear the completed and abandoned dates
         */
        this.reopen = function() {
            this.abandoned = null;
            this.completed = null;
          };

        /**
         * Assign the task
         */
        this.assign = function(user) {
            this.assignees.push(user);
          };

        /**
         * Relieve an assigned user from task
         * responsibilities
         *
         * @params int
         */
        this.relieve = function(index) {
            if (index < 0 || index >= this.assignees.length) {
              return;
            }
            this.assignees.splice(index, 1);
          };
      };

    /**
     * Note
     */
    var Note = function(content, owner) {
        this.content = content;
        this.owner = owner;
        this.date = new Date();
        this.relevant = true;

        /**
         * Effectively deprecate this note
         */
        this.strike = function() {
            this.relevant = false;
          };

        /**
         * Make this note relevant again
         */
        this.unstrike = function() {
            this.relevant = true;
          };
      };

    /**
     * Public API here
     */
    return {
      getNewObject: function(description, owner) {
              return new List(description, owner);
            },
    };
  });
