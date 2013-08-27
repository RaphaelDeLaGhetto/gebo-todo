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
    });

    /**
     * delete
     */
    describe('delete', function() {
        it('should remove the todo list from the list of todos', function() {

        });
    });
});
