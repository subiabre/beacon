"use strict";

const express = require('express');
const fs = require('graceful-fs');
const router = express.Router();
const path = require('path');
const Song = require('../models/songModel');

router.get('/', (req, res) => {
    res.sendFile('index.html', { root: path.join(__dirname, '../../dist') });
});

router.get('/api/local/latest', async (req, res) => {
    let songs = await Song.findOne({
        order: [[ 'createdAt', 'DESC' ]]
    });

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({data: songs});
});

router.get('/api/local/all', async (req, res) => {
    let songs = await Song.findAll();

    res.setHeader('Content-Type', 'application/json');
    res.status(200).json({data: songs});
});

router.get('/api/local/data/:id', async (req, res) => {
    let song = await Song.findOne({
        where: { id: req.params.id }
    });

    res.setHeader('Content-Type', 'application/json');
    res.send({ data: song });
});

router.get('/api/local/audio/:id', async (req, res) => {
    let song = await Song.findOne({
        where: { id: req.params.id }
    });
    let songStat = fs.statSync(song.file);
    let songStream = fs.createReadStream(song.file);

    res.setHeader('Content-Type', song.mime);
    res.setHeader('Content-Length', songStat.size);
    res.setHeader('Accept-Ranges', 'bytes');

    songStream.pipe(res);
});

module.exports = router;
