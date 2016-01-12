'use strict';

/**
 * Flora response object.
 *
 * @constructor
 * @param {Request} request
 * @param {Function} callback
 */
var Response = module.exports = function (request, callback) {
    this.request = request;

    /**
     * Response meta information
     *
     * @type {Object}
     * @name Response#meta
     */
    this.meta = {statusCode: 200};
    Object.defineProperty(this.meta, 'headers', {value: {}, writable: true});

    /**
     * Error info (null on success)
     *
     * @type {Object}
     * @name Response#error
     */
    this.error;

    /**
     * Response data
     *
     * @type {(Object|Array.<Object>)}
     * @name Response#data
     */
    this.data;

    /**
     * Pagination information
     *
     * @type {(null|Object)}
     * @name Response#cursor
     */
    this.cursor;

    /**
     * @type {Function}
     * @private
     */
    this._callback = callback || function () {};
    this._sent = false;
};

/**
 * Add profiling and meta data to the response and call our callback.
 *
 * @param {(Object|Array.<Object>|Error)} payload  - Response data
 */
Response.prototype.send = function (payload) {
    var self = this;

    if (this._sent) {
        return this._callback(new Error('Response#send was already called'));
    }
    this._sent = true;

    if (payload instanceof Error) {
        return this._callback(payload);
    } else {
        this.data = payload;
    }

    process.nextTick(function () {
        self._callback(null, self);
    });

    return this;
};
