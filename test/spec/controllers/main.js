'use strict';

describe('Controller: MainCtrl', function () {

  // load the controller's module
//  beforeEach(module('geboClientApp'));

  var MainCtrl,
      $httpBackend,
      scope;

  // Initialize the controller and a mock scope
    beforeEach(function() {
        module('geboClientApp');
            
        inject(function ($controller, $rootScope, $injector) {
            scope = $rootScope.$new();
            MainCtrl = $controller('MainCtrl', {
                $scope: scope
            });

            $httpBackend = $injector.get('$httpBackend');
            $httpBackend.when('GET', '/test').respond({ name: 'dan' });
        });
    });

    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

//    it('should have no entries initially', function() {
//        expect(scope.entries.length).toBe(0);
//    });

//    it('should load entries with HTTP', function() {
//        $httpBackend.expectGET('/test');
//        MainCtrl.load(function() {
//            expect(Object.keys(scope.entries).length).toBe(1);
//            expect(scope.entries.name).toBe('dan');
//        });
//        $httpBackend.flush();
//    });

});
