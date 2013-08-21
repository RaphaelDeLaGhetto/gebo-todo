'use strict';

describe('Constant: GeboOauth', function () {

    var oauth;

    beforeEach(module('geboClientApp', function(GeboTokenVerifier) {
        oauth = GeboTokenVerifier;
    }));

    /**
     * A sanity check, for now. Will remove later
     */
    it('test oauth', inject(function() {
        expect(oauth).toBeDefined();
    }));

    /**
     * function results
     */
    describe('function results', function() {
        var oauthResults;
        beforeEach(inject(function($q) {
            oauthResults = oauth({
                                    clientId: 'dan',
                                    redirectUri: 'http://example.com',
                                    authorizationEndpoint: 'http://localhost/authorize',
                                    scopes: ['scope1', 'scope2']
                                  }, '1234', $q.defer());

        }));

        it('should return something', function() {
            //expect(oauthResults).toBe({});
            expect(oauthResults).toBeDefined();
        });

        /**
         * resolve
         */
        xdescribe('resolve', function() {
            it('should return something', function() {
                expect(oauthResults.resolve).toBe({});
            });
        });

        /**
         * reject
         */
        xdescribe('reject', function() {
            it('should return something', function() {
                expect(oauthResults.reject).toBe({});
            });
 
        });

        /**
         * promise
         */
        xdescribe('promise', function() {
            it('should return something', function() {
                expect(oauthResults.promise).toBe({});
            });
        });

     });
});
