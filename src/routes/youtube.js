"use strict";

const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');

/**
 * Obtain the video info object from the request
 * @param {Express.Request} req Req
 */
const getVideo = async (req) => {
    let url = ytdl.validateURL(req.params[0]) ? req.params[0] : 'https://youtu.be/' + req.query.v;
    
    return await ytdl.getInfo(url);
}

router.get('/api/youtube/video/*', async (req, res) => {
    let video = await getVideo(req);
    let videoFormat = ytdl.filterFormats(video.formats, 'videoandaudio')[0];

    res.setHeader('Content-Type', videoFormat.mimeType);
    res.setHeader('Content-Length', videoFormat.contentLength);
    res.setHeader('Accept-Ranges', 'bytes');

    ytdl(video.videoDetails.video_url, {format: videoFormat})
        .pipe(res);
});

router.get('/api/youtube/audio/*', async (req, res) => {
    let video = await getVideo(req);
    let audioFormat = ytdl.filterFormats(video.formats, 'audioonly')[0];

    res.setHeader('Content-Type', audioFormat.mimeType);
    res.setHeader('Content-Length', audioFormat.contentLength);
    res.setHeader('Accept-Ranges', 'bytes');

    ytdl(video.videoDetails.video_url, {format: audioFormat})
        .pipe(res);
});

module.exports = router;
