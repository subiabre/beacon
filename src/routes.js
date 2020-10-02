"use strict";

const express = require('express');
const Song = require('./models/songModel');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

router.get('/songs/last', async (req, res) => {
    let songs = await Song.findAll({
        limit: 4,
        order: [[ 'createdAt', 'DESC' ]]
    });

    console.log(songs);
    res.send({data: songs});
});

module.exports = router;
