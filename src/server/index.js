const path = require('path');
const ip = require('ip').address()
const port = 3000 || process.env.PORT

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socket = require('./service/sockets-events-service');
const logger = require('./service/logger');

app.use(express.static(path.join(__dirname, '../../public')));
app.use(require('./routes/youtube'));
app.use(require('./routes/local'));

socket.eventListener(io);

server.listen(port, () => {
    logger.info(`Server started`);
    logger.info(`http://localhost:${port}`)
    logger.info(`http://${ip}:${port}`)
})
