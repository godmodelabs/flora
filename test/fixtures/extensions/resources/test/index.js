'use strict';

module.exports = function (api) {
    return {
        extensions: {
            item: function (item) {
                item.bar = 'baz';
            }
        },

        actions: {
            retrieve: function (request, response) {
                return api.resourceProcessor.handle(request, response);
            }
        }
    };
};