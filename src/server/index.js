const path = require('path');
const port = 3000 || process.env.PORT

const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);
const socket = require('./service/sockets-events-service')

app.use(express.static(path.join(__dirname, '../../public')));
app.use(require('./routes/youtube'));
app.use(require('./routes/local'));

socket.eventListener(io);

server.listen(port, () => {

})
