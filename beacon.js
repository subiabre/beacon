const express = require('express');
const app = express();

const server = require('http').createServer(app);
const io = require('socket.io')(server);

const events = require('./src/events');
const routes = require('./src/routes');
const comnds = require('./src/comnds');

app.use(express.static(__dirname + '/public'));
app.use(routes);

events.server(io);
comnds.client(server);
