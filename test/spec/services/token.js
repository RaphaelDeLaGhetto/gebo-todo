'use strict';

describe('Service: Token', function () {

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        APP_DATA_ENDPOINT = 'http://theirhost.com/api/retrieve',
        LS_DATA_ENDPOINT = 'http://theirhost.com/api/ls',
        SAVE_ENDPOINT = 'http://theirhost.com/api/save',
        CP_DATA_ENDPOINT = 'http://theirhost.com/api/cp',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 
    var PUT_SUCCESS = { success: true },
        DATA_TO_SAVE = { cat_breath: 'smells like catfood' };//,
//        COLLECTION = 'hardtruths';

    var VERIFICATION_DATA = {
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            };

    // instantiate service
    var token,
        $rootScope,
        $httpBackend;

    beforeEach(function() {
        module('geboClientApp');
        inject(function (_Token_, $injector) {
            token = _Token_;

            $httpBackend = $injector.get('$httpBackend');
            $rootScope = $injector.get('$rootScope');

            $httpBackend.when('GET', VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN).respond(VERIFICATION_DATA);

            $httpBackend.whenPUT(SAVE_ENDPOINT, {
                access_token: ACCESS_TOKEN,
                data: DATA_TO_SAVE
              }).respond(PUT_SUCCESS);


            $httpBackend.when('GET', 'views/main.html').respond();
        });
        
        /**
         * localStorage spies
         */
        var store = {};

        spyOn(localStorage, 'getItem').andCallFake(function(key) {
            return store[key];
        });

        spyOn(localStorage, 'setItem').andCallFake(function(key, value) {
            return store[key] = value + '';
        });

        spyOn(localStorage, 'clear').andCallFake(function(key, value) {
            return store = {}; 
        });
        
        spyOn(localStorage, 'removeItem').andCallFake(function(key, value) {
            delete store[key]; 
        });

    });
  
    afterEach(function() {
        $httpBackend.verifyNoOutstandingExpectation();
        $httpBackend.verifyNoOutstandingRequest();
    });

    it('should do something', function () {
      expect(!!token).toBe(true);
    });
  
    /**
     * retrieveFromProfile
     */
//    describe('retrieveFromProfile', function() {
//        beforeEach(function() {
//            token.setParams({
//              clientId: CLIENT_ID,
//              redirectUri: REDIRECT_URI,
//              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
//              verificationEndpoint: VERIFICATION_ENDPOINT,
//              saveEndpoint: SAVE_ENDPOINT,
//              appDataEndpoint: APP_DATA_ENDPOINT,
//              localStorageName: 'accessToken',
//              scopes: SCOPES
//            });
//            token.set(ACCESS_TOKEN);
//
//            $httpBackend.whenGET(APP_DATA_ENDPOINT +
//                    '?access_token=' + ACCESS_TOKEN + '&doc=').
////                    respond([VERIFICATION_DATA]);
////                    respond(VERIFICATION_DATA);
//                    respond(function() { return [VERIFICATION_DATA, VERIFICATION_DATA]; });
//
//            $httpBackend.whenGET(APP_DATA_ENDPOINT +
//                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc').
//                    respond(VERIFICATION_DATA);
//         });
//
//        it('should GET all relevant docs from the database', function() {
//            $httpBackend.expectGET(APP_DATA_ENDPOINT +
//                    '?access_token=' + ACCESS_TOKEN + '&doc=');
//            
//            var promise = token.retrieveFromProfile();
//            var data;
//            promise.then(function(d) { data = d; });
//
//            $httpBackend.flush();
//            //$rootScope.$digest();
//            $rootScope.$apply();
//
//                    console.log('!!!!!!!!!!!!!!!!!!!!!!!!!!');
//                    expect(data[1].id).toBe('1');
//                    expect(data[1].name).toBe('dan');
//                    expect(data[1].email).toBe('dan@email.com');
//                    expect(data[1].scope).toEqual(['*']);
//       //        });
//            expect(localStorage.getItem).toHaveBeenCalled();
//        });
//
//        it('should GET the requested doc from the database', function() {
//            $httpBackend.expectGET(APP_DATA_ENDPOINT +
//                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc');
//            
//            token.retrieveFromProfile('some_doc').
//                then(function(data) {
//                    expect(data.id).toBe('1');
//                    expect(data.name).toBe('dan');
//                    expect(data.email).toBe('dan@email.com');
//                    expect(data.scope).toEqual(['*']);
//                });
//            expect(localStorage.getItem).toHaveBeenCalled();
//            $httpBackend.flush();
//        });
//    });     

    /**
     * getParams
     */
    describe('getParams', function() {
  
        it('should throw an exception if not initialized', function() {
            expect(function() { token.getParams(); }).toThrow(
                    new Error('Token is insufficiently configured. ' +
                            'Please configure the following options: ' +
                            'clientId, redirectUri, ' +
                            'authorizationEndpoint, verificationEndpoint'));
        });

        it('should return an object if initialized', function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });

            expect(token.getParams()).toEqual({
              response_type: 'token',
              client_id: CLIENT_ID,
              redirect_uri: REDIRECT_URI,
              scope: '*'
            });
        });
    });

    /**
     * verifyAsync
     */
    describe('verifyAsync', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
        });


        it('should return a promise', function() {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 
            expect(token.verifyAsync(ACCESS_TOKEN)).toBeDefined();
            $httpBackend.flush();
        });

   });

    /**
     * verify
     */
    describe('verify', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
        });

        // This isn't really doing anything. Revisit
        // In fact, this test is better located in the MainCtrl
        // tests, me thinks.
        it('should simulate a promise', inject(function($q, $rootScope) {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 

            var verificationData;
            var deferred = $q.defer();
            var promise = deferred.promise;

            promise.then(function(data) { verificationData = data; });

            token.verify(ACCESS_TOKEN, deferred);

            // Simulate resolving of promise
            deferred.resolve(VERIFICATION_DATA);
            
            expect(verificationData).toBe(undefined);

            $rootScope.$apply();

            expect(verificationData).toEqual(VERIFICATION_DATA);
            $httpBackend.flush();
        }));

        it('should save the verification data', inject(function($q, $rootScope) {
            $httpBackend.expectGET(VERIFICATION_ENDPOINT + 
                    '?access_token=' + ACCESS_TOKEN); 

            var deferred = $q.defer();
            token.verify(ACCESS_TOKEN, deferred, function() {
                var data = token.data();
                expect(data.name).toEqual(VERIFICATION_DATA.name);
                expect(data.email).toEqual(VERIFICATION_DATA.email);
                expect(data.id).toEqual(VERIFICATION_DATA.id);
                expect(data.scopes).toEqual(VERIFICATION_DATA.scopes);
            });

            $httpBackend.flush();
        }));
    });

    /**
     * get/set 
     */
    describe('get/set', function() {

        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
          });

        it('should return undefined if nothing stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should return the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
        });

        it('should overwrite the value stored in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('5678');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('5678');
            expect(localStorage.getItem).toHaveBeenCalled();
         });

    });

    /**
     * objectToQueryString
     */
    describe('objectToQueryString', function() {
        it('should take an object and spit out a query string', function() {
           var obj = {
                    response_type: "token", 
                    client_id: CLIENT_ID, 
                    redirect_uri: REDIRECT_URI,
                    scope: SCOPES 
               }; 
           expect(token.objectToQueryString(obj)).toBe(
                                'response_type=token&client_id=' + 
                                CLIENT_ID +
                                '&redirect_uri=' + encodeURIComponent(REDIRECT_URI) +
                                '&scope=' + SCOPES);
        });

    }); 

    /**
     * clear
     */
    describe('clear', function() {
        it('should delete the token in localStorage', function() {
            expect(token.get()).toBe(undefined);
            expect(localStorage.getItem).toHaveBeenCalled();
            token.set('1234');
            expect(localStorage.setItem).toHaveBeenCalled();
            expect(token.get()).toBe('1234');
            token.clear();
            expect(localStorage.removeItem).toHaveBeenCalled();
            expect(token.get()).toBe(undefined);
            expect(token.data()).toEqual({});
        });
    });

    /**
     * saveEndpoint
     */
    describe('saveEndpoint', function() {
        it('should return the saveEndpoint', function() {
           expect(token.saveEndpoint()).toBeNull();

           token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });

            expect(token.saveEndpoint()).toBe(SAVE_ENDPOINT);
        });
    });

    /**
     * appDataEndpoint
     */
    describe('appDataEndpoint', function() {
        it('should return the appDataEndpoint', function() {
           expect(token.saveEndpoint()).toBeNull();

           token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              appDataEndpoint: APP_DATA_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });

            expect(token.appDataEndpoint()).toBe(APP_DATA_ENDPOINT);
        });
    });

    /**
     * ls
     */
    describe('ls', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              appDataEndpoint: APP_DATA_ENDPOINT,
              lsDataEndpoint: LS_DATA_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
            token.set(ACCESS_TOKEN);

            $httpBackend.whenGET(LS_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN).
                    respond([{ _id: '1', name: 'doc 1'},
                             { _id: '2', name: 'doc 2'}]);
        });

        it('should GET the list of documents in the collection', function() {
             $httpBackend.expectGET(LS_DATA_ENDPOINT + '?access_token=' + ACCESS_TOKEN);

             var deferred = token.ls();

             var _list;
             deferred.then(function(list) {
               _list = list; 
             });

             $httpBackend.flush();
             //$rootScope.$apply();

             expect(_list[0]._id).toBe('1');
             expect(_list[0].name).toBe('doc 1');
             expect(_list[1]._id).toBe('2');
             expect(_list[1].name).toBe('doc 2');
         });
    });

    /**
     * cp
     */
    describe('cp', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              appDataEndpoint: APP_DATA_ENDPOINT,
              lsDataEndpoint: LS_DATA_ENDPOINT,
              cpDataEndpoint: CP_DATA_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
            token.set(ACCESS_TOKEN);

            $httpBackend.whenGET(CP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc').
                    respond(VERIFICATION_DATA);
        });

        it('should GET the requested document from the collection', function() {
             $httpBackend.expectGET(CP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc');

             var deferred = token.cp('some_doc');

             var _doc;
             deferred.then(function(doc) {
               _doc = doc; 
             });

             $httpBackend.flush();

             expect(_doc.id).toBe('1');
             expect(_doc.name).toBe('dan');
             expect(_doc.email).toBe('dan@email.com');
             expect(_doc.scope).toEqual(['*']);
          });
    });

    /**
     * save
     */
    describe('save', function() {
        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              appDataEndpoint: APP_DATA_ENDPOINT,
              lsDataEndpoint: LS_DATA_ENDPOINT,
              cpDataEndpoint: CP_DATA_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
            token.set(ACCESS_TOKEN);

            $httpBackend.whenGET(CP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc').
                    respond(VERIFICATION_DATA);
        });

        it('should GET the requested document from the collection', function() {
             $httpBackend.expectGET(CP_DATA_ENDPOINT +
                    '?access_token=' + ACCESS_TOKEN + '&doc=some_doc');

             var deferred = token.cp('some_doc');

             var _doc;
             deferred.then(function(doc) {
               _doc = doc; 
             });

             $httpBackend.flush();

             expect(_doc.id).toBe('1');
             expect(_doc.name).toBe('dan');
             expect(_doc.email).toBe('dan@email.com');
             expect(_doc.scope).toEqual(['*']);
          });
    });

    /**
     * save
     */
    describe('save', function() {
        var unsavedData,
            savedData,
            expectedUnsavedData;

        beforeEach(function() {
            token.setParams({
              clientId: CLIENT_ID,
              redirectUri: REDIRECT_URI,
              authorizationEndpoint: AUTHORIZATION_ENDPOINT,
              verificationEndpoint: VERIFICATION_ENDPOINT,
              saveEndpoint: SAVE_ENDPOINT,
              localStorageName: 'accessToken',
              scopes: SCOPES
            });
            
            token.set(ACCESS_TOKEN);

            unsavedData = angular.copy(DATA_TO_SAVE);

            expectedUnsavedData = angular.copy(unsavedData);
            expectedUnsavedData.access_token = ACCESS_TOKEN;

            savedData = angular.copy(unsavedData);
            savedData.id = 'some mongo id 1234';

            $httpBackend.when('POST', SAVE_ENDPOINT, expectedUnsavedData).respond(savedData);
         });

        it('should try to PUT something in the database', function() {
            $httpBackend.expect('POST', SAVE_ENDPOINT, expectedUnsavedData);

            var promise = token.save(unsavedData);

            var saved;
            promise.then(function(data) {
                saved = data;
            });

            $httpBackend.flush();

            expect(saved.id).toBe('some mongo id 1234');
            expect(saved.cat_breath).toBe('smells like catfood');
            expect(localStorage.getItem).toHaveBeenCalled();
        });
     });

    /**
     * formEncode
     */
//    describe('formEncode', function() {
//
//        it('should return url-encoded JSON', function() {
//            expect(token.formEncode(DATA_TO_SAVE)).toEqual({});        
//        });
//    });
});
