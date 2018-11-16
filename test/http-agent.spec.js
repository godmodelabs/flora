'use strict';

const http = require('http');
const url = require('url');

const chai = require('chai');
const { expect } = chai;
const sandbox = require('sinon').createSandbox();

const HttpAgent = require('../lib/http-agent');
const PORT = 8080;

chai.use(require('sinon-chai'));

describe('http-agent', () => {
    const reqOpts = url.parse(`http://localhost:${PORT}`);
    let httpServer;
    let sockets;
    let agent;

    beforeEach(done => {
        sockets = new Set();
        httpServer = http
            .createServer((req, res) => res.end('pong'))
            .on('connection', socket => {
                sockets.add(socket);
                socket.on('close', () => sockets.delete(socket));
            })
            .on('listening', done)
            .listen(PORT);
    });

    afterEach(done => {
        agent.destroy();
        for (const socket of sockets.values()) {
            socket.destroy();
        }
        httpServer.close(() => done());
    });

    it('should use keep-alive by default', done => {
        agent = new HttpAgent();
        const createConnectionSpy = sandbox.spy(agent, 'createConnection');

        http.get(Object.assign({}, reqOpts, { agent }), () => {
            expect(createConnectionSpy).to.have.been.calledWithMatch({
                keepAlive: true
            });
            done();
        });
    });

    describe('defaults', () => {
        [
            [
                'should limit maximum number of sockets per host to 10 by default',
                { maxSockets: 10 }
            ],
            [
                'should limit maximum number of free sockets to 10 by default',
                { maxFreeSockets: 10 }
            ]
        ].forEach(([description, setting]) => {
            it(description, done => {
                agent = new HttpAgent();
                const createConnectionSpy = sandbox.spy(
                    agent,
                    'createConnection'
                );

                http.get(Object.assign({}, reqOpts, { agent }), () => {
                    expect(createConnectionSpy).to.have.been.calledWithMatch(
                        setting
                    );
                    done();
                });
            });
        });
    });

    [
        ['should configure maximum number of sockets', { maxSockets: 50 }],
        [
            'should configure maximum number of free sockets',
            { maxFreeSockets: 5 }
        ]
    ].forEach(([description, setting]) => {
        it(description, done => {
            agent = new HttpAgent(setting);
            const createConnectionSpy = sandbox.spy(agent, 'createConnection');

            http.get(Object.assign({}, reqOpts, { agent }), () => {
                expect(createConnectionSpy).to.have.been.calledWithMatch(
                    setting
                );
                done();
            });
        });
    });

    it('should increment data source connection counter', done => {
        const _status = { increment: () => {} };
        const statusSpy = sandbox.spy(_status, 'increment');
        agent = new HttpAgent({ _status });

        http.get(Object.assign({}, reqOpts, { agent }), () => {
            expect(statusSpy).to.have.been.calledWith('dataSourceConnects');
            done();
        });
    });
});
