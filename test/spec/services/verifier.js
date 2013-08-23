'use strict';

describe('Service: Verifier', function () {

  //var GET_URI = 'http://localhost:3000/api/userinfo?access_token=123';

  // load the service's module
    beforeEach(module('geboClientApp'));

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'];

    // instantiate service
    var verifier,
        token,
        $httpBackend;

    beforeEach(function() {
        module('geboClientApp');

        inject(function (_Verifier_, Token, $injector) {
            verifier = _Verifier_;
            token = Token;

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/test').respond({
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            });

            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              localStorageName: 'accessToken',
              verifyFunc: verifier.verify,
              scopes: SCOPES
            });
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    /**
     * verify
     */
    describe('verify', function() {
        it('should do something', function () {
            expect(!!verifier).toBe(true);
        });
    
        it('should have no user data set', function() {
            expect(verifier.id()).toBe(undefined);
            expect(verifier.name()).toBe(undefined);
            expect(verifier.email()).toBe(undefined);
            expect(verifier.scope()).toBe(undefined);
            expect(verifier.token()).toBe(null);
        });
    
        it('should verify the client is still authenticated', function() {
            $httpBackend.expectGET('/test'); 
            verifier.verify(function(){
                expect(verifier.id()).toBe('1');
                expect(verifier.name()).toBe('dan');
                expect(verifier.email()).toBe('dan@email.com');
                expect(verifier.scope()).toEqual(['*']);
                expect(verifier.token()).toBe('1234');
            });
            $httpBackend.flush();
        });
    });

  /**
   * getPostUrl
   */
  describe('getPostUrl', function() {
    it('should return a properly formatted POST URL', function() {
    });
  });

  /**
   * deauthenticate
   */
  describe('deauthenticate', function() {

    beforeEach(function() {
        verifier.setCredentials({
            id: '1',
            name: 'dan',
            email: 'dan@email.com',
            scope: ['*'],
        }, 'token123');
        verifier.deauthenticate();
    });


    it('should erase the stored token', function() {
        expect(verifier.token()).toBe('');
    });

    it('should erase the stored username', function() {
        expect(verifier.name()).toBe(undefined);
    });

    it('should erase the stored email', function() {
        expect(verifier.email()).toBe(undefined);
    });

    it('should erase the stored id', function() {
        expect(verifier.id()).toBe(undefined);
    });

    it('should erase the stored scope', function() {
        expect(verifier.scope()).toBe(undefined);
    });
  });

  /**
   * setCredentials
   */
  describe('setCredentials', function() {
    beforeEach(function() {
        verifier.setCredentials({
            id: '1',
            name: 'dan',
            email: 'dan@email.com',
            scope: ['*'],
        }, 'token123');
    });

    it('should set the stored token', function() {
        expect(verifier.token()).toBe('token123');
    });

    it('should set the stored id', function() {
        expect(verifier.id()).toBe('1');
    });

    it('should set the stored username', function() {
        expect(verifier.name()).toBe('dan');
    });

    it('should set the stored email', function() {
        expect(verifier.email()).toBe('dan@email.com');
    });

    it('should set the stored scope', function() {
        expect(verifier.scope()).toEqual(['*']);
    });
   });
});
