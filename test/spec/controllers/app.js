'use strict';

describe('Controller: AppCtrl', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        APP_DATA_ENDPOINT = 'http://theirhost.com/api/retrieve',
        SAVE_ENDPOINT = 'http://theirhost.com/api/save',
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
        $q;

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
          appDataEndpoint: APP_DATA_ENDPOINT,
          saveEndpoint: SAVE_ENDPOINT,
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

        $httpBackend.whenPUT(SAVE_ENDPOINT, {
            access_token: ACCESS_TOKEN,
            data: DATA_TO_SAVE
        }).respond(PUT_SUCCESS);

        DATA_TO_SAVE = List.getNewObject('another new list', VERIFICATION_DATA);
        DATA_TO_SAVE.date = 'Today';
        $httpBackend.whenPUT(SAVE_ENDPOINT, {
            access_token: ACCESS_TOKEN,
            data: DATA_TO_SAVE
        }).respond(PUT_SUCCESS);


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
        beforeEach(function() {
//            $httpBackend.expectGET('views/main.html');
//            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
//                    '?access_token=' + ACCESS_TOKEN); 
//            Token.verifyAsync(ACCESS_TOKEN);
//            $httpBackend.flush();
        });

        it('should add a new todo list to the list of todos', function() {
            var data = angular.copy(DATA_TO_SAVE);
            data.description = 'a new list';
            $httpBackend.expectPUT(SAVE_ENDPOINT, {
                access_token: ACCESS_TOKEN,
                data: data
            });
            expect(scope.todoLists.length).toBe(0);
            scope.description = 'a new list';
            scope.create(); 

            expect(scope.description).toBe('');
            expect(scope.todoLists.length).toBe(1);
            expect(scope.todoLists[0].description).toBe('a new list');
            expect(scope.todoLists[0].owner.name).toEqual(VERIFICATION_DATA.name);
            expect(scope.todoLists[0].owner.email).toEqual(VERIFICATION_DATA.email);
            expect(scope.todoLists[0].owner.id).toEqual(VERIFICATION_DATA.id);
            expect(scope.todoLists[0].owner.scopes).toEqual(VERIFICATION_DATA.scopes);

            expect(localStorage.getItem).toHaveBeenCalled();
            expect(List.getNewObject).toHaveBeenCalled();
            $httpBackend.flush();
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
        it('should remove the todo list from the list of todos', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.description = 'a new list';
            scope.create(); 
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
            $httpBackend.flush();
        });

        it('should not be bothered by out-of-bound indicies', function() {
            expect(scope.todoLists.length).toBe(0);
            scope.description = 'a new list';
            scope.create();
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(2);
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(-1);
            expect(scope.todoLists.length).toBe(1);
            scope.destroy(0);
            expect(scope.todoLists.length).toBe(0);
            $httpBackend.flush();
        });
    });

    /**
     * addTodo
     */
    describe('addTodo', function() {

        beforeEach(function() {

            // NOTE: it looks like these $httpBackend
            // expectations need to be declared in the
            // order they're expect. Not sure, but
            // reordering got the tests to pass

            // For the first new list
            var data = angular.copy(DATA_TO_SAVE);
            data.description = 'a new list';
            $httpBackend.expectPUT(SAVE_ENDPOINT, {
                access_token: ACCESS_TOKEN,
                data: data
            });

            // For the second new list
            data = angular.copy(DATA_TO_SAVE);
            data.description = 'another new list';
            $httpBackend.expectPUT(SAVE_ENDPOINT, {
                access_token: ACCESS_TOKEN,
                data: data
            });

            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 

            expect(scope.todoLists.length).toBe(2);

            expect(scope.todoLists[0].todos.length).toBe(0);
            expect(scope.todoLists[0].description).toBe('a new list');

            expect(scope.todoLists[1].todos.length).toBe(0);
            expect(scope.todoLists[1].description).toBe('another new list');

            $httpBackend.flush();
       });

       beforeEach(function() {
            // For the second new list
       });

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
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });

        it('should not be bothered by out-of-range indicies', function() {
            scope.destroyTodo(0, 3);
            expect(scope.todoLists[0].todos[3]).toBe(undefined);
            scope.destroyTodo(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);

            $httpBackend.flush();
         });
     });

    /**
     * completeTodo
     */
    describe('completeTodo', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });
    });

    /**
     * abandonTodo
     */
    describe('abandonTodo', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });

        it('should not be bothered by out-of-bound indicies', function() {
            scope.abandonTodo(1, 2);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.abandonTodo(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.abandonTodo(2, 2);
            expect(scope.todoLists[2]).toBe(undefined);

            $httpBackend.flush();
          });
     });

    /**
     * reopenTodo
     */
    describe('reopenTodo', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });

        it('should nullify a todo\'s abandoned status', function() {
            scope.abandonTodo(0, 1);
            expect(scope.todoLists[0].todos[1].abandoned).toBeCloseTo(new Date());
            scope.reopenTodo(0, 1);
            expect(scope.todoLists[0].todos[1].abandoned).toBe(null);

            $httpBackend.flush();
        });
     });


    /**
     * makeNote
     */
    describe('makeNote', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });
    });

    /**
     * destroyNote
     */
    describe('destroyNote', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
        });

        it('should ignore out-of-bound indices', function() {
            scope.destroyNote(1, 2);
            expect(scope.todoLists[1].todos[2]).toBe(undefined);
            scope.destroyNote(1, -1);
            expect(scope.todoLists[1].todos[-1]).toBe(undefined);
            scope.destroyNote(2, 0);
            expect(scope.todoLists[2]).toBe(undefined);

            $httpBackend.flush();
         });
     });

    /**
     * strikeNote
     */
    describe('strikeNote', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
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

            $httpBackend.flush();
         });
    });

    /**
     * unstrikeNote
     */
    describe('unstrikeNote', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
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

            $httpBackend.flush();
        });
     });

    /**
     * assignTodo
     */
    describe('assignTodo', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
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

            $httpBackend.flush();
          });
     });

    /**
     * relieveTodo
     */
    describe('relieveTodo', function() {
        beforeEach(function() {
            scope.description = 'a new list';
            scope.create(); 
            scope.description = 'another new list';
            scope.create(); 
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

            $httpBackend.flush();
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

            $httpBackend.flush();
        });
     });

    /**
     * init
     */
    describe('init', function() {
        beforeEach(function() {
            $httpBackend.whenGET(APP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=').
//                    respond([{a:'1', b:'2'},{c:'3', d:'4'}]);
//                    respond(VERIFICATION_DATA);
                    respond(function() { return [VERIFICATION_DATA, VERIFICATION_DATA]; });

            $httpBackend.whenGET(APP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc').
                    respond(VERIFICATION_DATA);


//            spyOn(Token, 'retrieveFromProfile').andCallFake(function() {
//                var deferred = $q.defer();
//                deferred.resolve([VERIFICATION_DATA]);
//                return deferred.promise;
//            });

         });

        it('should load the app data', function() {
            $httpBackend.expectGET(APP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=');

            expect(scope.todoLists.length).toBe(0);

            scope.init();
            
//            scope.$digest();
//            rootScope.$digest();
            $httpBackend.flush();
            rootScope.$apply();

            console.log('scope.todoLists');
            console.log(scope.todoLists);
            expect(scope.todoLists.length).toBe(1);
            expect(scope.todoLists[0].id).toBe('1');
            expect(scope.todoLists[0].name).toBe('dan');
            expect(scope.todoLists[0].email).toBe('dan@email.com');
            expect(scope.todoLists[0].scope).toEqual(['*']);

        });

    });
});

