'use strict';

describe('Controller: AppCtrl', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        SAVE_ENDPOINT = 'http://theirhost.com/api/save',
        LS_DATA_ENDPOINT = 'http://theirhost.com/api/ls',
        CP_DATA_ENDPOINT = 'http://theirhost.com/api/cp',
        RM_DATA_ENDPOINT = 'http://theirhost.com/api/rm',
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
          cpDataEndpoint: CP_DATA_ENDPOINT,
          rmDataEndpoint: RM_DATA_ENDPOINT,
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

        /**
         * Most of the tests below require the creation
         * of a todo list
         */
        expectedUnsavedData = angular.copy(DATA_TO_SAVE);
        expectedUnsavedData.name = 'My new list';
        expectedUnsavedData.access_token = ACCESS_TOKEN;

        var savedData = angular.copy(expectedUnsavedData);
        savedData.id = '1';

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

        spyOn(List, 'getNewObject').andCallFake(function(name, user) {
            var data = angular.copy(DATA_TO_SAVE);
            data.name = name;
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

    it('should attach a table of contents list to the scope', function () {
        expect(scope.tableOfContents.length).toBe(0);
    });

    /**
     * create
     */
    describe('create', function() {

        var savedData;

        beforeEach(function() {
            savedData = angular.copy(expectedUnsavedData)
            savedData._id = '1';

            $httpBackend.whenGET(LS_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN).
                respond([{ _id: '1', name: expectedUnsavedData.name }]);
        });

        it('should add a new todo list to the todo associative array', function() {

            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedUnsavedData).respond(savedData);
            $httpBackend.expectGET(LS_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN);

            expect(Object.keys(scope.todoLists).length).toBe(0);

            scope.name = 'My new list';
            scope.create(); 

            $httpBackend.flush();
            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            expect(scope.name).toBe('');

            expect(scope.tableOfContents.length).toBe(1);
            var id = scope.tableOfContents[0]._id;

            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.todoLists[id]._id).toBe('1');
            expect(scope.todoLists[id].name).toBe('My new list');
            expect(scope.todoLists[id].owner.name).toEqual(VERIFICATION_DATA.name);
            expect(scope.todoLists[id].owner.email).toEqual(VERIFICATION_DATA.email);
            expect(scope.todoLists[id].owner.id).toEqual(VERIFICATION_DATA.id);
            expect(scope.todoLists[id].owner.scopes).toEqual(VERIFICATION_DATA.scopes);

            expect(localStorage.getItem).toHaveBeenCalled();
            expect(List.getNewObject).toHaveBeenCalled();
        });

        it('should not add a new todo list if no name is supplied', function() {
            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
            scope.name = '';
            scope.create(); 
            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
        });
    });

    /**
     * cp
     */
    describe('cp', function() {
        beforeEach(function() {
            $httpBackend.whenGET(CP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&id=1').
                respond(VERIFICATION_DATA);
 
            scope.tableOfContents = [ { _id: '1', name: 'word to your mom'} ]; });

        it('should copy a todo list from the server to the client', function() {
            $httpBackend.expectGET(CP_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN + '&id=1');
            scope.cp(0);
            $httpBackend.flush();

            expect(scope.todoLists['1'].id).toBe('1');
            expect(scope.todoLists['1'].name).toBe('dan');
            expect(scope.todoLists['1'].email).toBe('dan@email.com');
            expect(scope.todoLists['1'].scope).toEqual(['*']);
            expect(scope.todoLists['1'].watchers).toEqual([]);
            expect(scope.todoLists['1'].todos).toEqual([]);
        });
    });

    /**
     * rm
     */
    describe('rm', function() {

        var expectedData,
            savedData;

        beforeEach(function() {
            $httpBackend.whenGET(LS_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN).
                    respond([{ _id: '1', name: 'a new list' },
                             { _id: '2', name: 'another new list' }]);

            // For the first new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.name = 'a new list';
            expectedData.access_token = ACCESS_TOKEN;

            savedData = angular.copy(expectedData)
            savedData._id = '1';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

            // For the second new list
            expectedData = angular.copy(DATA_TO_SAVE);
            expectedData.name = 'another new list';
            expectedData.access_token = ACCESS_TOKEN;
            savedData = angular.copy(expectedData)
            savedData._id = '2';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData).respond(savedData);

 
            scope.name = 'a new list';
            scope.create(); 
            scope.name = 'another new list';
            scope.create(); 
  
            $httpBackend.flush();
            expect(Object.keys(scope.todoLists).length).toBe(2);
            expect(scope.tableOfContents.length).toBe(2);

            var id = scope.tableOfContents[0]._id;
            expect(scope.todoLists[id]._id).toBe('1');
            id = scope.tableOfContents[1]._id;
            expect(scope.todoLists[id]._id).toBe('2');
        });

        it('should remove the todo list from the lists of todos', function() {

            expect(Object.keys(scope.todoLists).length).toBe(2);
            expect(scope.tableOfContents.length).toBe(2);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=1&access_token=' + ACCESS_TOKEN).respond('Deleted');

            scope.rm(0);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=2&access_token=' + ACCESS_TOKEN).respond('Deleted');
            scope.rm(0);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
        });

        it('should not barf if removing a todo list from an empty list', function() {
            expect(Object.keys(scope.todoLists).length).toBe(2);
            expect(scope.tableOfContents.length).toBe(2);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=2&access_token=' + ACCESS_TOKEN).respond('Deleted');
            scope.rm(1);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=1&access_token=' + ACCESS_TOKEN).respond('Deleted');
            scope.rm(0);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
            scope.rm(0);
            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
        });

        it('should not be bothered by out-of-bound indicies', function() {
            expect(Object.keys(scope.todoLists).length).toBe(2);
            expect(scope.tableOfContents.length).toBe(2);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=2&access_token=' + ACCESS_TOKEN).respond('Deleted');
            scope.rm(1);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            scope.rm(-1);
            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            scope.rm(1);
            expect(Object.keys(scope.todoLists).length).toBe(1);
            expect(scope.tableOfContents.length).toBe(1);

            $httpBackend.expectDELETE(RM_DATA_ENDPOINT +
                    '?_id=1&access_token=' + ACCESS_TOKEN).respond('Deleted');
            scope.rm(0);
            $httpBackend.flush();

            expect(Object.keys(scope.todoLists).length).toBe(0);
            expect(scope.tableOfContents.length).toBe(0);
        });
    });

    /**
     * CRUDdy List operations
     */
    describe('CRUDdy List operations', function() {

        var expectedData1, 
            expectedData2, 
            savedData1,
            savedData2;

        beforeEach(function() {
            $httpBackend.whenGET(LS_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN).
                    respond([{ _id: '1', name: 'a new list' },
                             { _id: '2', name: 'another new list' }]);

            // For the first new list
            expectedData1 = angular.copy(DATA_TO_SAVE);
            expectedData1.name = 'a new list';
            expectedData1.access_token = ACCESS_TOKEN;

            savedData1 = angular.copy(expectedData1)
            savedData1._id = '1';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData1).respond(savedData1);

            // For the second new list
            expectedData2 = angular.copy(DATA_TO_SAVE);
            expectedData2.name = 'another new list';
            expectedData2.access_token = ACCESS_TOKEN;
            savedData2 = angular.copy(expectedData2)
            savedData2._id = '2';
            $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData2).respond(savedData2);

            scope.name = 'a new list';
            scope.create(); 
            scope.name = 'another new list';
            scope.create(); 

            $httpBackend.flush();
            expect(Object.keys(scope.todoLists).length).toBe(2);
            expect(scope.tableOfContents.length).toBe(2);

            var id = scope.tableOfContents[0]._id;
            expect(scope.todoLists[id].name).toBe('a new list');
            expect(scope.todoLists[id]._id).toBe('1');

            id = scope.tableOfContents[1]._id;
            expect(scope.todoLists[id].name).toBe('another new list');
            expect(scope.todoLists[id]._id).toBe('2');
         });

        /**
         * addTodo
         */
        describe('addTodo', function() {
    
            beforeEach(function() {
                // Reuse the expected data from the beforeEach
                expectedData1.todos = scope.todoLists['1'].todos;
                expectedData1._id = '1';

                expectedData2.todos = scope.todoLists['2'].todos;
                expectedData2._id = '2';
 
                // Add todos to the first list
                $httpBackend.whenPOST(SAVE_ENDPOINT, expectedData1).respond(savedData1);
   
                // Add todos to the second list
                $httpBackend.whenPOST(SAVE_ENDPOINT, expectedData2).respond(savedData2);
             });

            it('should add a todo to the given list', function() {
   
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData1);
                scope.todoDescription = 'Do this first';
                scope.addTodo(0);
                $httpBackend.flush();

                expect(scope.todoDescription).toBe('');

                var id = scope.tableOfContents[0]._id;
                expect(scope.todoLists[id].todos.length).toBe(1);
                expect(scope.todoLists[id].todos[0].description).toBe('Do this first');
                expect(scope.todoLists[id].todos[0].owner).toEqual(VERIFICATION_DATA);

                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData1);
                scope.todoDescription = 'Do this next';
                scope.addTodo(0);
                $httpBackend.flush();

                expect(scope.todoDescription).toBe('');
                expect(scope.todoLists[id].todos.length).toBe(2);
    
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData2);
                scope.todoDescription = 'Do this first';
                scope.addTodo(1);
                $httpBackend.flush();

                expect(scope.todoDescription).toBe('');

                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData2);
                scope.todoDescription = 'Do this next';
                scope.addTodo(1);
                $httpBackend.flush();

                expect(scope.todoDescription).toBe('');

                id = scope.tableOfContents[1]._id;
                expect(scope.todoLists[id].todos.length).toBe(2);
             });
    
             it('should not be bothered by out-of-range indicies', function() {
                scope.addTodo(3, 'Do this first');
                expect(scope.todoLists[3]).toBe(undefined);
                scope.addTodo(-1, 'Do this next');
                expect(scope.todoLists[-1]).toBe(undefined);
             });
         });
    
        /**
         * Todo operations
         */
        describe('Todo operations', function() {

            /**
             * Add some todos to work on
             */
            beforeEach(function() {
                expect(Object.keys(scope.todoLists).length).toBe(2);
        
    
                // Reuse the expected data from the beforeEach
                expectedData1.todos = scope.todoLists['1'].todos;
                expectedData1._id = '1';
    
                // Add todos to the first list
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData1).respond(savedData1);
                scope.todoDescription = 'Do this first';
                scope.addTodo(0);
                $httpBackend.flush();
    
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData1).respond(savedData1);
                scope.todoDescription = 'Do this next';
                scope.addTodo(0);
                $httpBackend.flush();
    
                var id = scope.tableOfContents[0]._id;
                expect(scope.todoLists[id].todos.length).toBe(2);
        
                // Reuse the expected data from the beforeEach
                expectedData2.todos = scope.todoLists['2'].todos;
                expectedData2._id = '2';
    
                // Add todos to the second list
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData2).respond(savedData2);
                scope.todoDescription = 'Do this first';
                scope.addTodo(1);
                $httpBackend.flush();
    
                scope.todoDescription = 'Do this next';
                $httpBackend.expectPOST(SAVE_ENDPOINT, expectedData2).respond(savedData2);
                scope.addTodo(1);
                $httpBackend.flush();
    
                id = scope.tableOfContents[1]._id;
                expect(scope.todoLists[id].todos.length).toBe(2);
        
           });

            /**
             * destroyTodo
             */
            describe('destroyTodo', function() {

                it('should remove a todo from the given list', function() {
                    scope.destroyTodo(0, 1);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos.length).toBe(1);
                    scope.destroyTodo(0, 0);
                    expect(scope.todoLists[id].todos.length).toBe(0);
    
                    id = scope.tableOfContents[1]._id;
                    scope.destroyTodo(1, 1);
                    expect(scope.todoLists[id].todos.length).toBe(1);
                    scope.destroyTodo(1, 0);
                    expect(scope.todoLists[id].todos.length).toBe(0);
                });
        
                it('should not be bothered by out-of-range indicies', function() {
                    scope.destroyTodo(0, 3);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[3]).toBe(undefined);
                    scope.destroyTodo(1, -1);
                    id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
                 });
             });
        
            /**
             * completeTodo
             */
            describe('completeTodo', function() {
       
                it('should mark a todo as completed on the given list', function() {
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[0].completed).toBe(null);
                    expect(scope.todoLists[id].todos[0].abandoned).toBe(null);
                    scope.completeTodo(0, 0);
                    expect(scope.todoLists[id].todos[0].completed).toBeCloseTo(new Date());
                    expect(scope.todoLists[id].todos[0].abandoned).toBe(null);
                });
            });
        
            /**
             * abandonTodo
             */
            describe('abandonTodo', function() {
        
                it('should mark a todo as abandoned on the given list', function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].abandoned).toBe(null);
                    scope.abandonTodo(1, 1);
                    expect(scope.todoLists[id].todos[1].abandoned).toBeCloseTo(new Date());
                });
        
                it('should not be bothered by out-of-bound indicies', function() {
                    scope.abandonTodo(1, 2);
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);
    
                    scope.abandonTodo(1, -1);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
    
                    expect(scope.abandonTodo(2, 2)).toBeUndefined();
    
                    // Left here as a reminder:
                    //
                    // The 2 key is treated the same as '2'. That's
                    // why that seen below is not undefined (to be clear, 
                    // tableOfContents[2] is still undefined, which is why
                    // the 2 was used as an index and not the id.
                    //
                    // id = scope.tableOfContents[2]._id;
                    // expect(scope.todoLists[2]).toBe(undefined);
                  });
             });
        
            /**
             * reopenTodo
             */
            describe('reopenTodo', function() {
       
                it('should nullify a todo\'s completed status', function() {
                    scope.completeTodo(0, 1);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[1].completed).toBeCloseTo(new Date());
                    scope.reopenTodo(0, 1);
                    expect(scope.todoLists[id].todos[1].completed).toBe(null);
                });
        
                it('should nullify a todo\'s abandoned status', function() {
                    scope.abandonTodo(0, 1);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[1].abandoned).toBeCloseTo(new Date());
                    scope.reopenTodo(0, 1);
                    expect(scope.todoLists[id].todos[1].abandoned).toBe(null);
                });
             });
        
        
            /**
             * makeNote
             */
            describe('makeNote', function() {

                it('should attach a note to a todo', function() {
                    expect(scope.todoLists[1].todos[1].notes.length).toBe(0);
                    scope.makeNote(1, 1, 'Should I push this back?');
        
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(1);
                    expect(scope.todoLists[id].todos[1].notes[0].content).toBe(
                            'Should I push this back?');
                    expect(scope.todoLists[id].todos[1].notes[0].date).toBeCloseTo(new Date());
                    expect(scope.todoLists[id].todos[1].notes[0].owner).toEqual(VERIFICATION_DATA);
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(true);
                });
            });
        
            /**
             * destroyNote
             */
            describe('destroyNote', function() {
                beforeEach(function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos.length).toBe(2);
        
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(0);
                    scope.makeNote(1, 1, 'Should I push this back?');
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(1);
                });
        
                it('should remove a note from a todo', function() {
                    scope.destroyNote(1, 1);
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(0);
                });
        
                it('should ignore out-of-bound indices', function() {
                    scope.destroyNote(1, 2);
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);
                    scope.destroyNote(1, -1);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
    
                    expect(scope.destroyNote(2, 0)).toBe(undefined);
                });
             });
        
            /**
             * strikeNote
             */
            describe('strikeNote', function() {
                beforeEach(function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos.length).toBe(2);
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(0);
                    scope.makeNote(1, 1, 'Should I push this back?');
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(1);
                });
        
                it('should mark a note as relevant===false', function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(true);
                    scope.strikeNote(1, 1, 0);
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(false);
                });
        
                it('should ignore out-of-bound indices', function() {
                    scope.strikeNote(1, 1, 1);
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes[1]).toBe(undefined);
                    scope.strikeNote(1, 1, -1);
                    expect(scope.todoLists[id].todos[1].notes[-1]).toBe(undefined);
                    scope.strikeNote(1, 2, 0);
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);
                    scope.strikeNote(1, -1, 0);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
    
                    expect(scope.strikeNote(2, 0, 0)).toBe(undefined);
                    expect(scope.strikeNote(-1, 0, 0)).toBe(undefined);
                });
            });
        
            /**
             * unstrikeNote
             */
            describe('unstrikeNote', function() {
                beforeEach(function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos.length).toBe(2);
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(0);
                    scope.makeNote(1, 1, 'Should I push this back?');
                    expect(scope.todoLists[id].todos[1].notes.length).toBe(1);
                });
        
                it('should mark a note as relevant===true', function() {
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(true);
                    scope.strikeNote(1, 1, 0);
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(false);
                    scope.unstrikeNote(1, 1, 0);
                    expect(scope.todoLists[id].todos[1].notes[0].relevant).toBe(true);
                });
        
                it('should ignore out-of-bound indices', function() {
                    scope.unstrikeNote(1, 1, 1);
                    var id = scope.tableOfContents[1]._id;
                    expect(scope.todoLists[id].todos[1].notes[1]).toBe(undefined);
                    scope.unstrikeNote(1, 1, -1);
                    expect(scope.todoLists[id].todos[1].notes[-1]).toBe(undefined);
                    scope.unstrikeNote(1, 2, 0);
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);
                    scope.unstrikeNote(1, -1, 0);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
    
                    expect(scope.unstrikeNote(2, 0, 0)).toBe(undefined);
                    expect(scope.unstrikeNote(-1, 0, 0)).toBe(undefined);
               });
            });
        
            /**
             * assignTodo
             */
            describe('assignTodo', function() {
        
                it('should assign a user to the task', function() {
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[0].assignees.length).toBe(0);

                    scope.assignTodo(0, 0, VERIFICATION_DATA);
                    expect(scope.todoLists[id].todos[0].assignees.length).toBe(1);
                    expect(scope.todoLists[id].todos[0].assignees[0].name).toBe('dan');
                });
        
                it('should ignore out-of-bound indices', function() {
                    scope.assignTodo(0, 2, VERIFICATION_DATA);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);

                    scope.assignTodo(0, -1, VERIFICATION_DATA);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
                    expect(scope.assignTodo(2, 0, VERIFICATION_DATA)).toBe(undefined);
                    expect(scope.assignTodo(-1, 0, VERIFICATION_DATA)).toBe(undefined);
                });
            });
        
            /**
             * relieveTodo
             */
            describe('relieveTodo', function() {
        
                beforeEach(function() {
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[0].assignees.length).toBe(0);
                    scope.assignTodo(0, 0, VERIFICATION_DATA);
                    expect(scope.todoLists[id].todos[0].assignees.length).toBe(1);
                });
 
                it('should remove a user from the task', function() {
                    scope.relieveTodo(0, 0, 0);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[0].assignees.length).toBe(0);
                    expect(scope.todoLists[id].todos[0].assignees[0]).toBe(undefined);
                });
        
                it('should ignore out-of-bound indices', function() {
                    scope.relieveTodo(0, 2, VERIFICATION_DATA);
                    var id = scope.tableOfContents[0]._id;
                    expect(scope.todoLists[id].todos[2]).toBe(undefined);
                    scope.relieveTodo(0, -1, VERIFICATION_DATA);
                    expect(scope.todoLists[id].todos[-1]).toBe(undefined);
    
                    expect(scope.relieveTodo(2, 0, VERIFICATION_DATA)).toBe(undefined);
                    expect(scope.relieveTodo(-1, 0, VERIFICATION_DATA)).toBe(undefined);
                    
                });
             });
        });
    });

    /**
     * init
     */
    describe('init', function() {

        it('should list the app\'s documents', function() {
            $httpBackend.expectGET(LS_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN).
                    respond([{ _id: '1', name: 'a new list' },
                             { _id: '2', name: 'another new list' }]);

            expect(Object.keys(scope.todoLists).length).toBe(0);

            scope.init();

            $httpBackend.flush();
            
            expect(scope.tableOfContents.length).toBe(2);

            expect(scope.tableOfContents[0]._id).toBe('1');
            expect(scope.tableOfContents[0].name).toBe('a new list');

            expect(scope.tableOfContents[1]._id).toBe('2');
            expect(scope.tableOfContents[1].name).toBe('another new list');
        });

    });
});

