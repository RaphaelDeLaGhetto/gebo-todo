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
            this.todos.splice(index, 1);
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
            this.assignees.push(user)
          };

        /**
         * Relieve an assigned user from task
         * responsibilities
         *
         * @params int
         */
        this.relieve = function(index) {
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
