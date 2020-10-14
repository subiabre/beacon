"use strict";

const SocketModel = require("./models/socketModel");
const UAParser = require('ua-parser-js');

class Socket
{
    /**
     * Listen for events in the Socket.io server instance
     * @param {SocketIO.Server} io 
     */
    events(io)
    {
        this.io = io;
        this.sockets;

        io.on('connect', async (socket) => {
            let model = await this.getModel(socket);

            if (!model) {
                model = await this.newModel(socket);
            }

            model = await this.connectModel(socket);
            this.sockets = await this.getModelsOnline();

            io.emit('socket:update', this.sockets);
            io.to(socket.id).emit('socket:isClient', model);

            socket.on('disconnect', async () => {
                model = await this.disconnectModel(socket);
                this.sockets = await this.getModelsOnline();
                
                io.emit('socket:update', this.sockets);
            });

            socket.on('socket:setTarget', async (socketTarget) => {
                io.to(socketTarget).emit('socket:setOrigin', socket.id);

                await this.attachSockets(socket, socketTarget);
                this.emitToAllBut([socket.id, socketTarget],'socket:isOrigin', socket.id);
                this.emitToAllBut([socket.id, socketTarget],'socket:isTarget', socketTarget);
            });

            socket.on('socket:resetTarget', async (socketTarget) => {
                io.to(socketTarget).emit('socket:resetOrigin', socket.id);

                await this.dettachSockets(socket, socketTarget);
                this.emitToAllBut([socket.id, socketTarget],'socket:isFree', socket.id);
                this.emitToAllBut([socket.id, socketTarget],'socket:isFree', socketTarget);
            });

            socket.on('play:youtube', async (target, url) => {
                io.to(target).emit('play:youtube', url);
            });
        });
    }

    /**
     * Sends an event to every given socket but the specified one
     * @param {Array} sockets List of ids of sockets to exclude from event
     * @param {String} event Event to emit
     * @param {Any} args Arguments to send
     */
    emitToAllBut(sockets, event, ...args)
    {
        this.sockets.forEach((target) => {
            if (!sockets.includes(target.id)) {
                this.io.to(target.id).emit(event, args);
            }
        });
    }

    /**
     * Parses an User agent string
     * @param {String} userAgent User agent as an string
     * @returns {Object}
     */
    parseUserAgent(userAgent)
    {
        let ua = UAParser(userAgent);

        if (typeof ua.device.type == "undefined") {
            ua.device.type = "pc";
        }

        return ua;
    }

    async getModels()
    {
        return await SocketModel.findAll();
    }

    async getModelsOnline()
    {
        return await SocketModel.findAll({ where: { online: true }});
    }

    async getModel(socket)
    {
        return await SocketModel.findOne({ where: { id: socket.id }});
    }

    /**
     * Add a socket to database
     * @param {SocketIO.Socket} socket 
     */
    async newModel(socket)
    {
        return await SocketModel
            .create({
                id: socket.id,
                userAgent: this.parseUserAgent(socket.handshake.headers['user-agent']),
                userAgentOriginal: socket.handshake.headers['user-agent']
            })
            .then(model => model)
            .catch(err => console.log(err));
    }

    async connectModel(socket)
    {
        let model = await this.getModel(socket);

        model.online = true;

        return await model
            .save()
            .then(model => model)
            .catch(err => console.log(err));
    }

    /**
     * Delete a socket from database
     * @param {SocketIO.Socket} socket 
     */
    async disconnectModel(socket)
    {
        let model = await this.getModel(socket);

        model.online = false;

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
    async attachSockets(origin, target)
    {
        let originModel = await this.getModel(origin);
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
    async dettachSockets(origin, target)
    {
        let originModel = await this.getModel(origin);
        let targetModel = await SocketModel.findOne({ where: { id: target }});

        originModel.targetId = null;
        originModel.available = true;
        await originModel.save();

        targetModel.originId = null;
        targetModel.available = true;
        await targetModel.save();

        return;
    }
}

module.exports = new Socket;
