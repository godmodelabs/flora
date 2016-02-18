'use strict';

var expect = require('chai').expect;
var bunyan = require('bunyan');
var path = require('path');
var Api = require('../').Api;
var EventEmitter = require('events').EventEmitter;
var Request = require('../lib/request');

var log = bunyan.createLogger({name: 'null', streams: []});
var resourcesPath = path.join(__dirname, 'fixtures', 'empty-resources');

var testDataSource = function testDataSource() {
    return {
        process: function (request, callback) {
            callback(null, {
                data: [],
                totalCount: null
            });
        },
        prepare: function () {}
    };
};

describe('Api', function () {
    it('should be a function', function () {
        expect(Api).to.be.a('function');
    });

    it('should be instantiable', function () {
        expect(new Api()).to.be.an('object');
    });

    it('should be an EventEmitter', function () {
        expect(new Api()).to.be.instanceof(EventEmitter);
    });

    it('should emit `init` when initialized', function (done) {
        var api = new Api();
        api.on('init', function () {
            done();
        });
        api.init({log: log});
    });

    it('should emit `close` when closed', function (done) {
        var api = new Api();
        api.on('init', function () {
            api.close();
        });
        api.on('close', function () {
            done();
        });
        api.init({log: log});
    });

    it('should return an error when closed without init', function (done) {
        var api = new Api();
        api.close(function (err) {
            expect(err).to.be.an.instanceof(Error);
            expect(err.message).to.equal('Not running');
            done();
        });
    });

    it('should call the callback after close is called', function (done) {
        var api = new Api();
        api.init({log: log}, function () {
            api.close(done);
        });
    });

    it('should initialize even without a config object', function (done) {
        var api = new Api();
        api.init({resourcesPath: resourcesPath}, done);
    });

    it('should initialize a default logger', function (done) {
        var api = new Api();
        api.init({resourcesPath: resourcesPath}, function () {
            expect(api.log).to.be.an('object');
            done();
        });
    });

    it('should initialize dataSources', function (done) {
        var api = new Api();
        api.init({
            resourcesPath: resourcesPath,
            dataSources: {
                test: {
                    constructor: testDataSource
                }
            }
        }, function (err) {
            if (err) return done(err);
            done();
        });
    });

    it('should fail to initialize if dataSource lacks constructor', function (done) {
        var api = new Api();
        api.init({
            log: log,
            resourcesPath: resourcesPath,
            dataSources: {
                test: {
                    constructor: 'foo'
                }
            }
        }, function (err) {
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });

    it('should fail to initialize if dataSource is invalid', function (done) {
        var api = new Api();
        api.init({
            log: log,
            resourcesPath: resourcesPath,
            dataSources: {
                test: 'foo'
            }
        }, function (err) {
            expect(err).to.be.an.instanceof(Error);
            done();
        });
    });

    describe('plugins', function () {
        it('should allow to register plugins', function () {
            var plugin = {
                register: function (master, options) {
                    //done();
                }
            };

            var api = new Api();
            api.register(plugin);
        });

        it('should plugins registered before init', function (done) {
            var plugin = {
                register: function (master, options) {
                    done();
                }
            };

            var api = new Api();
            api.register(plugin);
            api.init({
                log: log,
                resourcesPath: resourcesPath
            }, function (err) {});
        });
    });

    describe('execute', function () {
        it('should fail when resource is unknown', function (done) {
            var api = new Api();
            api.init({
                log: log,
                resourcesPath: resourcesPath,
                dataSources: {
                    test: {
                        constructor: testDataSource
                    }
                }
            }, function (err) {
                if (err) return done(err);

                var request = new Request({
                    resource: 'foo'
                });
                api.execute(request, function (err2, response) {
                    expect(err2).to.be.an('object');
                    expect(err2.message).to.equal('Unknown resource "foo" in request');
                    api.close(done);
                });
            });
        });

        it('should fail when action does not exist', function (done) {
            var api = new Api();
            api.init({
                log: log,
                resourcesPath: resourcesPath,
                dataSources: {
                    test: {
                        constructor: testDataSource
                    }
                }
            }, function (err) {
                if (err) return done(err);

                // mock empty resource:
                api._resources['no-actions'] = {};

                var request = new Request({
                    resource: 'no-actions'
                });
                api.execute(request, function (err2, response) {
                    expect(err2).to.be.an('object');
                    expect(err2.message).to.equal('Action "retrieve" is not implemented');
                    api.close(done);
                });
            });
        });

        it('should fail when Api#init is not done', function (done) {
            var api = new Api();
            api.init({
                log: log,
                resourcesPath: resourcesPath,
                dataSources: {
                    test: {
                        constructor: testDataSource
                    }
                }
            }, function () {});

            var request = new Request({
                resource: 'foo'
            });
            api.execute(request, function (err, response) {
                expect(response).to.be.undefined;
                expect(err).to.be.an('error');
                expect(err.message).to.equal('Not initialized');
                done();
            });
        });
    });
});
