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

            sockets = await this.getModels();

            io.emit('socket:update', sockets);

            socket.on('disconnect', async () => {
                await this.deleteModel(socket);
                sockets = await this.getModels();
                
                io.emit('socket:update', sockets);
            });
        });
    }

    async getModels()
    {
        return await SocketModel.findAll()
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
        let model = SocketModel.build({
            id: socket.id,
            userAgent: UserAgent.parse(socket.handshake.headers['user-agent']),
            userAgentOriginal: socket.handshake.headers['user-agent'],
            connectedAt: new Date
        });

        model
            .save()
            .then(model => {model})
            .catch(err => console.log(err));
    }

    /**
     * Delete a socket from database
     * @param {SocketIO.Socket} socket 
     */
    async deleteModel(socket)
    {
        let model = await SocketModel.findOne({ where: { id: socket.id }});

        if (!model) return await this.getModels();

        return model
            .destroy()
            .then(model => {model})
            .catch(err => console.log(err));
    }
}

module.exports = new Events;
