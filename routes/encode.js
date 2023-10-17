"use strict";

const router = require("express").Router();
const hashResponse = require("@utils/hash-response");
const encodeFileSrt = require("@services/encode-file-srt");
const encodeBarsSrt = require("@services/encode-bars-srt");
const encodeRtmpFile = require("@services/encode-file-rtmp");
const encodeRtmpBars = require("@services/encode-bars-rtmp");
const encodeDecklinkSrt = require("@services/encode-decklink-srt");
const encodeDecklinkRtmp = require("@services/encode-decklink-rtmp");

/**
 * @swagger
 * /encode/file/srt:
 *    get:
 *      description: SRT encode a file.
 *      tags: [encode]
 *      parameters:
 *       - in: formData
 *         name: filename
 *         type: string
 *         description: Filename and extension of media to playout. E.g - test.mp4. Relative to ./data/media/
 *         required: true
 *       - in: formData
 *         name: address
 *         type: string
 *         description: Address to direct stream towards
 *         required: true
 *       - in: formData
 *         name: port
 *         type: number
 *         description: Port to direct stream towards
 *         required: true
 *       - in: formData
 *         name: latency
 *         type: number
 *         description: SRT latency in milliseconds, default is 250ms
 *         required: false
 *       - in: formData
 *         name: bitrate
 *         type: number
 *         description: The bitrate of the encoded stream in kilobits per second
 *         required: true
 *       - in: formData
 *         name: font
 *         type: string
 *         description: The name of the font file to use for text overlay. Must use the TrueType fonts. E.g - "swansea-bold.ttf"
 *         required: false
 *       - in: formData
 *         name: offset
 *         type: number
 *         description: Offset for time in hours. E.g 3, -3
 *         required: false
 *       - in: formData
 *         name: timecode
 *         type: boolean
 *         description: Show the timecode line - true,false
 *         required: false
 *       - in: formData
 *         name: repeat
 *         type: boolean
 *         description: Decides whether the media loops or not
 *         required: false
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/file/srt", async (req, res, next) => {
    const response = await encodeFileSrt(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /encode/file/rtmp:
 *    get:
 *      description: RTMP encode a file.
 *      tags: [encode]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/file/rtmp", async (req, res, next) => {
    const response = await encodeRtmpFile(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /encode/bars/srt:
 *    get:
 *      description: SRT encode test bars.
 *      tags: [encode]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/bars/srt", async (req, res, next) => {
    const response = await encodeBarsSrt(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /encode/bars/rtmp:
 *    get:
 *      description: RTMP encode test bars.
 *      tags: [encode]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/rtmp/bars", async (req, res, next) => {
    const response = await encodeRtmpBars(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /encode/decklink/srt:
 *    get:
 *      description: Takes Decklink input in SDI and encodes it as SRT.
 *      tags: [encode]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/decklink/srt", async (req, res, next) => {
    const response = await encodeDecklinkSrt(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});

/**
 * @swagger
 * /encode/decklink/rtmp:
 *    get:
 *      description: Takes Decklink input in SDI and encodes it as RTMP.
 *      tags: [encode]
 *      produces:
 *        - application/json
 *      responses:
 *        '200':
 *          description: Success
 */
router.get("/decklink/rtmp", async (req, res, next) => {
    const response = await encodeDecklinkRtmp(req.body);
    hashResponse(res, req, { data: response, status: response ? "success" : "error" });
});
module.exports = router;
