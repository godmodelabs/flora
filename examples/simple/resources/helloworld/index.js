'use strict';

module.exports = () => ({
    actions: {
        transparent: (request, response) => {
            // eslint-disable-next-line
            const buf = Buffer.from([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59]);
            response.header('Content-Type', 'image/gif');
            return buf;
        },

        hello: () => {
            return Promise.resolve('Hello World');
            // return "Hello World"
        },

        user: {
            default: () => {
                return { name: 'Alice' };
            },
            image: (request, response) => {
                // eslint-disable-next-line
                const buf = Buffer.from([71, 73, 70, 56, 57, 97, 1, 0, 1, 0, 128, 0, 0, 0, 0, 0, 0, 0, 0, 33, 249, 4, 1, 0, 0, 0, 0, 44, 0, 0, 0, 0, 1, 0, 1, 0, 0, 2, 2, 68, 1, 0, 59]);
                response.header('Content-Type', 'image/gif');
                return buf;
            }
        }
    }
});
