'use strict';

describe('Service: Token', function () {

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

    // instantiate service
    var token,
        $httpBackend;

    beforeEach(function() {
        module('geboClientApp');
        inject(function (_Token_, $injector) {
            token = _Token_;

            $httpBackend = $injector.get('$httpBackend');

            $httpBackend.when('GET', VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);

//            $httpBackend.when('GET', AUTHORIZATION_ENDPOINT + 
//                    '?access_token=' + ACCESS_TOKEN).respond({
//                id: '1',
//                name: 'dan',
//                email: 'dan@email.com',
//                scope: ['*'],
//            });
        });
        
        /**
         * localStorage spies
         */
        var store = {};

        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return store[key];
        });

        spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
            return store[key] = value + '';
        });

        spyOn(localStorage, 'clear').andCallFake(function(key, value) {
            return store = {}; 
        });
        
        spyOn(localStorage, 'removeItem').andCallFake(function(key, value) {
            delete store[key]; 
        });

    });
  
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should do something', function () {
      expect(!!token).toBe(true);
    });
  
    /**
     * getParams
     */
    describe('getParams', function() {
  
        it('should thrown an exception if not initialized', function() {
            expect(function() { token.getParams(); }).toThrow(
                    new Error('Token is insufficiently configured. ' +
                            'Please configure the following options: ' +
                            'clientId, redirectUri, ' +
                            'authorizationEndpoint, verificationEndpoint'));
        });

        it('should return an object if initialized', function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });

            expect(token.getParams()).toEqual({
              response_type: 'token',
              client_id: CLIENT_ID,
              redirect_uri: REDIRECT_URI,
              scope: '*'
            });
        });
    });

    /**
     * verifyAsync
     */
    describe('verifyAsync', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
        });


        it('should return a promise', function() {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 
            expect(token.verifyAsync(ACCESS_TOKEN)).toBeDefined();
            $httpBackend.flush();
        });
    });

    /**
     * verify
     */
    describe('verify', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
        });

        // This isn't really doing anything. Revisit
        // In fact, this test is better located in the MainCtrl
        // tests, me thinks.
        it('should simulate a promise', inject(function($q, $rootScope) {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 

            var verificationData;
            var deferred = $q.defer();
            var promise = deferred.promise;

            promise.then(function(data) { verificationData = data; });

            token.verify(ACCESS_TOKEN, deferred);

            // Simulate resolving of promise
            deferred.resolve(VERIFICATION_DATA);
            
            expect(verificationData).toBe(undefined);

            $rootScope.$apply();

            expect(verificationData).toEqual(VERIFICATION_DATA);
            $httpBackend.flush();
        }));
    });

    /**
     * get/set 
     */
    describe('get/set', function() {

        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
          });

        it('should return undefined if nothing stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should return the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should overwrite the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('5678');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('5678');
            expect(localStorage.getItem).toHaveBeenCalled();
         });

    });

    /**
     * objectToQueryString
     */
    describe('objectToQueryString', function() {
        it('should take an object and spit out a query string', function() {
           var obj = {
                    response_type: "token", 
                    client_id: CLIENT_ID, 
                    redirect_uri: REDIRECT_URI,
                    scope: SCOPES 
               }; 
           expect(token.objectToQueryString(obj)).toBe(
                                'response_type=token&client_id=' + 
                                CLIENT_ID +
                                '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                                '&scope=' + SCOPES);
        });

    }); 

    /**
     * clear
     */
    describe('clear', function() {
        it('should delete the token in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            token.clear();
            expect(localStorage.removeItem).toHaveBeenCalled();
            expect(token.get()).toBe(undefined);
        });
    });
});
