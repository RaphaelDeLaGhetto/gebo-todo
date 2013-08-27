'use strict';

describe('Controller: MainCtrl', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        LOCAL_STORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 

    var VERIFICATION_DATA = {
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            };

    var MainCtrl,
        $httpBackend,
        $q,
        scope,
        token;

    /**
     * Initialize the controller and a mock scope
     */
    beforeEach(function() {
        module('geboClientApp');
            
        inject(function ($controller, $rootScope, $injector) {
            scope = $rootScope.$new();
            token = $injector.get('Token');
            $q = $injector.get('$q');

            MainCtrl = $controller('MainCtrl', {
                $scope: scope,
                Token: token
            });

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', VERIFICATION_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);
        });

        /**
         * Initialize the Token service
         */
        token.setParams({
            clientId: CLIENT_ID,
            redirectUri: REDIRECT_URI,
            authorizationEndpoint: AUTHORIZATION_ENDPOINT,
            verificationEndpoint: VERIFICATION_ENDPOINT,
            localStorageName: LOCAL_STORAGE_NAME,
            scopes: SCOPES
        });

        var store = {};
        spyOn(token, 'get').andCallFake(function() {
            return store[LOCAL_STORAGE_NAME];
        });

        spyOn(token, 'set').andCallFake(function(tokenString) {
            store[LOCAL_STORAGE_NAME] = tokenString;
        });

        spyOn(token, 'verifyAsync').andCallFake(function(token) {
            return $q.defer().promise;
        });

     });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    /**
     * Has this client already authenticated?
     */
    describe('onload', function() {

        beforeEach(inject(function($controller) {
            var ctrl = $controller('MainCtrl', {
                    $scope: scope,
                    Token: token
            });
        }));

        it('should look for a locally stored token', function() {
           expect(token.get).toHaveBeenCalled();
           expect(scope.accessToken).toBe(undefined);
        });

        it('should verify a locally stored token', inject(function($controller) {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + '?access_token=' + ACCESS_TOKEN);
            token.set(ACCESS_TOKEN);
            var ctrl = $controller('MainCtrl', {
                    $scope: scope,
                    Token: token
            });

            expect(token.get).toHaveBeenCalled();
            expect(scope.accessToken).toBe(ACCESS_TOKEN);
            expect(token.verifyAsync).toHaveBeenCalled();

            $httpBackend.flush();
         }));
 
    });


//    it('should load entries with HTTP', function() {
//        $httpBackend.expectGET('/test');
//        MainCtrl.load(function() {
//            expect(Object.keys(scope.entries).length).toBe(1);
//            expect(scope.entries.name).toBe('dan');
//        });
//        $httpBackend.flush();
//    });

});
