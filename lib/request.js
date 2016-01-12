'use strict';

var Status = require('flora-cluster').Status;

/**
 * Create new request
 *
 * @constructor
 * @param {Object} options          - Request configuration
 * @param {string} options.resource - Requested resource
 * @param {string=} options.action  - Resource action
 * @param {string=} options.format  - Response format
 */
module.exports = function (options) {
    var self = this;

    var readable = function (property, value) {
        Object.defineProperty(self, property, {
            value: value,
            configurable: false,
            enumerable: false
        });
    };

    var writable = function (property, value) {
        Object.defineProperty(self, property, {
            value: value,
            configurable: true,
            enumerable: false,
            writable: true
        });
    };

    options = options || {};

    /**
     * Requested resource
     *
     * @name Request#resource
     * @type {string}
     * @readonly
     */
    this.resource = options.resource;

    /**
     * Resource action to execute
     *
     * @type {string}
     * @name Request#action
     * @default json
     * @readonly
     */
    this.action = options.action || 'retrieve';

    /**
     * Response format
     *
     * @type {string}
     * @name Request#format
     * @default json
     * @readonly
     */
    this.format = options.format || 'json';

    /**
     * Status helper object
     *
     * @type {Status}
     * @name Request#_status
     * @readonly
     */
    readable('_status', options._status || new Status());

    /**
     * Authorization information
     *
     * @name Request#_auth
     * @readonly
     */
    writable('_auth', null);

    /**
     * HTTP-Request object (if available)
     *
     * @type {http.IncomingMessage}
     * @name Request#_httpRequest
     * @readonly
     */
    readable('_httpRequest', options._httpRequest);

    for (var key in options) { // copy custom parameters
        if (!this.hasOwnProperty(key)) this[key] = options[key];
    }
};
