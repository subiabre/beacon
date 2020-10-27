"use strict";

const Cookies = require('cookies');
const uuid = require('short-uuid');
const database = require('./sockets-db-service')
const logger = require('../service/logger')

const preserveId = (req, res) =>
{
    let cookies = new Cookies(req, res);
    let hasCookie = cookies.get('io');

    if (!hasCookie) {
        return uuid.generate()
    }

    return hasCookie;
}

/**
 * Listen for events in the Socket.io server instance
 * @param {SocketIO.Server} io 
 */
const eventListener = (io) =>
{
    io.engine.generateId = preserveId

    this.io = io;

    /**
     * Sends an event to every given socket but the specified one
     * @param {Array} sockets List of ids of sockets to exclude from event
     * @param {tring} event Event to emit
     * @param {Any} args Arguments to send
     */
    const emitToAllBut = async (sockets, event, ...args) =>
    {
        let list = await database.getModelsOnline()

        list.forEach((target) => {
            if (!sockets.includes(target.id)) {
                this.io.to(target.id).emit(event, args);
            }
        });
    }

    io.on('connect', async (socket) => {
        let model = await database.getModel(socket) || await database.newModel(socket);
        let queue = await database.getQueue(socket) || await database.newQueue(socket);

        await database.connectModel(socket);
        let list = await database.getModelsOnline();

        logger.debug(`Socket.io connection with id: ${model.id}`)

        io.emit('socket:update', list);
        io.to(socket.id).emit('socket:isClient', model);
        io.to(socket.id).emit('queue:getQueue', queue);
        io.to(socket.id).emit('play:getInteraction');

        socket.on('disconnect', async () => {
            await database.disconnectModel(socket);
            list = await database.getModelsOnline();
            
            io.emit('socket:update', list);
        });

        socket.on('socket:setTarget', async (target) => {
            target = list.filter(socket => socket.id == target ? socket : null)[0];

            logger.debug(`${socket.id} has set ${target.id} as target`);
            io.to(target.id).emit('socket:setOrigin', socket.id);

            await database.attachSockets(socket, target);
            emitToAllBut([socket.id, target.id],'socket:isOrigin', socket.id);
            emitToAllBut([socket.id, target.id],'socket:isTarget', target.id);
        });

        socket.on('socket:resetTarget', async (target) => {
            target = list.filter(socket => socket.id == target ? socket : null)[0];

            logger.debug(`${socket.id} has reset ${target.id} as target`);
            io.to(target.id).emit('socket:resetOrigin', socket.id);

            await database.dettachSockets(socket, target);
            emitToAllBut([socket.id, target.id],'socket:isFree', socket.id);
            emitToAllBut([socket.id, target.id],'socket:isFree', target.id);
        });

        socket.on('queue:addToQueue', (items) => {
            database.addToQueue(socket, items);
        });

        socket.on('queue:play', async (target, data) => {
            io.to(target).emit('play:getData', data);
        });

        socket.on('play:setContent', async (volume) => {
            let model = await database.getModel(socket);

            logger.debug(`${socket.id} is telling volume ${volume} to ${model.originId}`);
            io.to(model.originId).emit('play:getContent', volume);
        });

        socket.on('play:setTime', async (time, duration) => {
            let model = await database.getModel(socket);

            logger.debug(`${socket.id} is telling time ${time} of ${duration} to ${model.originId}`);
            io.to(model.originId).emit('play:getTime', time, duration);
        });

        socket.on('play:setPlay', async () => {
            let model = await database.getModel(socket);

            logger.debug(`${socket.id} is telling ${model.targetId} to play content`);
            io.to(model.targetId).emit('play:getPlay');
        });

        socket.on('play:setPause', async () => {
            let model = await database.getModel(socket);

            logger.debug(`${socket.id} is telling ${model.targetId} to pause content`);
            io.to(model.targetId).emit('play:getPause');
        });

        socket.on('play:setEnded', async () => {
            let model = await database.getModel(socket);
            
            logger.debug(`${socket.id} is telling playback ended to ${model.originId}`);
            io.to(model.originId).emit('play:getEnded');
        });
    });
}

module.exports = {eventListener}
