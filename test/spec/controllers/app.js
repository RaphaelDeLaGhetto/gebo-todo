'use strict';

describe('Controller: AppCtrl', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 

    var VERIFICATION_DATA = {
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            };

    // load the controller's module
    beforeEach(module('geboClientApp'));

    var AppCtrl,
        List,
        Token,
        scope,
        $httpBackend;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($injector, $controller, $rootScope) {
        scope = $rootScope.$new();
        List = $injector.get('List');
        Token = $injector.get('Token');

        AppCtrl = $controller('AppCtrl', {
            $scope: scope,
            List: List,
            Token: Token,
        });

        $httpBackend = $injector.get('$httpBackend');

        $httpBackend.when('GET', VERIFICATION_ENDPOINT +
                '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);

        Token.setParams({
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationEndpoint: AUTHORIZATION_ENDPOINT,
          verificationEndpoint: VERIFICATION_ENDPOINT,
          localStorageName: 'accessToken',
          scopes: SCOPES
        });

        spyOn(Token, 'data').andCallFake(function(key) {
            return VERIFICATION_DATA;
        });
    }));

    it('should attach a todo list object to the scope', function () {
        expect(scope.todoLists.length).toBe(0);
    });

    /**
     * create
     */
    describe('create', function() {
        beforeEach(function() {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 
            Token.verifyAsync(ACCESS_TOKEN);
            $httpBackend.flush();
        });

        it('should add a new todo list to the list of todos', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.create('a new list'); 
            expect(scope.todoLists.length).toBe(1);
            expect(scope.todoLists[0].description).toBe('a new list');
            expect(scope.todoLists[0].owner.name).toEqual(VERIFICATION_DATA.name);
            expect(scope.todoLists[0].owner.email).toEqual(VERIFICATION_DATA.email);
            expect(scope.todoLists[0].owner.id).toEqual(VERIFICATION_DATA.id);
            expect(scope.todoLists[0].owner.scopes).toEqual(VERIFICATION_DATA.scopes);
        });

        it('should not add a new todo list if no description is supplied', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.create(''); 
            expect(scope.todoLists.length).toBe(0);
        });
    });

    /**
     * destroy
     */
    describe('destroy', function() {
        it('should remove the todo list from the list of todos', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.create('a new list'); 
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
        });

        it('should not be bothered by out-of-bound indicies', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.create('a new list'); 
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(2);
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(-1);
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
        });
    });

    /**
     * addTodo
     */
    describe('addTodo', function() {

        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);
            expect(scope.todoLists[0].todos.length).toBe(0);
            expect(scope.todoLists[1].todos.length).toBe(0);
         });

        it('should add a todo to the given list', function() {
            scope.addTodo(0, 'Do this first');
            expect(scope.todoLists[0].todos.length).toBe(1);
            expect(scope.todoLists[0].todos[0].description).toBe('Do this first');
            expect(scope.todoLists[0].todos[0].owner).toEqual(VERIFICATION_DATA);
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);

            scope.addTodo(1, 'Do this first');
            expect(scope.todoLists[1].todos.length).toBe(1);
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
         });

         it('should not be bothered by out-of-range indicies', function() {
            scope.addTodo(3, 'Do this first');
            expect(scope.todoLists[3]).toBe(undefined);
            scope.addTodo(-1, 'Do this next');
            expect(scope.todoLists[-1]).toBe(undefined);
         });
     });

    /**
     * destroyTodo
     */
    describe('destroyTodo', function() {

        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
         });


        it('should remove a todo from the given list', function() {
            scope.destroyTodo(0, 1);
            expect(scope.todoLists[0].todos.length).toBe(1);
            scope.destroyTodo(0, 0);
            expect(scope.todoLists[0].todos.length).toBe(0);
            scope.destroyTodo(1, 1);
            expect(scope.todoLists[1].todos.length).toBe(1);
            scope.destroyTodo(1, 0);
            expect(scope.todoLists[1].todos.length).toBe(0);
        });

        it('should not be bothered by out-of-range indicies', function() {
            scope.destroyTodo(0, 3);
            expect(scope.todoLists[0].todos[3]).toBe(undefined);
            scope.destroyTodo(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
         });
     });

    /**
     * completeTodo
     */
    describe('completeTodo', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
        });

        it('should mark a todo as completed on the given list', function() {
            expect(scope.todoLists[0].todos[0].completed).toBe(null);
            expect(scope.todoLists[0].todos[0].abandoned).toBe(null);
            scope.completeTodo(0, 0);
            expect(scope.todoLists[0].todos[0].completed).toBeCloseTo(new Date());
            expect(scope.todoLists[0].todos[0].abandoned).toBe(null);
        });
    });

    /**
     * abandonTodo
     */
    describe('abandonTodo', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
        });

        it('should mark a todo as abandoned on the given list', function() {
            expect(scope.todoLists[1].todos[1].abandoned).toBe(null);
            scope.abandonTodo(1, 1);
            expect(scope.todoLists[1].todos[1].abandoned).toBeCloseTo(new Date());
        });

        it('should not be bothered by out-of-bound indicies', function() {
            scope.abandonTodo(1, 2);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.abandonTodo(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.abandonTodo(2, 2);
            expect(scope.todoLists[2]).toBe(undefined);
          });
     });

    /**
     * reopenTodo
     */
    describe('reopenTodo', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
        });

        it('should nullify a todo\'s completed status', function() {
            scope.completeTodo(0, 1);
            expect(scope.todoLists[0].todos[1].completed).toBeCloseTo(new Date());
            scope.reopenTodo(0, 1);
            expect(scope.todoLists[0].todos[1].completed).toBe(null);
        });

        it('should nullify a todo\'s abandoned status', function() {
            scope.abandonTodo(0, 1);
            expect(scope.todoLists[0].todos[1].abandoned).toBeCloseTo(new Date());
            scope.reopenTodo(0, 1);
            expect(scope.todoLists[0].todos[1].abandoned).toBe(null);
        });
     });


    /**
     * makeNote
     */
    describe('makeNote', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
        });

        it('should attach a note to a todo', function() {
            expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
            scope.makeNote(1, 1, 'Should I push this back?');

            expect(scope.todoLists[1].todos[1].notes.length).toBe(1);
            expect(scope.todoLists[1].todos[1].notes[0].content).toBe(
                    'Should I push this back?');
            expect(scope.todoLists[1].todos[1].notes[0].date).toBeCloseTo(new Date());
            expect(scope.todoLists[1].todos[1].notes[0].owner).toEqual(VERIFICATION_DATA);
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(true);
        });
    });

    /**
     * destroyNote
     */
    describe('destroyNote', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);

            expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
            scope.makeNote(1, 1, 'Should I push this back?');
            expect(scope.todoLists[1].todos[1].notes.length).toBe(1);
         });

        it('should remove a note from a todo', function() {
            scope.destroyNote(1, 1);
            expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
        });

        it('should ignore out-of-bound indices', function() {
            scope.destroyNote(1, 2);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.destroyNote(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.destroyNote(2, 0);
            expect(scope.todoLists[2]).toBe(undefined);
         });
     });

    /**
     * strikeNote
     */
    describe('strikeNote', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);

            expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
            scope.makeNote(1, 1, 'Should I push this back?');
            expect(scope.todoLists[1].todos[1].notes.length).toBe(1);
         });

        it('should mark a note as relevant===false', function() {
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(true);
            scope.strikeNote(1, 1, 0);
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(false);
        });

        it('should ignore out-of-bound indices', function() {
            scope.strikeNote(1, 1, 1);
            expect(scope.todoLists[1].todos[1].notes[1]).toBe(undefined);
            scope.strikeNote(1, 1, -1);
            expect(scope.todoLists[1].todos[1].notes[-1]).toBe(undefined);
            scope.strikeNote(1, 2, 0);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.strikeNote(1, -1, 0);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.strikeNote(2, 0, 0);
            expect(scope.todoLists[2]).toBe(undefined);
            scope.strikeNote(-1, 0, 0);
            expect(scope.todoLists[-1]).toBe(undefined);
         });
    });

    /**
     * unstrikeNote
     */
    describe('unstrikeNote', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);

            expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
            scope.makeNote(1, 1, 'Should I push this back?');
            expect(scope.todoLists[1].todos[1].notes.length).toBe(1);
         });

        it('should mark a note as relevant===true', function() {
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(true);
            scope.strikeNote(1, 1, 0);
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(false);
            scope.unstrikeNote(1, 1, 0);
            expect(scope.todoLists[1].todos[1].notes[0].relevant).toBe(true);
        });

        it('should ignore out-of-bound indices', function() {
            scope.unstrikeNote(1, 1, 1);
            expect(scope.todoLists[1].todos[1].notes[1]).toBe(undefined);
            scope.unstrikeNote(1, 1, -1);
            expect(scope.todoLists[1].todos[1].notes[-1]).toBe(undefined);
            scope.unstrikeNote(1, 2, 0);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.unstrikeNote(1, -1, 0);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.unstrikeNote(2, 0, 0);
            expect(scope.todoLists[2]).toBe(undefined);
            scope.unstrikeNote(-1, 0, 0);
            expect(scope.todoLists[-1]).toBe(undefined);
        });
     });

    /**
     * assignTodo
     */
    describe('assignTodo', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);
         });

        it('should assign a user to the task', function() {
            expect(scope.todoLists[0].todos[0].assignees.length).toBe(0);
            scope.assignTodo(0, 0, VERIFICATION_DATA);
            expect(scope.todoLists[0].todos[0].assignees.length).toBe(1);
            expect(scope.todoLists[0].todos[0].assignees[0].name).toBe('dan');
        });

        it('should ignore out-of-bound indices', function() {
            scope.assignTodo(0, 2, VERIFICATION_DATA);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.assignTodo(0, -1, VERIFICATION_DATA);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.assignTodo(2, 0, VERIFICATION_DATA);
            expect(scope.todoLists[2]).toBe(undefined);
            scope.assignTodo(-1, 0, VERIFICATION_DATA);
            expect(scope.todoLists[-1]).toBe(undefined);
          });
     });

    /**
     * relieveTodo
     */
    describe('relieveTodo', function() {
        beforeEach(function() {
            scope.create('a new list'); 
            scope.create('another new list'); 
            expect(scope.todoLists.length).toBe(2);

            scope.addTodo(0, 'Do this first');
            scope.addTodo(0, 'Do this next');
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.addTodo(1, 'Do this first');
            scope.addTodo(1, 'Do this next');
            expect(scope.todoLists[1].todos.length).toBe(2);

            expect(scope.todoLists[0].todos[0].assignees.length).toBe(0);
            scope.assignTodo(0, 0, VERIFICATION_DATA);
            expect(scope.todoLists[0].todos[0].assignees.length).toBe(1);
          });

        it('should remove a user from the task', function() {
            scope.relieveTodo(0, 0, 0);
            expect(scope.todoLists[0].todos[0].assignees.length).toBe(0);
            expect(scope.todoLists[0].todos[0].assignees[0]).toBe(undefined);
        });

        it('should ignore out-of-bound indices', function() {
            scope.relieveTodo(0, 2, VERIFICATION_DATA);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.relieveTodo(0, -1, VERIFICATION_DATA);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.relieveTodo(2, 0, VERIFICATION_DATA);
            expect(scope.todoLists[2]).toBe(undefined);
            scope.relieveTodo(-1, 0, VERIFICATION_DATA);
            expect(scope.todoLists[-1]).toBe(undefined);
        });
     });


});

