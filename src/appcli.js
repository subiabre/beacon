"use strict";

const events = require('./socket');
const Server = require("http").Server;
const Vorpal = require("vorpal");
const app = new Vorpal();
const ip = require('ip');
const os = require('os');
const fs = require('graceful-fs');
const filetype = require('file-type');
const mm = require('music-metadata');
const path = require('path');
const recursiveReadDir = require('recursive-readdir');
const stratter = require('stratter');
const SongModel = require('./models/songModel');
const { lookup } = require('mime-types');

const errortitle = stratter('Error', { foreground: "red" });

class AppCLI
{
    constructor()
    {
        app.log('Welcome to beacon CLI. Type "help" to see available commands.');

        app
            .delimiter(stratter(`beacon@${os.hostname()}`, { foreground: "blue" }) + ':')
            .show();
    }

    /**
     * 
     * @param {Server} server 
     */
    server(server)
    {
        this.serverStatus = 'Server has not been started yet. Type "start" to start the server.';

        app.command('start [port]', 'Starts the listening server.')
        .alias('up')
        .action((args, callback) => {
            if (server.listening) {
                app.log('Server is already open. Type "stop" to stop the server.');
                return callback();
            }

            // Launch server
            const listener = server.listen(args.port || process.env.PORT || 3127, async () => {
                let status = stratter('live', { foreground: "green" });
                this.netAddress = `http://${ip.address()}:${listener.address().port}`;
                this.localAddress = `http://localhost:${listener.address().port}`;
                
                this.serverStatus = `beacon Server is ${status}.`;
                this.serverStatus += '\nWeb address is:';
                this.serverStatus += `\nOn this machine: ${this.localAddress}`;
                this.serverStatus += `\nOn this network: ${this.netAddress}`;
                
                app.log(this.serverStatus);
            });

            callback();
        });

        app.command('stop', 'Stops the listening server.')
        .alias('down')
        .action((args, callback) => {
            let status = stratter('closed', { foreground: "magenta" });
            if (!server.listening) {
                app.log('Server was already closed.');
                return callback();
            }

            server.close();

            this.serverStatus = `beacon Server is ${status}.`;
            this.serverStatus += `\nWeb address was:`;
            this.serverStatus += `\nOn this machine: ${this.localAddress}`;
            this.serverStatus += `\nOn this network: ${this.netAddress}`;
            this.serverStatus += `\nStopped at: ${new Date().toISOString()}`;

            this.netAddress = null;
            this.localAddress = null;

            app.log(this.serverStatus);

            callback();
        });

        app.command('status', 'Shows the server status.')
        .action((args, callback) => {
            app.log(this.serverStatus);

            callback();
        });
    }

    data()
    {
        app.command('import <folder...>', 'Import music from the given folder.')
        .action(async (args, callback) => {
            let folder = path.resolve(args.folder.join(' '));
            let folderExists = fs.existsSync(folder);

            if (!folderExists) {
                app.log(`${errortitle}: ${folder} is not a directory.`);
                callback();
            }

            let files = await recursiveReadDir(folder);
            
            for (let index = 0; index < files.length; index++) {
                let percentage = Math.ceil(index * 100 / files.length);
                
                app.ui.redraw(`Reading from ${folder}. ${index}/${files.length} (${percentage}%)`);
                await this.saveSong(files[index]);
            }

            app.ui.redraw(`Scannned ${files.length} files from ${folder}.`);
            callback();
        });
    }

    /**
     * Maps a song file to a database record
     * @param {String} file Path to file
     */
    async saveSong(file)
    {
        let type = await filetype.fromFile(file);

        if (!type || !type.mime.match(/audio\/.*/)) {
            return;
        }

        let data = await mm.parseFile(file)
            .catch(err => {
                app.log(`${errortitle}: could not read metadata of ${file}`);
            });

        return await SongModel.create({
            file: file,
            mime: lookup(file),
            meta: data
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
                    available: model.dataValues.available,
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
