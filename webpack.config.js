const path = require('path');

module.exports = {
    entry: './src/public/client.js',
    output: {
        filename: 'client.js',
        path: path.resolve(__dirname, 'dist'),
    },
};