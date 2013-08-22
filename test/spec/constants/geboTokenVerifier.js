'use strict';

describe('Constant: GeboTokenVerifier', function () {

    var $httpBackend;

    var GET_URI = 'http://localhost:3000/api/userinfo?access_token=123';

    var tokenVerifier;

    beforeEach(module('geboClientApp', function(GeboTokenVerifier) {
        tokenVerifier = GeboTokenVerifier;
    }));

    beforeEach(inject(function(_$httpBackend_, $rootScope, $route, $controller) {
        $httpBackend = _$httpBackend_;
        $httpBackend.when('GET', GET_URI).respond({
            id: '1',
            name: 'dan',
            email: 'dan@email.com',
            scope: '[\'*\']',
        });
        $httpBackend.expectGET(GET_URI);
    }));

    /**
     * A sanity check, for now. Will remove later
     */
    it('test tokenVerifier', inject(function() {
        expect(tokenVerifier).toBeDefined();
    }));

    /**
     * What on earth is happening?
     */
    describe('a strange new way of doing things', function() {
        it('should do something', function() {
            $httpBackend.expectGET(GET_URI).respond({
            id: '1',
            name: 'dan',
            email: 'dan@email.com',
            scope: '[\'*\']',
        });
        });
    });

    /**
     * function results
     */
//    describe('function results', function() {
//        var tokenVerifierResults;
//        beforeEach(inject(function($q) {
//            tokenVerifierResults = verifier({
//                                    clientId: 'dan',
//                                    redirectUri: 'http://example.com',
//                                    authorizationEndpoint: 'http://localhost/authorize',
//                                    scopes: ['scope1', 'scope2']
//                                  }, '1234', $q.defer());
//
//        }));
//
//        it('should return something', function() {
//            //expect(tokenVerifierResults).toBe({});
//            expect(tokenVerifierResults).toBeDefined();
//        });
//
//        /**
//         * resolve
//         */
//        xdescribe('resolve', function() {
//            it('should return something', function() {
//                expect(tokenVerifierResults.resolve).toBe({});
//            });
//        });
//
//        /**
//         * reject
//         */
//        xdescribe('reject', function() {
//            it('should return something', function() {
//                expect(tokenVerifierResults.reject).toBe({});
//            });
// 
//        });
//
//        /**
//         * promise
//         */
//        xdescribe('promise', function() {
//            it('should return something', function() {
//                expect(tokenVerifierResults.promise).toBe({});
//            });
//        });
//
//     });
});
