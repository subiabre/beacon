"use strict";

const SocketModel = require("./models/socketModel");
const UserAgent = require("user-agent-parse");

class Events
{
    /**
     * Listen for events in the Socket.io server instance
     * @param {SocketIO.Server} io 
     */
    server(io)
    {
        let sockets;

        io.on('connect', async (socket) => {
            let model = await this.getModel(socket);

            if (!model) {
                model = await this.newModel(socket);
            }

            model = await this.connectModel(socket);
            sockets = await this.getModelsOnline();

            io.emit('socket:update', sockets);

            socket.on('disconnect', async () => {
                model = await this.disconnectModel(socket);
                sockets = await this.getModelsOnline();
                
                io.emit('socket:update', sockets);
            });

            socket.on('socket:setTarget', async (socketTarget) => {
                io.to(socketTarget).emit('socket:setOrigin', socket.id);
            });

            socket.on('socket:resetTarget', async (socketTarget) => {
                io.to(socketTarget).emit('socket:resetOrigin', socket.id);
            });
        });
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
                userAgent: UserAgent.parse(socket.handshake.headers['user-agent']),
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
}

module.exports = new Events;
