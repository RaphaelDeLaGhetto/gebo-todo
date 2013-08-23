'use strict';

describe('Service: Token', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 
    // instantiate service
    var token,
        verifier,
        $httpBackend;

    beforeEach(function() {
        module('geboClientApp');
        inject(function (_Token_, Verifier, $injector) {
            token = _Token_;
            verifier = Verifier;

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', AUTHORIZATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN).respond({
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            });
        })
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
                    new Error('TokenProvider is insufficiently configured.  ' +
                            'Please configure the following options using ' +
                            'TokenProvider.extendConfig: clientId, redirectUri, ' +
                            'authorizationEndpoint, verifyFunc'));
        });

        it('should return an object if initialized', function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              localStorageName: 'accessToken',
              verifyFunc: verifier.verify,
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
              localStorageName: 'accessToken',
              verifyFunc: verifier.verify,
              scopes: SCOPES
            });
        });


        it('should return a promise', function() {
            $httpBackend.expectGET(AUTHORIZATION_ENDPOINT + 
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
              localStorageName: 'accessToken',
              verifyFunc: verifier.verify,
              scopes: SCOPES
            });
        });

        it('should do something', inject(function($q) {
            $httpBackend.expectGET(AUTHORIZATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 
            token.verify(ACCESS_TOKEN, $q.defer());
            $httpBackend.flush();
        }));
    });

});
