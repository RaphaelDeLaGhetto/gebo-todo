'use strict';

describe('Service: List', function () {

    var OWNER = 'Dan',
        DESCRIPTION = 'A new thing todo',
        TODO = {
            description: DESCRIPTION,
            owner: OWNER,
        };


    // load the service's module
    beforeEach(module('geboClientApp'));

    // instantiate service
    var List,
        listInstance;

    beforeEach(inject(function (_List_) {
        List = _List_;
        listInstance = List.getNewObject(DESCRIPTION, OWNER);
    }));

    it('should do something', function () {
        expect(!!List).toBe(true);
    });

    /**
     * getNewObject
     */
    describe('getNewObject', function() {
        it('should initialize a list', function() {
            var list = List.getNewObject(DESCRIPTION, OWNER);
            expect(list.description).toBe(DESCRIPTION);
            expect(list.owner).toBe(OWNER);
            expect(list.date).toEqual(new Date());
            expect(list.watchers).toEqual([]);
        });
    });

    /**
     * The List function
     */
    describe('Function: List', function() {

        describe('add', function() {
            it('should add a todo', function() {
                expect(listInstance.todos.length).toBe(0);

                listInstance.add(DESCRIPTION, OWNER);
    
                expect(listInstance.todos.length).toBe(1);
                expect(listInstance.todos[0].description).toBe(DESCRIPTION);
                expect(listInstance.todos[0].owner).toBe(OWNER);
                expect(listInstance.todos[0].assignee).toBe(null);
                expect(listInstance.todos[0].date).toEqual(new Date());
                expect(listInstance.todos[0].deadline).toBe(null);
                expect(listInstance.todos[0].completed).toBe(null);
                expect(listInstance.todos[0].abandoned).toBe(null);
                expect(listInstance.todos[0].notes).toEqual([]);
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
         * complete
         */
        describe('complete', function() {
            it('should set the date the todo was completed', function() {
                expect(listInstance.todos[0].abandoned).toBe(null);        
                expect(listInstance.todos[0].completed).toBe(null);        
                listInstance.todos[0].complete();
                expect(listInstance.todos[0].completed).toEqual(new Date());        
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
                expect(listInstance.todos[0].abandoned).toEqual(new Date());        
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
            expect(listInstance.todos[0].notes[0].owner).toBe(OWNER);
            expect(listInstance.todos[0].notes[0].content).toBe('some important detail');
            expect(listInstance.todos[0].notes[0].date).toEqual(new Date());
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