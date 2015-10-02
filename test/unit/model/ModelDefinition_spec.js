/* jshint nonew:false */
let proxyquire = require('proxyquire').noCallThru();
let ModelCollection = function () {};
ModelCollection.create = sinon.stub().returns(new ModelCollection());
proxyquire('d2/model/ModelDefinition', {
    'd2/model/ModelCollection': ModelCollection
});

import fixtures from 'fixtures/fixtures';
import {DIRTY_PROPERTY_LIST} from 'd2/model/ModelBase';

// TODO: Can not use import here as babel will not respect the override
let ModelDefinition = require('d2/model/ModelDefinition');

describe('ModelDefinition', () => {
    'use strict';

    var modelDefinition;

    beforeEach(() => {
        ModelCollection.create.reset();

        modelDefinition = new ModelDefinition('dataElement', 'dataElements');
    });

    it('should not be allowed to be called without new', () => {
        expect(() => ModelDefinition()).to.throw('Cannot call a class as a function'); //jshint ignore:line
    });

    it('should create a ModelDefinition object', () => {
        expect(modelDefinition).to.be.instanceof(ModelDefinition);
    });

    it('should not add epiEndpoint when it does not exist', () => {
        expect(modelDefinition.apiEndpoint).to.be.undefined;
    });

    it('should throw an error when a name is not specified', () => {
        function shouldThrow() {
            new ModelDefinition();
        }
        expect(shouldThrow).to.throw('Value should be provided');
    });

    it('should throw if the name is not a string', () => {
        function shouldThrow() {
            new ModelDefinition({});
        }
        expect(shouldThrow).to.throw('Expected [object Object] to have type string');
    });

    it('should throw an error when plural is not specified', () => {
        function shouldThrow() {
            new ModelDefinition('dataElement');
        }
        expect(shouldThrow).to.throw('Plural should be provided');
    });

    describe('instance', () => {
        it('should not be able to change the name', () => {
            var isWritable = Object.getOwnPropertyDescriptor(modelDefinition, 'name').writable;
            var isConfigurable = Object.getOwnPropertyDescriptor(modelDefinition, 'name').configurable;

            expect(isWritable).to.be.false;
            expect(isConfigurable).to.be.false;
        });

        it('should not change the name', () => {
            function shouldThrow() {
                modelDefinition.name = 'anotherName';

                if (modelDefinition.name !== 'anotherName') {
                    throw new Error('');
                }
            }

            expect(modelDefinition.name).to.equal('dataElement');
            expect(shouldThrow).to.throw();
        });

        it('should not be able to change the isMetaData', () => {
            var isWritable = Object.getOwnPropertyDescriptor(modelDefinition, 'isMetaData').writable;
            var isConfigurable = Object.getOwnPropertyDescriptor(modelDefinition, 'isMetaData').configurable;

            expect(isWritable).to.be.false;
            expect(isConfigurable).to.be.false;
        });

        it('should not change the isMetaData', () => {
            function shouldThrow() {
                modelDefinition.isMetaData = true;

                if (modelDefinition.isMetaData !== true) {
                    throw new Error('');
                }
            }

            expect(modelDefinition.isMetaData).to.equal(false);
            expect(shouldThrow).to.throw();
        });
    });

    describe('createFromSchema', () => {
        var dataElementModelDefinition;

        beforeEach(() => {
            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'), fixtures.get('/api/attributes').attributes);
        });

        it('should be a method on ModelDefinition', () => {
            expect(ModelDefinition.createFromSchema).to.not.be.undefined;
        });

        it('should throw if the schema is not provided', () => {
            expect(ModelDefinition.createFromSchema).to.throw('Schema should be provided');
        });

        describe('dataElementSchema', () => {
            it('should return a ModelDefinition object', () => {
                expect(dataElementModelDefinition).to.be.instanceof(ModelDefinition);
            });

            it('should set the name on the definition', () => {
                expect(dataElementModelDefinition.name).to.equal('dataElement');
            });

            it('should set if it is a metadata model', () => {
                expect(dataElementModelDefinition.isMetaData).to.be.true;
            });

            it('should set the epiEndpoint', () => {
                expect(dataElementModelDefinition.apiEndpoint).to.equal('/dataElements');
            });

            it('should set metadata to false if it is not a metadata model', () => {
                var nonMetaDataModel = fixtures.get('/api/schemas/dataElement');
                nonMetaDataModel.metadata = false;

                dataElementModelDefinition = ModelDefinition.createFromSchema(nonMetaDataModel);

                expect(dataElementModelDefinition.isMetaData).to.be.false;
            });

            it('should a properties property for each of the schema properties', () => {
                expect(Object.keys(dataElementModelDefinition.modelProperties).length).to.equal(39);
            });

            it('should not be able to modify the modelProperties array', () => {
                function shouldThrow() {
                    dataElementModelDefinition.modelProperties.anotherKey = {};

                    //TODO: There is an implementation bug in PhantomJS that does not properly freeze the array
                    if (Object.keys(dataElementModelDefinition.modelProperties).length === 39) {
                        throw new Error();
                    }
                }

                expect(shouldThrow).to.throw();
                expect(Object.keys(dataElementModelDefinition.modelProperties).length).to.equal(39);
            });
        });

        describe('modelProperties', () => {
            var modelProperties;

            beforeEach(() => {
                modelProperties = dataElementModelDefinition.modelProperties;
            });

            it('should be an object', () => {
                expect(modelProperties.name).to.be.instanceof(Object);
            });

            it('should throw an error when a type is not found', () => {
                var dataElementModelDefinition;
                var schema = fixtures.get('/api/schemas/dataElement');
                schema.properties.push({
                    name: 'unknownProperty',
                    propertyType: 'uio.some.unknown.type'
                });
                function shouldThrow() {
                    dataElementModelDefinition = ModelDefinition.createFromSchema(schema);
                }

                expect(shouldThrow).to.throw('Type from schema "uio.some.unknown.type" not found available type list.');
            });

            it('should use the collection name for collections', () => {
                expect(modelProperties.dataElementGroups).to.not.be.undefined;
                expect(modelProperties.dataElementGroup).to.be.undefined;
            });

            it('should add a get method to the propertyDescriptor', () => {
                expect(modelProperties.name.get).to.be.instanceof(Function);
            });

            it('should add a set method to the propertyDescriptor for name', () => {
                expect(modelProperties.name.set).to.be.instanceof(Function);
            });

            it('should not have a set method for dimensionType', () => {
                expect(modelProperties.dimensionType.set).not.to.be.instanceof(Function);
            });

            it('should create getter function on the propertyDescriptor', () => {
                var model = {
                    dataValues: {
                        name: 'Mark'
                    }
                };

                expect(modelProperties.name.get.call(model)).to.equal('Mark');
            });

            it('should create setter function on the propertyDescriptor', () => {
                let model = {
                    dataValues: {

                    }
                };
                model[DIRTY_PROPERTY_LIST] = new Set([]);

                modelProperties.name.set.call(model, 'James');

                expect(model.dataValues.name).to.equal('James');
            });

            describe('setter', () => {
                let model;

                beforeEach(() => {
                    model = {
                        dirty: false,
                        dataValues: {

                        }
                    };
                    model[DIRTY_PROPERTY_LIST] = new Set([]);

                });

                it('should set the dirty property to true when a value is set', () => {
                    modelProperties.name.set.call(model, 'James');

                    expect(model.dirty).to.be.true;
                });

                it('should not set the dirty property to true when the value is the same', () => {
                    model.dataValues.name = 'James';
                    modelProperties.name.set.call(model, 'James');

                    expect(model.dirty).to.be.false;
                });

                //TODO: Look at a deep equals for this dirty check
                //it('should not set the dirty property when an identical object is added', () => {
                //    model.dataValues.name = {name: 'James'};
                //    modelProperties.name.set.call(model, {name: 'James'});
                //
                //    expect(model.dirty).to.be.false;
                //});

                it('should set the dirty property when a different object is added', () => {
                    model.dataValues.name = {name: 'James'};
                    modelProperties.name.set.call(model, {name: 'James', last: 'Doe'});

                    expect(model.dirty).to.be.true;
                });
            });
        });

        describe('modelValidations', () => {
            let modelValidations;

            beforeEach(() => {
                modelValidations = dataElementModelDefinition.modelValidations;
            });

            describe('created', () => {
                it('should set the data object as a type for date fields', () => {
                    expect(modelValidations.created.type).to.equal('DATE');
                });

                it('should be owned by this schema', () => {
                    expect(modelValidations.created.owner).to.be.true;
                });
            });

            describe('externalAccess', () => {
                it('should set the boolean datatype for externalAccess', () => {
                    expect(modelValidations.externalAccess.type).to.equal('BOOLEAN');
                });

                it('should not be owned by this schema', () => {
                    expect(modelValidations.externalAccess.owner).to.be.false;
                });

                //TODO: This currently has some sort of max value
                //it('should not have a maxLength property', () => {
                //    expect(modelValidations.externalAccess.maxLength).toBe(undefined);
                //});
            });

            describe('id', () => {
                it('should have a maxLength', () => {
                    expect(modelValidations.id.max).to.equal(11);
                });
            });

            describe('name', () => {
                it('should have have a type property', () => {
                    expect(modelValidations.name.type).to.equal('TEXT');
                });

                it('should have a persisted property', () => {
                    expect(modelValidations.name.persisted).to.be.true;
                });

                it('should have a required property', () => {
                    expect(modelValidations.name.required).to.be.true;
                });

                it('should have an owner property', () => {
                    expect(modelValidations.name.owner).to.be.true;
                });
            });

            describe('domainType', () => {
                it('should have loaded the constants', () => {
                    expect(modelValidations.domainType.constants).to.deep.equal(['AGGREGATE', 'TRACKER']);
                });
            });

            it('should add the referenceType to the optionSet and commentOptionSet', () => {
                expect(modelValidations.commentOptionSet.referenceType).to.equal('optionSet');
                expect(modelValidations.optionSet.referenceType).to.equal('optionSet');
            });

            it('should add the referenceType to the categoryCombo property', () => {
                expect(modelValidations.categoryCombo.referenceType).to.equal('categoryCombo');
            });

            it('should add the referenceType to the user property', () => {
                expect(modelValidations.user.referenceType).to.equal('user');
            });

            it('should not add a referenceType for a property that are not a reference', () => {
                expect(modelValidations.name.referenceType).to.be.undefined;
            });

            describe('collection reference', () => {
                let indicatorGroupModelDefinition;
                let modelValidations;

                beforeEach(() => {
                    indicatorGroupModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/indicatorGroup'));
                    modelValidations = indicatorGroupModelDefinition.modelValidations;
                });

                it('should add a reference type for a collection of references', () => {
                    expect(modelValidations.indicators.referenceType).to.equal('indicator');
                });

                it('should not add a reference type for a collection of complex objects', () => {
                    expect(modelValidations.userGroupAccesses.referenceType).to.be.undefined;
                });
            });
        });

        describe('specialized definitions', () => {
            let UserModelDefinition;
            let userModelDefinition;

            beforeEach(() => {
                UserModelDefinition = require('d2/model/ModelDefinition').specialClasses.user;

                userModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/user'));
            });

            it('should return a UserModelDefinition for the user schema', () => {
                expect(userModelDefinition).to.be.instanceof(UserModelDefinition);
            });
        });

        describe('attribute properties', () => {
            let attributeProperties;

            beforeEach(() => {
                attributeProperties = dataElementModelDefinition.attributeProperties;
            });

            it('should have added the attribute properties onto the model', () => {
                expect(attributeProperties).to.not.be.undefined;
            });

            it('should be descriptor objects', () => {
                expect(attributeProperties.name).to.be.instanceof(Object);
            });
        });
    });

    describe('create', () => {
        var Model;
        var dataElementModelDefinition;

        //TODO: Figure out a way to mock a require
        beforeEach(() => {
            Model = require('d2/model/Model');

            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'));
        });

        //TODO: Look at these tests
        //it('should call the model constructor', () => {
        //    dataElementModelDefinition.create();
        //
        //    expect(tempD2.Model).toHaveBeenCalled();
        //});
        //
        //it('should call the model constructor with the the modelDefinition', () => {
        //    dataElementModelDefinition.create();
        //
        //    expect(tempD2.Model).to.be.calledWith(dataElementModelDefinition);
        //});

        //TODO: This is currently not a pure unit test as we haven't mocked out Model
        it('should return an instance of Model', () => {
            expect(dataElementModelDefinition.create()).to.be.instanceof(Model);
        });
    });

    describe('get', () => {
        var dataElementModelDefinition;

        beforeEach (() => {
            ModelDefinition.prototype.api = {
                get: stub().returns(new Promise((resolve) => {
                    resolve({name: 'BS_COLL (N, DSD) TARGET: Blood Units Donated'});
                }))
            };

            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'));
        });

        it('should throw an error when the given id is not a string', () => {
            function shouldThrow() {
                dataElementModelDefinition.get();
            }

            expect(shouldThrow).to.throw('Identifier should be provided');
        });

        it('should return a promise', () => {
            var modelPromise = dataElementModelDefinition
                .get('d4343fsss');

            expect(modelPromise.then).to.be.instanceof(Function);
        });

        it('should call the api for the requested id', () => {
            dataElementModelDefinition.get('d4343fsss');

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements/d4343fsss', {fields: ':all'});
        });

        it('should set the data onto the model when it is available', (done) => {
            dataElementModelDefinition.get('d4343fsss')
                .then((dataElementModel) => {
                    expect(dataElementModel.name).to.equal('BS_COLL (N, DSD) TARGET: Blood Units Donated');
                    done();
                });
        });

        it('should reject the promise with the message when the request fails', (done) => {
            ModelDefinition.prototype.api.get = stub().returns(new Promise((resolve, reject) => {
                reject({data: 'id not found'});
            }));

            dataElementModelDefinition.get('d4343fsss')
                .catch((dataElementError) => {
                    expect(dataElementError).to.equal('id not found');
                    done();
                });
        });

        describe('multiple', () => {
            it('should return a ModelCollection object', (done) => {
                const dataElementsResult = fixtures.get('/api/dataElements');
                ModelDefinition.prototype.api.get = stub().returns(Promise.resolve(dataElementsResult));

                dataElementModelDefinition.get(['id1', 'id2'])
                    .then((dataElementCollection) => {
                        expect(dataElementCollection).to.be.instanceof(ModelCollection);
                        done();
                    })
                    .catch(done);
            });

            it('should call the api with the in filter', (done) => {
                const dataElementsResult = fixtures.get('/api/dataElements');
                ModelDefinition.prototype.api.get = stub().returns(Promise.resolve(dataElementsResult));

                dataElementModelDefinition.get(['id1', 'id2'])
                    .then((dataElementCollection) => {
                        expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {filter: ['id:in:[id1,id2]'], fields: ':all'});
                        done();
                    })
                    .catch(done);
            });
        });
    });

    describe('list', () => {
        let dataElementsResult = fixtures.get('/api/dataElements');
        let dataElementModelDefinition;

        beforeEach (() => {
            ModelDefinition.prototype.api = {
                get: stub().returns(new Promise((resolve) => {
                    resolve(dataElementsResult);
                }))
            };

            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'));
        });

        it('should be a function', () => {
            expect(dataElementModelDefinition.list).to.be.instanceof(Function);
        });

        it('should call the get method on the api', function () {
            dataElementModelDefinition.list();

            expect(ModelDefinition.prototype.api.get).to.be.called;
        });

        it('should return a promise', function () {
            expect(dataElementModelDefinition.list()).to.be.instanceof(Promise);
        });

        it('should call the get method on the api with the endpoint of the model', () => {
            dataElementModelDefinition.list();

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all'});
        });

        it('should return a model collection object', (done) => {
            dataElementModelDefinition.list()
                .then((dataElementCollection) => {
                    expect(dataElementCollection).to.be.instanceof(ModelCollection);
                    done();
                });
        });

        it('should not call the model collection create function with', (done) => {
            dataElementModelDefinition.list()
                .then(() => {
                    expect(ModelCollection.create).to.not.be.calledWithNew;
                    done();
                });
        });

        it('should call the model collection constructor with the correct data', (done) => {
            dataElementModelDefinition.list()
                .then(() => {
                    let firstCallArguments = ModelCollection.create.getCall(0).args;

                    expect(firstCallArguments[0]).to.equal(dataElementModelDefinition);
                    expect(firstCallArguments[1].length).to.equal(5);
                    expect(firstCallArguments[2]).to.equal(dataElementsResult.pager);

                    done();
                });
        });

        it('should call the api get method with the correct parameters after filters are set', () => {
            dataElementModelDefinition
                .filter().on('name').like('John')
                .list();

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all', filter: ['name:like:John']});
        });

        it('should return a separate modelDefinition when filter is called', () => {
            expect(dataElementModelDefinition.filter).not.to.equal(dataElementModelDefinition);
        });

        it('should not influence the list method of the default modelDefinition', () => {
            dataElementModelDefinition
                .filter().on('name').like('John')
                .list();

            dataElementModelDefinition.list();

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all'});
            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all', filter: ['name:like:John']});
        });

        it('should support multiple filters', () => {
            dataElementModelDefinition
                .filter().on('name').like('John')
                .filter().on('username').equals('admin')
                .list();

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all', filter: ['name:like:John', 'username:eq:admin']});
        });
    });

    describe('clone', () => {
        let dataElementsResult = fixtures.get('/api/dataElements');
        let dataElementModelDefinition;

        beforeEach (() => {
            ModelDefinition.prototype.api = {
                get: stub().returns(new Promise((resolve) => {
                    resolve(dataElementsResult);
                }))
            };

            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'));
        });

        it('should be a method', () => {
            expect(dataElementModelDefinition.clone).to.be.instanceof(Function);
        });

        it('should return a cloned modelDefinition', () => {
            expect(dataElementModelDefinition.clone()).not.to.equal(dataElementModelDefinition);
        });

        it('should deep equal the creator', () => {
            let clonedDefinition = dataElementModelDefinition.clone();

            expect(clonedDefinition.name).to.equal(dataElementModelDefinition.name);
            expect(clonedDefinition.plural).to.equal(dataElementModelDefinition.plural);
            expect(clonedDefinition.isMetaData).to.equal(dataElementModelDefinition.isMetaData);
            expect(clonedDefinition.apiEndpoint).to.equal(dataElementModelDefinition.apiEndpoint);
            expect(clonedDefinition.modelProperties).to.equal(dataElementModelDefinition.modelProperties);
        });

        it('should not have reset the filter', () => {
            let clonedDefinition = dataElementModelDefinition.clone();

            expect(clonedDefinition.filters).not.to.equal(dataElementModelDefinition.filters);
        });

        it('should still work like normal modelDefinition', () => {
            let clonedDefinition = dataElementModelDefinition.clone();

            clonedDefinition.list();

            expect(ModelDefinition.prototype.api.get).to.be.calledWith('/dataElements', {fields: ':all'});
        });
    });

    describe('save', () => {
        let apiUpdateStub;
        let apiPostStub;
        let model;
        let userModelDefinition;

        beforeEach(() => {
            let singleUserAllFields = fixtures.get('singleUserAllFields');

            apiUpdateStub = stub().returns(new Promise((resolve) => {
                resolve({name: 'BS_COLL (N, DSD) TARGET: Blood Units Donated'});
            }));
            apiPostStub = stub().returns(new Promise((resolve) => {
                resolve({name: 'BS_COLL (N, DSD) TARGET: Blood Units Donated'});
            }));

            ModelDefinition.prototype.api = {
                update: apiUpdateStub,
                post: apiPostStub
            };

            userModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/user'));

            class Model {
                constructor() {
                    this.dataValues = {};
                    this[DIRTY_PROPERTY_LIST] = new Set([]);
                }
            }
            model = new Model();

            Object.keys(singleUserAllFields).forEach((key) => {
                model.dataValues[key] = singleUserAllFields[key];
                model[key] = singleUserAllFields[key];
            });
        });

        it('should be a method that returns a promise', () => {
            expect(userModelDefinition.save(model)).to.be.instanceof(Promise);
        });

        it('should call the update method on the api', () => {
            userModelDefinition.save(model);

            expect(apiUpdateStub).to.be.called;
        });

        it('should pass only the properties that are owned to the api', () => {
            let expectedPayload = fixtures.get('singleUserOwnerFields');

            userModelDefinition.save(model);

            expect(apiUpdateStub.getCall(0).args[1]).to.deep.equal(expectedPayload);
        });

        it('should let a falsy value pass as an owned property', () => {
            let expectedPayload = fixtures.get('singleUserOwnerFields');
            expectedPayload.surname = '';

            model.dataValues.surname = '';
            userModelDefinition.save(model);

            expect(apiUpdateStub.getCall(0).args[1].surname).to.deep.equal(expectedPayload.surname);
        });

        it('should not let undefined pass as a value', () => {
            let expectedPayload = fixtures.get('singleUserOwnerFields');
            delete expectedPayload.surname;

            model.dataValues.surname = undefined;
            userModelDefinition.save(model);

            expect(apiUpdateStub.getCall(0).args[1].surname).to.deep.equal(expectedPayload.surname);
        });

        it('should not let null pass as a value', () => {
            let expectedPayload = fixtures.get('singleUserOwnerFields');
            delete expectedPayload.surname;

            model.dataValues.surname = null;
            userModelDefinition.save(model);

            expect(apiUpdateStub.getCall(0).args[1].surname).to.deep.equal(expectedPayload.surname);
        });

        it('should save to the url set on the model', () => {
            userModelDefinition.save(model);

            expect(apiUpdateStub.getCall(0).args[0]).to.equal(fixtures.get('singleUserAllFields').href);
        });

        it('should save a new object using a post', () => {
            //Objects without id are concidered "new"
            delete model.id;

            userModelDefinition.save(model);

            expect(apiPostStub).to.be.called;
        });
    });

    describe('delete', () => {
        let apiDeleteStub;
        let model;
        let userModelDefinition;

        beforeEach(() => {
            let singleUserAllFields = fixtures.get('singleUserAllFields');

            apiDeleteStub = stub().returns(new Promise((resolve) => {
                resolve();
            }));

            ModelDefinition.prototype.api = {
                delete: apiDeleteStub
            };

            userModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/user'));

            class Model {
                constructor() {
                    this.dataValues = {};
                    this[DIRTY_PROPERTY_LIST] = new Set([]);
                }
            }
            model = new Model();

            Object.keys(singleUserAllFields).forEach((key) => {
                model.dataValues[key] = singleUserAllFields[key];
                model[key] = singleUserAllFields[key];
            });
        });

        it('should call the delete method on the api', () => {
            userModelDefinition.delete(model);

            expect(apiDeleteStub).to.be.called;
        });

        it('should call delete with the url', () => {
            userModelDefinition.delete(model);

            expect(apiDeleteStub).to.be.calledWith(model.href);
        });

        it('should return a promise', () => {
            expect(userModelDefinition.delete(model)).to.be.instanceof(Promise);
        });
    });

    describe('getOwnedPropertyNames', () => {
        let dataElementModelDefinition;

        beforeEach(() => {
            dataElementModelDefinition = ModelDefinition.createFromSchema(fixtures.get('/api/schemas/dataElement'));
        });

        it('should return only the owned properties', () => {
            let expectedDataElementProperties = [
                'lastUpdated', 'code', 'id', 'created', 'name', 'formName', 'legendSet',
                'shortName', 'zeroIsSignificant', 'publicAccess', 'commentOptionSet',
                'aggregationOperator', 'type', 'url', 'numberType', 'optionSet',
                'domainType', 'description', 'categoryCombo', 'user', 'textType',
                'aggregationLevels', 'attributeValues', 'userGroupAccesses'
            ].sort();
            let ownProperties = dataElementModelDefinition.getOwnedPropertyNames();

            expect(ownProperties.sort()).to.deep.equal(expectedDataElementProperties);
        });
    });
});

describe('ModelDefinition subsclasses', () => {
    let ModelDefinition;
    let getOnApiStub;

    beforeEach(() => {
        getOnApiStub = stub().returns(new Promise(function () {}));
        ModelDefinition = require('d2/model/ModelDefinition');

        ModelDefinition.prototype.api = {
            get: getOnApiStub
        };
    });

    describe('UserModelDefinition', () => {
        let UserModelDefinition;
        let userModelDefinition;

        beforeEach(() => {
            UserModelDefinition = ModelDefinition.specialClasses.user;

            userModelDefinition = new UserModelDefinition('user', 'users', {}, {}, {});
        });

        it('should be instance of Model', () => {
            expect(userModelDefinition).to.be.instanceof(ModelDefinition);
        });

        it('should call the get function with the extra parameters', function () {
            userModelDefinition.get('myUserId');

            expect(getOnApiStub).to.be.calledWith('/myUserId', {fields: ':all,userCredentials[:owner]'});
        });
    });
});
/* jshint nonew:true */
