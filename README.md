# Castor
Castor is a web based, local network content player and remote controller.

![Castor](./public/icons/castor.png)

1. [About](#About)
2. [Installation](#Installation)
3. [Usage](#Usage)

## About
Castor allows you to set-up a unique address on your local network that you can access from any web browser in a device inside it and share content playing across them.

With Castor you can control the music playing in your PC using your mobile phone, or control to and from anything that can open a web browser and connect to your local network.

## Installation
1. Download or clone this repository.
2. Download and install [node.js](http://nodejs.org).
3. On the folder of this repository open a terminal.
4. Type `npm install`, wait until it finishes.
5. Type `npm start` to launch your local Castor instance.

You'll see two web addresses appear on the terminal screen, the first one is the address of Castor inside your computer, the second one is the address of Castor inside your network, the latter is the one you'll need to type from other devices to connect to Castor.

## Usage
Castor will obey to the following commands, type them in the folder terminal to run them.

### Start
```bash
npm start
```
Will launch the Castor server. Use it to start using Castor. Press `Ctrl+C` to stop it.

### Watch
```bash
npm run watch
```
Will launch the Castor server in `watch` mode, this means that it will restart the application server and recompile the client on each file change, it will also print log messages on `debug` level. Use it to start developing or to troubleshoot problems.
