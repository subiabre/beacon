"use strict";

const bunyan = require('bunyan')

const logger = bunyan.createLogger({
    name: 'castor',
    level: 'trace',
    serializers: {
        req: require('bunyan-express-serializer'),
        res: bunyan.stdSerializers.res,
        err: bunyan.stdSerializers.err
    }
})

module.exports = logger
