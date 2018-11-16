'use strict';

const { Agent } = require('http');

class FloraHttpAgent extends Agent {
    constructor(opts = {}) {
        const defaults = { maxSockets: 10, maxFreeSockets: 10 };
        super(Object.assign({}, defaults, opts, { keepAlive: true }));
        this._status = opts._status;
    }

    createConnection(...args) {
        if (this._status) {
            this._status.increment('dataSourceConnects');
        }
        return Agent.prototype.createConnection.apply(this, args);
    }
}

module.exports = FloraHttpAgent;
