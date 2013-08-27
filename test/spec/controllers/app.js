'use strict';

describe('Controller: AppCtrl', function () {

    // load the controller's module
    beforeEach(module('geboClientApp'));

    var AppCtrl,
        scope;

    // Initialize the controller and a mock scope
    beforeEach(inject(function ($controller, $rootScope) {
        scope = $rootScope.$new();
        AppCtrl = $controller('AppCtrl', {
          $scope: scope
        });
    }));

    it('should attach a todo list object to the scope', function () {
//      expect(scope.todoLists.length).toBe(0);
    });
});
