"use strict";

const express = require('express');
const router = express.Router();
const Song = require('../models/songModel');

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
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

module.exports = router;
