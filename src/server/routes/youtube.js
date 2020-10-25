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

/**
 * Filter video formats and returns the highest quality format with known content length
 * @param {ytdl.videoInfo} video 
 * @param {String} filter 
 */
const getVideoFormat = async (video, filter) => {
    let videoFormats = ytdl.filterFormats(video.formats, filter);
    let format = videoFormats.filter((format) => {
        return typeof format.contentLength !== 'undefined';
    })[0];

    return format;
}

router.get('/api/youtube/data/*', async (req, res) => {
    let video = await getVideo(req);
    let data = {
        title: video.videoDetails.title,
        source: {
            video: '/api/youtube/video/' + video.videoDetails.video_url,
            audio: '/api/youtube/audio/' + video.videoDetails.video_url
        }
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

router.get('/api/youtube/video/*', async (req, res) => {
    let video = await getVideo(req);
    let format = await getVideoFormat(video, 'videoandaudio');
    
    res.setHeader('Content-Type', format.mimeType);
    res.setHeader('Content-Length', format.contentLength);
    res.setHeader('Accept-Ranges', 'bytes');

    ytdl(video.videoDetails.video_url, {format: format})
        .pipe(res);
});

router.get('/api/youtube/audio/*', async (req, res) => {
    let video = await getVideo(req);
    let format = await getVideoFormat(video, 'audioonly');

    res.setHeader('Content-Type', format.mimeType);
    res.setHeader('Content-Length', format.contentLength);
    res.setHeader('Accept-Ranges', 'bytes');

    ytdl(video.videoDetails.video_url, {format: format})
        .pipe(res);
});

module.exports = router;
