"use strict";

const Vorpal = require("vorpal");
const { Server } = require("http");
const terminal = new Vorpal();
const ip = require('ip');
const os = require('os');
const stratter = require('stratter');
const events = require('./events');

class Commands
{
    constructor()
    {
        this.listener = false;
    }

    /**
     * 
     * @param {Server} server 
     */
    client(server)
    {
        terminal.log('Welcome to beacon CLI. Type "help" to see available commands.');

        // Start server
        terminal
            .command('start [port]', 'Starts the listening server.')
            .alias('up')
            .action((args, callback) => {
                if (this.listener) {
                    server.close();
                }

                // Launch server
                const listener = server.listen(args.port || process.env.PORT || 3127, async () => {
                    this.netAddress = `http://${ip.address()}:${listener.address().port}`;
                    this.localAddress = `http://localhost:${listener.address().port}`;
                    this.listener = listener;
                    
                    terminal.log('Server now live:');
                    terminal.log('On your machine: ' + this.localAddress);
                    terminal.log('Server now live: ' + this.netAddress);
                });

                callback();
            });

        // Stop server
        terminal
            .command('stop', 'Stops the listening server.')
            .alias('down')
            .action((args, callback) => {
                if (!this.listener) {
                    terminal.log('Server was already closed.');
                    return callback();
                }

                server.close();
                terminal.log('Stopped listening at: ' + this.localAddress);

                this.netAddress = null;
                this.localAddress = null;
                this.listener = false;

                callback();
            });

        // Show sockets
        terminal
            .command('sockets', 'Shows the current socket list.')
            .option('-v', 'shows all the data.')
            .action(async (args, callback) => {
                let models = await events.getModels();
                let sockets = [];

                models.forEach((model, index) => {
                    sockets[index] = {
                        id: model.dataValues.id,
                        userAgent: model.dataValues.userAgentOriginal,
                        connectedAt: model.dataValues.connectedAt
                    }
                });

                if (args.options.v) {
                    sockets = models;
                }

                terminal.log(sockets);
                callback();
            });

        terminal
            .delimiter(stratter(`beacon@${os.hostname()}`, { foreground: "blue" }) + ':')
            .show();
    }
}

module.exports = new Commands;
