'use strict';

describe('Controller: AppCtrl', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        SAVE_ENDPOINT = 'http://theirhost.com/api/save',
        LS_DATA_ENDPOINT = 'http://theirhost.com/api/ls',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 

    var VERIFICATION_DATA = {
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            },
        PUT_SUCCESS = { success: true },
        DATA_TO_SAVE; // Defined in beforeEach

    // load the controller's module
    beforeEach(module('geboClientApp'));

    var AppCtrl,
        List,
        Token,
        scope,
        state,
        $httpBackend,
        rootScope,
        $q,
        expectedUnsavedData;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($injector, $controller, $rootScope) {
        rootScope = $rootScope;
        scope = $rootScope.$new();
        List = $injector.get('List');
        Token = $injector.get('Token');
        state = $injector.get('$state');
        $q = $injector.get('$q');

        /**
         * Set up Token before injecting an AppCtrl
         */
        Token.setParams({
          clientId: CLIENT_ID,
          redirectUri: REDIRECT_URI,
          authorizationEndpoint: AUTHORIZATION_ENDPOINT,
          verificationEndpoint: VERIFICATION_ENDPOINT,
          saveEndpoint: SAVE_ENDPOINT,
          lsDataEndpoint: LS_DATA_ENDPOINT,
          localStorageName: 'accessToken',
          scopes: SCOPES
        });

        /**
         * Inject an AppCtrl
         */
        AppCtrl = $controller('AppCtrl', {
            $scope: scope,
            List: List,
            Token: Token,
            $state: state,
        });

        /**
         * $http
         */
        $httpBackend = $injector.get('$httpBackend');

        $httpBackend.when('GET', VERIFICATION_ENDPOINT +
                '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);

        /**
         * PUTS with different DATA_TO_SAVE (cloned and modified)
         */
        DATA_TO_SAVE = List.getNewObject('a new list', VERIFICATION_DATA);
        DATA_TO_SAVE.date = 'Today';

//        $httpBackend.whenPUT(SAVE_ENDPOINT, {
//            access_token: ACCESS_TOKEN,
//            data: DATA_TO_SAVE
//        }).respond(PUT_SUCCESS);
//
//        DATA_TO_SAVE = List.getNewObject('another new list', VERIFICATION_DATA);
//        DATA_TO_SAVE.date = 'Today';
//        $httpBackend.whenPUT(SAVE_ENDPOINT, {
//            access_token: ACCESS_TOKEN,
//            data: DATA_TO_SAVE
//        }).respond(PUT_SUCCESS);

        /**
         * Most of the tests below require the creation
         * of a todo list
         */
        expectedUnsavedData = angular.copy(DATA_TO_SAVE);
        expectedUnsavedData.description = 'My new list';
        expectedUnsavedData.access_token = ACCESS_TOKEN;

        var savedData = angular.copy(expectedUnsavedData);
        savedData.id = '1a2b3c';

        $httpBackend.whenPOST(SAVE_ENDPOINT, expectedUnsavedData).
                respond(angular.copy(savedData));
 

        /**
         * Spies
         */
        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return ACCESS_TOKEN;
        });

        spyOn(Token, 'data').andCallFake(function(key) {
            return VERIFICATION_DATA;
        });

        spyOn(List, 'getNewObject').andCallFake(function(description, user) {
            var data = angular.copy(DATA_TO_SAVE);
            data.description = description;
            return data;
        });

        // ui-router needs this for some reason. Not
        // sure what's happening
        $httpBackend.when('GET', 'views/main.html').respond({});
        $httpBackend.when('GET', 'views/app.html').respond({});
    }));

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should attach a todo list object to the scope', function () {
        expect(scope.todoLists.length).toBe(0);
    });

    /**
     * create
     */
    describe('create', function() {

        it('should add a new todo list to the list of todos', function() {
            var data = angular.copy(DATA_TO_SAVE);
            data.description = 'My new list';

            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedUnsavedData);

            expect(scope.todoLists.length).toBe(0);

            scope.description = 'My new list';
            scope.create(); 

            $httpBackend.flush();

            expect(scope.description).toBe('');
            expect(scope.todoLists.length).toBe(1);
            expect(scope.todoLists[0].id).toBe('1a2b3c');
            expect(scope.todoLists[0].description).toBe('My new list');
            expect(scope.todoLists[0].owner.name).toEqual(VERIFICATION_DATA.name);
            expect(scope.todoLists[0].owner.email).toEqual(VERIFICATION_DATA.email);
            expect(scope.todoLists[0].owner.id).toEqual(VERIFICATION_DATA.id);
            expect(scope.todoLists[0].owner.scopes).toEqual(VERIFICATION_DATA.scopes);

            expect(localStorage.getItem).toHaveBeenCalled();
            expect(List.getNewObject).toHaveBeenCalled();
        });

        it('should not add a new todo list if no description is supplied', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.description = '';
            scope.create(); 
            expect(scope.todoLists.length).toBe(0);
        });
    });

    /**
     * destroy
     */
    describe('destroy', function() {

        var expectedData,
            savedData;

        beforeEach(function() {
            // For the first new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.description = 'a new list';
            expectedData.access_token = ACCESS_TOKEN;

            savedData = angular.copy(expectedData)
            savedData.id = 'abc';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

            // For the second new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.description = 'another new list';
            expectedData.access_token = ACCESS_TOKEN;
            savedData = angular.copy(expectedData)
            savedData.id = '123';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

 
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
  
            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(2);
            expect(scope.todoLists[0].id).toBe('abc');
            expect(scope.todoLists[1].id).toBe('123');
        });

        it('should remove the todo list from the lists of todos', function() {
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedUnsavedData);

            expect(scope.todoLists.length).toBe(2);

            scope.destroy(0);

//            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
        });

        it('should not barf if removing a todo list from an empty list', function() {
            expect(scope.todoLists.length).toBe(2);
            scope.destroy(1);
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
        });

        it('should not be bothered by out-of-bound indicies', function() {
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

            expect(scope.todoLists.length).toBe(2);
            scope.description = 'another new list';
            scope.create();

            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(3);

            scope.destroy(2);
            expect(scope.todoLists.length).toBe(2);
            scope.destroy(-1);
            expect(scope.todoLists.length).toBe(2);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(1);
        });
    });

    /**
     * CRUDdy List operations
     */
    describe('CRUDdy List operations', function() {

        var expectedData, 
            savedData;

        beforeEach(function() {
            // For the first new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.description = 'a new list';
            expectedData.access_token = ACCESS_TOKEN;

            savedData = angular.copy(expectedData)
            savedData.id = 'abc';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

            // For the second new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.description = 'another new list';
            expectedData.access_token = ACCESS_TOKEN;
            savedData = angular.copy(expectedData)
            savedData.id = '123';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 

            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(2);

            expect(scope.todoLists[0].todos.length).toBe(0);
            expect(scope.todoLists[0].description).toBe('a new list');
            expect(scope.todoLists[0].id).toBe('abc');

            expect(scope.todoLists[1].todos.length).toBe(0);
            expect(scope.todoLists[1].description).toBe('another new list');
            expect(scope.todoLists[1].id).toBe('123');
         });

    /**
     * addTodo
     */
    describe('addTodo', function() {

//        beforeEach(function() {

            // NOTE: it looks like these $httpBackend
            // expectations need to be declared in the
            // order they're expect. Not sure, but
            // reordering got the tests to pass

            // For the first new list
//            var expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'a new list';
//            expectedData.access_token = ACCESS_TOKEN;
//
//            var savedData = angular.copy(expectedData)
//            savedData.id = 'abc';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);
//
//            // For the second new list
//            expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'another new list';
//            expectedData.access_token = ACCESS_TOKEN;
//            savedData = angular.copy(expectedData)
//            savedData.id = '123';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
//
//            $httpBackend.flush();
//            expect(scope.todoLists.length).toBe(2);
//
//            expect(scope.todoLists[0].todos.length).toBe(0);
//            expect(scope.todoLists[0].description).toBe('a new list');
//
//            expect(scope.todoLists[1].todos.length).toBe(0);
//            expect(scope.todoLists[1].description).toBe('another new list');
//       });

       it('should add a todo to the given list', function() {
            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            expect(scope.todoDescription).toBe('');
            expect(scope.todoLists[0].todos.length).toBe(1);
            expect(scope.todoLists[0].todos[0].description).toBe('Do this first');
            expect(scope.todoLists[0].todos[0].owner).toEqual(VERIFICATION_DATA);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoDescription).toBe('');
            expect(scope.todoLists[0].todos.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            expect(scope.todoDescription).toBe('');
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
            expect(scope.todoDescription).toBe('');
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
            // For the first new list
//            var expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'a new list';
//            expectedData.access_token = ACCESS_TOKEN;
//
//            var savedData = angular.copy(expectedData)
//            savedData.id = 'abc';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);
//
//            // For the second new list
//            expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'another new list';
//            expectedData.access_token = ACCESS_TOKEN;
//            savedData = angular.copy(expectedData)
//            savedData.id = '123';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);
//
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
//
//            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
            // For the first new list
//            var expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'a new list';
//            expectedData.access_token = ACCESS_TOKEN;
//
//            var savedData = angular.copy(expectedData)
//            savedData.id = 'abc';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);
//
//            // For the second new list
//            expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'another new list';
//            expectedData.access_token = ACCESS_TOKEN;
//            savedData = angular.copy(expectedData)
//            savedData.id = '123';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
//
//            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
            // For the first new list
//            var expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'a new list';
//            expectedData.access_token = ACCESS_TOKEN;
//
//            var savedData = angular.copy(expectedData)
//            savedData.id = 'abc';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);
//
//            // For the second new list
//            expectedData = angular.copy(DATA_TO_SAVE);
//            expectedData.description = 'another new list';
//            expectedData.access_token = ACCESS_TOKEN;
//            savedData = angular.copy(expectedData)
//            savedData.id = '123';
//            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
//
//            $httpBackend.flush();
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
//            scope.description = 'a new list';
//            scope.create(); 
//            scope.description = 'another new list';
//            scope.create(); 
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);
            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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
            expect(scope.todoLists.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(0);
            scope.todoDescription = 'Do this next';
            scope.addTodo(0);
            expect(scope.todoLists[0].todos.length).toBe(2);

            scope.todoDescription = 'Do this first';
            scope.addTodo(1);
            scope.todoDescription = 'Do this next';
            scope.addTodo(1);
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

    /**
     * init
     */
    describe('init', function() {
        beforeEach(function() {
            $httpBackend.whenGET(LS_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN).
                    respond([VERIFICATION_DATA, VERIFICATION_DATA]);
         });

        it('should list the app\'s documents', function() {
            $httpBackend.expectGET(LS_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN);

            expect(scope.todoLists.length).toBe(0);

            scope.init();

            $httpBackend.flush();
            
            expect(scope.todoLists.length).toBe(2);
            expect(scope.todoLists[0].id).toBe('1');
            expect(scope.todoLists[0].name).toBe('dan');
            expect(scope.todoLists[0].email).toBe('dan@email.com');
            expect(scope.todoLists[0].scope).toEqual(['*']);

            expect(scope.todoLists[1].id).toBe('1');
            expect(scope.todoLists[1].name).toBe('dan');
            expect(scope.todoLists[1].email).toBe('dan@email.com');
            expect(scope.todoLists[1].scope).toEqual(['*']);

        });

    });
});

