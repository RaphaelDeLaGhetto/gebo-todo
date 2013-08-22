'use strict';

angular.module('geboClientApp')
  .factory('Verifier', function () {

    var _verified = {},
        _token = null;

    /**
     * Public API here
     */
    return {
      id: function() {
              return _verified.id;
            },
      name: function() {
              return _verified.name;
            },
      email: function() {
              return _verified.email;
            },
      scope: function() {
              return _verified.scope;
            },
      token: function() {
              return _token;
            },
      authenticate: function(obj, token) {
              _verified = obj;
              _token = token;
            },
      deauthenticate: function() {
              _verified = {};
              _token = '';
            },
    };
  });
