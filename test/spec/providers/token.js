'use strict';

describe('Provider: Token', function () {

    var provider,
        verifier;

    beforeEach(module('geboClientApp', function(TokenProvider, GeboTokenVerifier) {
        provider = TokenProvider;
        verifier = GeboTokenVerifier;
    }));

    /**
     * A sanity check, for now. Will remove later
     */
    it('test provider', inject(function() {
        expect(provider.method()).toBeTruthy();
    }));

    /**
     * $get
     */
    describe('$get', function() {
        it('should throw an insufficiently configured exception', 
                inject(function($q, $http, $window, $rootScope) {
            expect(function() { 
                    provider.$get($q, $window);
            }).toThrow(
                    new Error("TokenProvider is insufficiently configured.  Please " +
                              "configure the following options using " +
                              "TokenProvider.extendConfig: clientId, redirectUri, " +
                              "authorizationEndpoint, verifyFunc")
                );
        }));

        it('should throw a clientId needs to be configured exception', 
                inject(function($q, $window) {
            provider.extendConfig({
                    redirectUri: 'http://example.com',
                    authorizationEndpoint: 'http://localhost/authorize',
                    verifyFunc: 'someFunction',
                    scopes: ['scope1', 'scope2']
            });
             expect(function() { 
                    provider.$get($q, $window);
            }).toThrow(
                    new Error("TokenProvider is insufficiently configured.  Please " +
                              "configure the following options using " +
                              "TokenProvider.extendConfig: clientId")
                );
        }));

        /**
         * get/set
         */
        describe('get/set', function() {

            var getResults;

            beforeEach(inject(function($q, $window) {
                provider.extendConfig({
                    clientId: 'dan',
                    redirectUri: 'http://example.com',
                    authorizationEndpoint: 'http://localhost/authorize',
                    verifyFunc: 'someFunction',
                    scopes: ['scope1', 'scope2']
                });
                getResults = provider.$get($q, $window);
            }));

            it('should return undefined if a localStorageName is not set', function() {
                expect(getResults.get()).toBe(undefined);
            });

            it('should return the value set on localStorageName', function() {
                getResults.set('localStorage');
                expect(getResults.get()).toBe('localStorage');
            });
         });

        /**
         * verifyAsync
         */
        describe('verifyAsync', function() {
            var getResults;

            beforeEach(inject(function($q, $window) {

                provider.extendConfig({
                    clientId: 'dan',
                    redirectUri: 'http://example.com',
                    authorizationEndpoint: 'http://localhost/authorize',
                    verifyFunc: verifier,
                    scopes: ['scope1', 'scope2']
                });
                getResults = provider.$get($q, $window);
            }));

          it('should return a promise', function() {
            expect(getResults.verifyAsync('1234')).toBeDefined();
          }); 
        });

        /**
         * getTokenByPopup 
         */
        describe('getTokenByPopup', function() {
            var getResults;

            beforeEach(inject(function($q, $window) {

                provider.extendConfig({
                    clientId: 'dan',
                    redirectUri: 'http://example.com',
                    authorizationEndpoint: 'http://localhost/authorize',
                    verifyFunc: verifier,
                    scopes: ['scope1', 'scope2']
                });
                getResults = provider.$get($q, $window);
            }));

          it('should return a promise', function() {
            expect(getResults.getTokenByPopup({}, {})).toBeDefined();
          }); 
        });

    });

    /**
     * objectToQueryString
     */
//    describe('objectToQueryString', function() {
//        it('should return an URL-friendly query string', function() {
//            expect(provider.objectToQueryString({color: 'red', size: 'large'})).
//                toBe('color=red&size=large');
//        });
//    });

    /**
     * extendConfig
     */
    describe('extendConfig', function() {

        // If $get doesn't throw an error, then it must be working... right?
        it('should overwrite the existing configurations', inject(function($q, $window) {
            provider.extendConfig({
                    clientId: 'dan',
                    redirectUri: 'http://example.com',
                    authorizationEndpoint: 'http://localhost/authorize',
                    verifyFunc: 'someFunction',
                    scopes: ['scope1', 'scope2']
            });
            expect(provider.$get($q, $window)).not.toBe(undefined);
        }));

    });

});
