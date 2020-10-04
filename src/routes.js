"use strict";

const express = require('express');
const router = express.Router();
const Song = require('./models/songModel');

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

router.get('/songs/last', async (req, res) => {
    let songs = await Song.findAll({
        limit: 4,
        order: [[ 'createdAt', 'DESC' ]]
    });

    res.send({data: songs});
});

module.exports = router;
