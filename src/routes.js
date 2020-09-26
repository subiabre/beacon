"use strict";

const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.sendFile(__dirname + '/client/index.html');
});

module.exports = router;
