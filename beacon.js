const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const socket = require('./src/socket');
const appcli = require('./src/appcli');

io.engine.generateId = require('./src/utils/socketid');

app.use(express.static(__dirname + '/src/public'));
app.use(require('./src/routes/youtube'));
app.use(require('./src/routes/local'));

socket.events(io);

appcli.server(server);
appcli.data();
appcli.sockets();
