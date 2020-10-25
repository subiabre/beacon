"use strict";

const Cookies = require('cookies');
const uuid = require('short-uuid');
const database = require('./sockets-db-service')

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

        io.emit('socket:update', list);
        io.to(socket.id).emit('socket:isClient', model);
        io.to(socket.id).emit('queue:getQueue', queue);

        socket.on('disconnect', async () => {
            await database.disconnectModel(socket);
            list = await database.getModelsOnline();
            
            io.emit('socket:update', list);
        });

        socket.on('socket:setTarget', async (target) => {
            io.to(target).emit('socket:setOrigin', socket.id);

            await database.attachSockets(socket, target);
            emitToAllBut([socket.id, target],'socket:isOrigin', socket.id);
            emitToAllBut([socket.id, target],'socket:isTarget', target);
        });

        socket.on('socket:resetTarget', async (target) => {
            io.to(target).emit('socket:resetOrigin', socket.id);

            await database.dettachSockets(socket, target);
            emitToAllBut([socket.id, target],'socket:isFree', socket.id);
            emitToAllBut([socket.id, target],'socket:isFree', target);
        });

        socket.on('queue:addToQueue', (items) => {
            database.addToQueue(socket, items);
        });

        socket.on('play:youtube', async (target, url) => {
            io.to(target).emit('play:youtube', url);
        });
    });
}

module.exports = {eventListener}
