"use strict";

const bunyan = require('bunyan')
const logger = bunyan.createLogger({
    name: 'castor',
    level: 'trace'
})

module.exports = logger
