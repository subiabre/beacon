const UAParser = require('ua-parser-js')
const SocketModel = require('../models/socket-model')
const QueueModel = require('../models/queue-model')

/**
 * Parses an User agent string
 * @param {Socket} socket A Socket instance
 * @returns {Object}
 */
const parseUserAgent = (socket) =>
{
    let ua = UAParser(socket.handshake.headers['user-agent']);

    if (typeof ua.device.type == "undefined") {
        ua.device.type = "pc";
    }

    return ua;
}

const getModels = async () =>
{
    return await SocketModel.findAll();
}

const getModelsOnline = async () =>
{
    return await SocketModel.findAll({ where: { isOnline: true }});
}

const getModel = async (socket) =>
{
    return await SocketModel.findOne({ where: { id: socket.id }});
}

/**
 * Add a socket to database
 * @param {SocketIO.Socket} socket 
 */
const newModel = async (socket) =>
{
    return await SocketModel
        .create({
            id: socket.id,
            userAgent: parseUserAgent(socket)
        })
        .then(model => model)
        .catch(err => console.log(err));
}

const connectModel = async (socket) => 
{
    let model = await getModel(socket);

    model.isOnline = true;

    return await model
        .save()
        .then(model => model)
        .catch(err => console.log(err));
}

/**
 * Delete a socket from database
 * @param {SocketIO.Socket} socket 
 */
const disconnectModel = async (socket) =>
{
    let model = await getModel(socket);

    model.isOnline = false;

    return await model
        .save()
        .then(model => model)
        .catch(err => console.log(err));
}

/**
 * Attach two target and origin sockets
 * @param {SocketIO.Socket} origin 
 * @param {SocketIO.Socket} target 
 */
const attachSockets = async (origin, target) =>
{
    let originModel = await getModel(origin);
    let targetModel = await SocketModel.findOne({ where: { id: target }});

    originModel.targetId = targetModel.id;
    originModel.available = false;
    await originModel.save();

    targetModel.originId = originModel.id;
    targetModel.available = false;
    await targetModel.save();

    return;
}

/**
 * Dettach two target and origin sockets
 * @param {SocketIO.Socket} origin 
 * @param {SocketIO.Socket} target 
 */
const dettachSockets = async (origin, target) =>
{
    let originModel = await getModel(origin);
    let targetModel = await SocketModel.findOne({ where: { id: target }});

    originModel.targetId = null;
    originModel.available = true;
    await originModel.save();

    targetModel.originId = null;
    targetModel.available = true;
    await targetModel.save();

    return;
}

/**
 * Gets the queue model from a socket
 * @param {SocketModel} socket
 */
const getQueue = async (socket) =>
{
    let queue = await QueueModel.findOne({ where: { socketId: socket.id }});
    
    return queue;
}

/**
 * Add a new queue to database
 * @param {SocketModel} socket 
 */
const newQueue = async (socket) => 
{
    await QueueModel
        .create({
            socketId: socket.id
        })
        .then(model => model)
        .catch(err => console.log(err));

    return await getQueue(socket);
}

const addToQueue = async (socket, items) =>
{
    let model = await getQueue(socket);

    model.items = items;
    await model.save();
    
    return;
}

module.exports = {
    getModel, getModels, getModelsOnline, 
    newModel, 
    connectModel, disconnectModel, 
    attachSockets, dettachSockets, 
    getQueue, 
    newQueue, 
    addToQueue
}
