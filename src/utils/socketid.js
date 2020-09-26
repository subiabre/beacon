"use strict";

const Cookies = require('cookies');
const FlakeId = require('flake-idgen');
const flakeIdGen = new FlakeId();
const intformat = require('biguint-format')

/**
 * Replaces SocketIO id generation with browser persistent ids
 */
const socketId = (req, res) => {
    let cookies = new Cookies(req, res);
    let hasCookie = cookies.get('io');

    if (!hasCookie) {
        return intformat(flakeIdGen.next(), 'dec');
    }

    return hasCookie;
}

module.exports = socketId;
