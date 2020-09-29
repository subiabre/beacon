const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const socket = require('./src/socket');
const routes = require('./src/routes');
const appcli = require('./src/appcli');

io.engine.generateId = require('./src/utils/socketid');

app.use(express.static(__dirname + '/public'));
app.use(routes);

socket.events(io);

appcli.server(server);
appcli.data();
appcli.sockets();
