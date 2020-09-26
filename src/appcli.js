"use strict";

const events = require('./events');
const Server = require("http").Server;
const Vorpal = require("vorpal");
const app = new Vorpal();
const ip = require('ip');
const os = require('os');
const stratter = require('stratter');

class AppCLI
{
    constructor()
    {
        app.log('Welcome to beacon CLI. Type "help" to see available commands.');

        app
            .delimiter(stratter(`beacon@${os.hostname()}`, { foreground: "blue" }) + ':')
            .show();

        this.listener = false;
    }

    /**
     * 
     * @param {Server} server 
     */
    server(server)
    {
        app.command('start [port]', 'Starts the listening server.')
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
                
                app.log('Server now live:');
                app.log('On your machine: ' + this.localAddress);
                app.log('On local network: ' + this.netAddress);
            });

            callback();
        });

        app.command('stop', 'Stops the listening server.')
        .alias('down')
        .action((args, callback) => {
            if (!this.listener) {
                app.log('Server was already closed.');
                return callback();
            }

            server.close();
            app.log('Stopped listening at: ' + this.localAddress);

            this.netAddress = null;
            this.localAddress = null;
            this.listener = false;

            callback();
        });
    }

    sockets()
    {
        app.command('sockets', 'Shows the current socket list.')
        .option('-v', 'shows all the data.')
        .action(async (args, callback) => {
            let models = await events.getModels();
            let sockets = [];

            models.forEach((model, index) => {
                sockets[index] = {
                    id: model.dataValues.id,
                    userAgent: model.dataValues.userAgentOriginal,
                    online: model.dataValues.online,
                    connectedAt: model.dataValues.connectedAt
                }
            });

            if (args.options.v) {
                sockets = models;
            }

            if (sockets.length < 1) {
                sockets = 'There are no sockets connected.';
            }

            app.log(sockets);
            callback();
        });
    }
}

module.exports = new AppCLI;
