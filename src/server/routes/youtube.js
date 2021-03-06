"use strict";

const express = require('express');
const router = express.Router();
const ytdl = require('ytdl-core');
const ytsr = require('ytsr');
const logger = require('../service/logger').child({id: 'routes-youtube'});

/**
 * Obtain the video info object from the request
 * @param {Express.Request} req Req
 */
const getVideo = async (req) =>
{
    let url = ytdl.validateURL(req.params[0]) ? req.params[0] : 'https://youtu.be/' + req.query.v;
    
    if (!url) return false;

    try {
        return await ytdl.getInfo(url);
    } catch (err) {
        logger.trace(err);

        return false;
    }
}

/**
 * Obtain video search results from the request
 * @param {Express.Request} req Req
 */
const getSearch = async (req) =>
{
    let query = req.params[0];
    let search = await ytsr(query, { limit: 15 })
        .then(data => {
            return data.items.filter(item => item.type === 'video');
        })
        .catch(err => {
            logger.trace(err);
        });

    if (!search) return false;

    return search;
}

/**
 * Filter video formats and returns the highest quality format with known content length
 * @param {ytdl.videoInfo} video 
 * @param {String} filter 
 */
const getVideoFormat = async (video, filter) => {
    let videoFormats = ytdl.filterFormats(video.formats, filter);

    if (!videoFormats) return false;

    try {
        return videoFormats.filter((format) => {
            return typeof format.contentLength !== 'undefined';
        })[0];
    } catch(err) {
        logger.trace(err);

        return false;
    }
}

router.get('/api/youtube/search/*', async (req, res) => {
    let videos = await getSearch(req);
    let data;

    if (!videos) {
        data = {
        status: "error",
        error: `Could not find search results for ${req.params[0]}`,
        }
    } else {
        data = {
            status: "success",
            results: videos.map(video => {
                video.thumbnail = video.bestThumbnail.url;

                return video;
            })
        };
    }

    res.setHeader('Content-Type', 'application/json');
    res.send(data);
});

router.get('/api/youtube/data/*', async (req, res) => {
    let video = await getVideo(req);
    let data;

    if (!video) {
        data = {
        status: "error",
        error: `Could not resolve video address of ${req.params[0]}`, 
        };
    } else {
        data = {
            status: "success",
            title: video.videoDetails.title,
            source: {
                video: '/api/youtube/video/' + video.videoDetails.video_url,
                audio: '/api/youtube/audio/' + video.videoDetails.video_url
            }
        };
    }
    
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
