'use strict';

describe('Service: Verifier', function () {

//  var $httpBackend;

  //var GET_URI = 'http://localhost:3000/api/userinfo?access_token=123';

  // load the service's module
  beforeEach(module('geboClientApp'));

  // instantiate service
  var verifier;
  beforeEach(inject(function (_Verifier_) {//, $injector) {
    verifier = _Verifier_;
//    $httpBackend = $injector.get('$httpBackend');
//
//    $httpBackend.when('GET', GET_URI).respond({
//            id: '1',
//            name: 'dan',
//            email: 'dan@email.com',
//            scope: '[\'*\']',
//        });

  }));

//  afterEach(function() {
//    $httpBackend.verifyNoOutstandingExpectation();
//    $httpBackend.verifyNoOutstandingRequest();
//  });

  it('should do something', function () {
    expect(!!verifier).toBe(true);
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
        verifier.authenticate({
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
   * authenticate
   */
  describe('authenticate', function() {
    beforeEach(function() {
        verifier.authenticate({
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
