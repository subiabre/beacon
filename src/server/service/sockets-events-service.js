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
            io.to(target).emit('play:contentData', data);
        });

        socket.on('play:contentData', async (target, data) => {
            io.to(target).emit('play:contentData', data);
        });

        socket.on('play:playerData', async (origin, data) => {
            logger.debug(`${socket.id} is telling content data to ${origin}`);
            io.to(origin).emit('play:playerData', data);
        });

        socket.on('play:playerTime', async (origin, time) => {
            logger.debug(`${socket.id} is telling time ${time} to ${origin}`);
            io.to(origin).emit('play:playerTime', time);
        });

        socket.on('play:playerDuration', async (origin, duration) => {
            logger.debug(`${socket.id} is telling duration of ${duration} to ${origin}`);
            io.to(origin).emit('play:playerDuration', duration);
        });

        socket.on('play:contentPlay', async (target) => {
            logger.debug(`${socket.id} is telling ${target} to play content`);
            io.to(target).emit('play:contentPlay');
        });

        socket.on('play:contentStop', async (target) => {
            logger.debug(`${socket.id} is telling ${target} to stop content`);
            io.to(target).emit('play:contentStop');
        });

        socket.on('play:contentTime', async (target, time) => {
            logger.debug(`${socket.id} is telling ${target} to play at ${time}`);
            io.to(target).emit('play:contentTime', time);
        });

        socket.on('play:contentPause', async (target) => {
            logger.debug(`${socket.id} is telling ${target} to pause content`);
            io.to(target).emit('play:contentPause');
        });

        socket.on('play:playerEnd', async (origin) => {            
            logger.debug(`${socket.id} is telling playback ended to ${origin}`);
            io.to(origin).emit('play:playerEnd');
        });
    });
}

module.exports = {eventListener}
