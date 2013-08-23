'use strict';

describe('Service: Token', function () {

    // instantiate service
    var Token;
    beforeEach(function() {
        module('geboClientApp');
        inject(function (_Token_) {
            Token = _Token_;
        })
    });
  
    it('should do something', function () {
      expect(!!Token).toBe(true);
    });
  
    /**
     * getParams
     */
    describe('getParams', function() {
  
    });
});
