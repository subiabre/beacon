const path = require('path');

module.exports = {
    entry: './src/client/index.js',
    output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'public'),
    },
};