'use strict';

describe('Service: List', function () {

    var OWNER = {
                id: '1',
                name: 'dan',
                email: 'dan@email.com',
                scope: ['*'],
            },
        WATCHER = {
                id: '2',
                name: 'yanfen',
                email: 'yanfen@email.com',
                scope: ['*'],
            };

    var PUT_SUCCESS = { success: true },
        DATA_TO_SAVE = { cat_breath: 'smells like catfood' };

    var CLIENT_ID = 'abc123',
        REDIRECT_URI = 'http://myhost.com',
        AUTHORIZATION_ENDPOINT = 'http://theirhost.com/dialog/authorize',
        VERIFICATION_ENDPOINT = 'http://theirhost.com/api/userinfo',
        SAVE_ENDPOINT = 'http://theirhost.com/api/save',
        LOCALSTORAGE_NAME = 'accessToken',
        SCOPES = ['*'],
        ACCESS_TOKEN = '1234';
 

    var DESCRIPTION = 'A new thing todo',
        TODO = {
            description: DESCRIPTION,
            owner: OWNER,
        };


    // load the service's module
    beforeEach(module('geboClientApp'));

    // instantiate service
    var List,
        Token,
        listInstance,
        $httpBackend;

    beforeEach(inject(function (_List_, $injector) {
//        Token = $injector.get('Token');
//        Token.setParams({
//          clientId: CLIENT_ID,
//          redirectUri: REDIRECT_URI,
//          authorizationEndpoint: AUTHORIZATION_ENDPOINT,
//          verificationEndpoint: VERIFICATION_ENDPOINT,
//          saveEndpoint: SAVE_ENDPOINT,
//          localStorageName: 'accessToken',
//          scopes: SCOPES
//        });

        List = _List_;
        listInstance = List.getNewObject(DESCRIPTION, OWNER);

//        $httpBackend = $injector.get('$httpBackend');
//        $httpBackend.whenPUT(SAVE_ENDPOINT, { data: DATA_TO_SAVE }, { access_token: ACCESS_TOKEN }).respond(PUT_SUCCESS);
//
//        spyOn(Token, 'get').andCallFake(function() {
//            return ACCESS_TOKEN;
//        });
//
//        spyOn(Token, 'data').andCallFake(function() {
//            return OWNER;
//        });


    }));

//    afterEach(function() {
//        $httpBackend.verifyNoOutstandingExpectation();
//        $httpBackend.verifyNoOutstandingRequest();
//    });

    it('should do something', function () {
        expect(!!List).toBe(true);
//        expect(!!Token).toBe(true);
    });

    /**
     * save
     */
//    describe('save', function() {
//        it('should try to PUT data', function() {
//            $httpBackend.expectPUT(SAVE_ENDPOINT);
//            List.save();
//            expect(Token.get).toHaveBeenCalled();
//            expect(Token.data).toHaveBeenCalled();
//            $httpBackend.flush();
//        });
// 
//    });

    /**
     * getNewObject
     */
    describe('getNewObject', function() {
        it('should initialize a list', function() {
            var list = List.getNewObject(DESCRIPTION, OWNER);
            expect(list.description).toBe(DESCRIPTION);
            expect(list.owner).toBe(OWNER);
            expect(list.date).toBeCloseTo(new Date());
            expect(list.watchers).toEqual([]);
        });
    });

    /**
     * The List function
     */
    describe('Function: List', function() {

        beforeEach(function() {
            expect(listInstance.todos.length).toBe(0);
            listInstance.add(DESCRIPTION, OWNER);
            expect(listInstance.todos.length).toBe(1);
        });

        describe('add', function() {
            it('should add a todo', function() {
                listInstance.add(DESCRIPTION, OWNER);
                expect(listInstance.todos[1].description).toBe(DESCRIPTION);
                expect(listInstance.todos[1].owner).toBe(OWNER);
                expect(listInstance.todos[1].assignees).toEqual([]);
                expect(listInstance.todos[1].date).toBeCloseTo(new Date());
                expect(listInstance.todos[1].deadline).toBe(null);
                expect(listInstance.todos[1].completed).toBe(null);
                expect(listInstance.todos[1].abandoned).toBe(null);
                expect(listInstance.todos[1].notes).toEqual([]);
            });
         });

        describe('destroy', function() {
            it('should remove a todo from the list', function() {
                listInstance.destroy(0);
                expect(listInstance.todos.length).toBe(0);
                expect(listInstance.todos[0]).toBe(undefined);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.destroy(1);
                expect(listInstance.todos.length).toBe(1);
                listInstance.destroy(-1);
                expect(listInstance.todos.length).toBe(1);
             });
         });

        describe('abandonTodo', function() {
            it('mark the given todo as abandoned', function() {
                expect(listInstance.todos[0].abandoned).toBe(null);
                listInstance.abandonTodo(0);
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());
            });

            it('should set abandoned date and nullify completed', function() {
                listInstance.completeTodo(0);
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());
                expect(listInstance.todos[0].abandoned).toBe(null);
                listInstance.abandonTodo(0);
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());
                expect(listInstance.todos[0].completed).toBe(null);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.abandonTodo(1);
                expect(listInstance.todos[1]).toBe(undefined);
                listInstance.abandonTodo(-1);
                expect(listInstance.todos[-1]).toBe(undefined);
             });
        });

        describe('reopenTodo', function() {
            it('should set abandoned and completed to null', function() {
                expect(listInstance.todos[0].abandoned).toBe(null);
                listInstance.abandonTodo(0);
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());
                listInstance.reopenTodo(0);
                expect(listInstance.todos[0].abandoned).toBe(null);

                expect(listInstance.todos[0].completed).toBe(null);
                listInstance.completeTodo(0);
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());
                listInstance.reopenTodo(0);
                expect(listInstance.todos[0].completed).toBe(null);
             });

            it('should ignore out-of-bound indicies', function() {
                listInstance.reopenTodo(1);
                expect(listInstance.todos[1]).toBe(undefined);
                listInstance.reopenTodo(-1);
                expect(listInstance.todos[-1]).toBe(undefined);
             });
        });

        describe('completeTodo', function() {
            it('should set completed date', function() {
                expect(listInstance.todos[0].completed).toBe(null);
                expect(listInstance.todos[0].abandoned).toBe(null);
                listInstance.completeTodo(0);
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());
                expect(listInstance.todos[0].abandoned).toBe(null);
            });

            it('should set completed date and nullify abandoned', function() {
                listInstance.abandonTodo(0);
                expect(listInstance.todos[0].completed).toBe(null);
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());
                listInstance.completeTodo(0);
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());
                expect(listInstance.todos[0].abandoned).toBe(null);
            });


            it('should ignore out-of-bound indicies', function() {
                listInstance.completeTodo(1);
                expect(listInstance.todos[1]).toBe(undefined);
                listInstance.completeTodo(-1);
                expect(listInstance.todos[-1]).toBe(undefined);
            });
        });

        describe('assignTodo', function() {
            it('should assign a user to a todo', function() {
                expect(listInstance.todos[0].assignees.length).toBe(0);
                listInstance.assignTodo(0, OWNER);
                expect(listInstance.todos[0].assignees.length).toBe(1);
                expect(listInstance.todos[0].assignees[0].name).toBe('dan');
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.assignTodo(1, OWNER);
                expect(listInstance.todos[1]).toBe(undefined);
                listInstance.assignTodo(-1, OWNER);
                expect(listInstance.todos[-1]).toBe(undefined);
            });
        });

        describe('relieveTodo', function() {
            it('should relieve a user of todo responsibilities', function() {
                expect(listInstance.todos[0].assignees.length).toBe(0);
                listInstance.assignTodo(0, OWNER);
                expect(listInstance.todos[0].assignees.length).toBe(1);
                expect(listInstance.todos[0].assignees[0].name).toBe('dan');
                listInstance.relieveTodo(0, 0);
                expect(listInstance.todos[0].assignees.length).toBe(0);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.relieveTodo(0, 1);
                expect(listInstance.todos[0].assignees[1]).toBe(undefined);
                listInstance.relieveTodo(0, -1);
                expect(listInstance.todos[0].assignees[-1]).toBe(undefined);
            });
        });



        describe('makeNote', function() {
            it('should attach a note to a todo', function() {
                expect(listInstance.todos[0].notes.length).toBe(0);
                listInstance.makeNote(0, 'Push this back?', OWNER);

                expect(listInstance.todos[0].notes[0].date).toBeCloseTo(new Date());
                expect(listInstance.todos[0].notes[0].content).toBe('Push this back?');
                expect(listInstance.todos[0].notes[0].owner).toEqual(OWNER);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.makeNote(1, 'Some note');
                expect(listInstance.todos[1]).toBe(undefined);
                listInstance.makeNote(-1, 'Some note');
                expect(listInstance.todos[-1]).toBe(undefined);
             });
         });
        
        describe('destroyNote', function() {
            it('should destroy a note attached to a todo', function() {
                listInstance.makeNote(0, 'Push this back?');
                expect(listInstance.todos[0].notes.length).toBe(1);

                listInstance.destroyNote(0, 0);
                expect(listInstance.todos[0].notes.length).toBe(0);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.destroyNote(0, 1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.destroyNote(0, -1, 'Some note');
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });

        /**
         * strikeNote
         */
        describe('strikeNote', function() {
            it('should flag a note as irrelevent', function() {
                listInstance.makeNote(0, 'Push this back?');
                expect(listInstance.todos[0].notes.length).toBe(1);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);

                listInstance.strikeNote(0, 0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.strikeNote(0, 1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.strikeNote(0, -1);
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });
  
        /**
         * unstrikeNote
         */
        describe('unstrikeNote', function() {
            it('should flag a note as relevent', function() {
                listInstance.makeNote(0, 'Push this back?');
                expect(listInstance.todos[0].notes.length).toBe(1);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);

                listInstance.strikeNote(0, 0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);

                listInstance.unstrikeNote(0, 0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
             });

            it('should ignore out-of-bound indicies', function() {
                listInstance.unstrikeNote(0, 1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.unstrikeNote(0, -1);
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });

 
     });

    /**
     * The Todo function
     */
    describe('Function: Todo', function() {

        beforeEach(function() {
            listInstance.add(DESCRIPTION, OWNER);
        });

        /**
         * makeNote
         */
        describe('makeNote', function() {
            it('should add a note object to the todo\'s list of notes', function() {
                expect(listInstance.todos[0].notes.length).toBe(0);
                listInstance.todos[0].makeNote('some important detail', OWNER);
                expect(listInstance.todos[0].notes.length).toBe(1);
                listInstance.todos[0].makeNote('another important detail', OWNER);
                listInstance.todos[0].makeNote('one more thing', OWNER);
                expect(listInstance.todos[0].notes.length).toBe(3);
            });
        });

        /**
         * destroyNote
         */
        describe('destroyNote', function() {
            it('should destroy a note attached to a todo', function() {
                listInstance.todos[0].makeNote('Push this back?', OWNER);
                expect(listInstance.todos[0].notes.length).toBe(1);

                listInstance.todos[0].destroyNote(0);
                expect(listInstance.todos[0].notes.length).toBe(0);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.todos[0].destroyNote(1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.destroyNote(-1);
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });

        /**
         * strikeNote
         */
        describe('strikeNote', function() {
            it('should flag a note as irrelevent', function() {
                listInstance.todos[0].makeNote('Push this back?', OWNER);
                expect(listInstance.todos[0].notes.length).toBe(1);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);

                listInstance.todos[0].strikeNote(0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);
            });

            it('should ignore out-of-bound indicies', function() {
                listInstance.todos[0].strikeNote(1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.strikeNote(-1);
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });
  
        /**
         * unstrikeNote
         */
        describe('unstrikeNote', function() {
            it('should flag a note as relevent', function() {
                listInstance.todos[0].makeNote('Push this back?', OWNER);
                expect(listInstance.todos[0].notes.length).toBe(1);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);

                listInstance.todos[0].strikeNote(0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);

                listInstance.todos[0].unstrikeNote(0);
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
             });

            it('should ignore out-of-bound indicies', function() {
                listInstance.todos[0].unstrikeNote(1);
                expect(listInstance.todos[0].notes[1]).toBe(undefined);
                listInstance.todos[0].unstrikeNote(-1);
                expect(listInstance.todos[0].notes[-1]).toBe(undefined);
             });
         });

        /**
         * complete
         */
        describe('complete', function() {
            it('should set the date the todo was completed', function() {
                expect(listInstance.todos[0].abandoned).toBe(null);        
                expect(listInstance.todos[0].completed).toBe(null);        
                listInstance.todos[0].complete();
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].abandoned).toBe(null);        
            });

            it('should nullify abandoned if now completed', function() {
                listInstance.todos[0].abandon();
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].completed).toBe(null);        
                listInstance.todos[0].complete();
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].abandoned).toBe(null);        
            });
         });

        /**
         * abandon
         */
        describe('abandon', function() {
            it('should set the date the todo was abandoned', function() {
                expect(listInstance.todos[0].abandoned).toBe(null);        
                expect(listInstance.todos[0].completed).toBe(null);        
                listInstance.todos[0].abandon();
                expect(listInstance.todos[0].completed).toBe(null);
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());        
            });

            it('should nullify completed if now abandoned', function() {
                listInstance.todos[0].complete();
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].abandoned).toBe(null);        
                listInstance.todos[0].abandon();
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].completed).toBe(null);        
            });
         });

        /**
         * reopen
         */
        describe('reopen', function() {

            it('should clear the completed date', function() {
                listInstance.todos[0].complete();
                expect(listInstance.todos[0].completed).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].abandoned).toBe(null);        
                listInstance.todos[0].reopen(); 
                expect(listInstance.todos[0].completed).toBe(null);        
                expect(listInstance.todos[0].abandoned).toBe(null);        
            });

            it('should clear the abandoned date', function() {
                listInstance.todos[0].abandon();
                expect(listInstance.todos[0].abandoned).toBeCloseTo(new Date());        
                expect(listInstance.todos[0].completed).toBe(null);        
                listInstance.todos[0].reopen(); 
                expect(listInstance.todos[0].abandoned).toBe(null);        
                expect(listInstance.todos[0].completed).toBe(null);        
            });
         });

        /**
         * assign
         */
        describe('assign', function() {
            it('should assign a user to the task', function() {
                expect(listInstance.todos[0].assignees.length).toBe(0);
                listInstance.todos[0].assign(WATCHER);
                expect(listInstance.todos[0].assignees.length).toBe(1);
                listInstance.todos[0].assign(OWNER);
                expect(listInstance.todos[0].assignees.length).toBe(2);
                
                expect(listInstance.todos[0].assignees[0].name).toBe('yanfen');
                expect(listInstance.todos[0].assignees[1].name).toBe('dan');
            });
        });

        /**
         * relieve
         */
        describe('relieve', function() {
            it('should relieve a user\'s previously assigned duties', function() {
                listInstance.todos[0].assign(WATCHER);
                listInstance.todos[0].assign(OWNER);
                expect(listInstance.todos[0].assignees.length).toBe(2);
                listInstance.todos[0].relieve(0);
                expect(listInstance.todos[0].assignees.length).toBe(1);
                expect(listInstance.todos[0].assignees[0].name).toBe('dan');
             });
        });
     });

    /**
     * The Note function
     */
    describe('Function: Note', function() {

        beforeEach(function() {
            listInstance.add(DESCRIPTION, OWNER);
            listInstance.todos[0].makeNote('some important detail', OWNER);
        });

        it('should exist', function() {
            expect(listInstance.todos[0].notes[0].date).toBeCloseTo(new Date());
            expect(listInstance.todos[0].notes[0].owner).toBe(OWNER);
            expect(listInstance.todos[0].notes[0].content).toBe('some important detail');
        });

        /**
         * strike
         */
        describe('strike', function() {
            it ('should make the note irrelevant', function() {
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
                listInstance.todos[0].notes[0].strike();
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);
            });
        });

        /**
         * unstrike
         */
        describe('unstrike', function() {
            it ('should restore the note\'s relevance', function() {
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
                listInstance.todos[0].notes[0].strike();
                expect(listInstance.todos[0].notes[0].relevant).toBe(false);
                listInstance.todos[0].notes[0].unstrike();
                expect(listInstance.todos[0].notes[0].relevant).toBe(true);
             });
        });
     });

});
