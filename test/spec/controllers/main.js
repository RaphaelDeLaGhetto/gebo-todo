'use strict';

describe('Controller: MainCtrl', function () {

    var GEBO_URI = 'https://theirhost.com',
        BASE_URL = 'http://myhost.com',
        LOCAL_STORAGE_NAME = 'accessToken',
        ACCESS_TOKEN = '1234';

    var VERIFICATION_DATA = {
            id:'1',
            name: 'dan',
            email: 'dan@hg.com',
            admin: false,
        };

    var MainCtrl,
        $httpBackend,
        $location,
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
            $location = $injector.get('$location');

            MainCtrl = $controller('MainCtrl', {
                $scope: scope,
                Token: token
            });

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', 'views/main.html').respond();
        });

        /**
         * verify
         */
        $httpBackend.whenGET(token.getEndpointUri('verify') +
                '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);
  
        /**
         * Spies
         */ 
        var store = {};
        spyOn(token, 'get').andCallFake(function() {
            return store[LOCAL_STORAGE_NAME];
        });
 
        spyOn(token, 'set').andCallFake(function(tokenString) {
            store[LOCAL_STORAGE_NAME] = tokenString;
        });

        spyOn(token, 'clear').andCallFake(function(tokenString) {
            delete store[LOCAL_STORAGE_NAME];
        });

        spyOn(token, 'verify').andCallFake(function(token) {
            var deferred = $q.defer();
            deferred.resolve(VERIFICATION_DATA);
            return deferred.promise;
        });
    });

//    afterEach(function() {
//        $httpBackend.verifyNoOutstandingExpectation();
//        $httpBackend.verifyNoOutstandingRequest();
//    });

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

        it('should verify a locally stored token', inject(function($controller, $rootScope) {
            token.set(ACCESS_TOKEN);
            var ctrl = $controller('MainCtrl', {
                    $scope: scope,
                    Token: token
            });

            expect(token.get).toHaveBeenCalled();
            expect(scope.accessToken).toBe(ACCESS_TOKEN);
            expect(token.verify).toHaveBeenCalled();

            expect(scope.verified).toBe(false);
            expect(scope.agentName).toBe(undefined);
            $rootScope.$apply();
            expect(scope.verified).toBe(true);
            expect(scope.agentName).toBe('dan');
         }));
 
    });

    /**
     * authenticate
     */
    describe('authenticate', function() {
        beforeEach(function() {
            spyOn(token, 'getTokenByPopup').andCallFake(function() {
                var deferred = $q.defer();
                deferred.resolve({ access_token: ACCESS_TOKEN });
                return deferred.promise;
            });
        });

        it ('should store the token in local storage', inject(function($rootScope) {
            scope.authenticate();

            expect(token.getTokenByPopup).toHaveBeenCalled();
            $rootScope.$apply();
            expect(token.verify).toHaveBeenCalled();
            expect(token.set).toHaveBeenCalled();

            expect(scope.verified).toBe(true);
            expect(scope.agentName).toBe('dan');
            expect(scope.accessToken).toBe(ACCESS_TOKEN);
         }));
    });


    /**
     * deauthenticate
     */
    describe('deauthenticate', function() {

        beforeEach(function() {
            spyOn(token, 'getTokenByPopup').andCallFake(function() {
                var deferred = $q.defer();
                deferred.resolve({ access_token: ACCESS_TOKEN });
                return deferred.promise;
            });
        });


        it ('should erase the token from local storage', inject(function($rootScope) {
            scope.authenticate();
            $rootScope.$apply();
            expect(scope.verified).toBe(true);
            expect(scope.agentName).toBe('dan');
            expect(scope.accessToken).toBe(ACCESS_TOKEN);

            scope.deauthenticate();
            expect(scope.verified).toBe(false);
            expect(scope.agentName).toBe(undefined);
            expect(scope.accessToken).toBe(undefined);
            expect(token.get()).toBe(undefined);
            expect($location.path()).toBe('/');
         }));
    });

});
