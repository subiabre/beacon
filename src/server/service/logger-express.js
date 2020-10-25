const logger = require('./logger').child({id: 'Express'})

const request = (req, res, next) => {
    logger.trace({req});

    next();
};

const error = (err, req, res, next) => {
    logger.error({err});
};

module.exports = {request, error}
