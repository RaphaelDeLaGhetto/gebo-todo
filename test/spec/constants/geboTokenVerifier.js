'use strict';

describe('Constant: GeboTokenVerifier', function () {

    var $httpBackend,
        $http,
        $rootScope;

    var GET_URI = '/test',///*'http://localhost:3000*/'/api/userinfo',
        CONFIG = {},
        ACCESS_TOKEN = '1234';

    var tokenVerifier,
        verifier,
        deferred;

//    beforeEach(module('geboClientApp', function(GeboTokenVerifier) {
//        tokenVerifier = GeboTokenVerifier;
//    }));

    beforeEach(function() {
        module('geboClientApp');

        inject(function($injector) {

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', GET_URI).respond({ name: 'dan' });

            $rootScope = $injector.get('$rootScope');

            tokenVerifier = $injector.get('GeboTokenVerifier', { $rootScope: $rootScope} );


            verifier = $injector.get('Verifier');

            var $q = $injector.get('$q');
            deferred = $q.defer();

//            $httpBackend.when('GET', GET_URI).respond({
//                id: '1',
//                name: 'dan',
//                email: 'dan@email.com',
//                scope: '[\'*\']',
//            });

//            $httpBackend.expectGET(GET_URI);
//            spyOn(verifier, 'authenticate');
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });


    /**
     * A sanity check, for now. Will remove later
     */
    it('test tokenVerifier', inject(function() {
        expect(tokenVerifier).toBeDefined();
        expect(verifier).toBeDefined();
    }));

    /**
     * What on earth is happening?
     */
//    describe('a strange new way of doing things', function() {
//        it('should do something', function() {
//            console.log('yeah?');
//            $httpBackend.expectGET(GET_URI);
//            tokenVerifier(CONFIG, ACCESS_TOKEN, deferred, verifier);//, function() {
////                console.log('it got called');
////                expect(verifier.name()).toBe('danny');       
////            });
//
// //           expect(verifier.authenticate).toHaveBeenCalled();
////            expect(verifier.id()).toBe('1');
////            expect(verifier.name()).toBe('dan');
////            $httpBackend.flush();
//      });
//    });

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
