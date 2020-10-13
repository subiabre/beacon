const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const socket = require('./src/socket');
const appcli = require('./src/appcli');
const local = require('./src/routes/local');
const youtube = require('./src/routes/youtube');

io.engine.generateId = require('./src/utils/socketid');

app.use(express.static(__dirname + '/public'));
app.use(local);
app.use(youtube);

socket.events(io);

appcli.server(server);
appcli.data();
appcli.sockets();
