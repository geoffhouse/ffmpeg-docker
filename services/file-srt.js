"use strict";

const logger = require("@utils/logger")(module);
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const filterCombine = require("@utils/filter-combine");
const filterText = require("@utils/filter-text");
const filterImage = require("@utils/filter-image");
const jobManager = require("@utils/jobManager");
const setCodec = require("@utils/set-codec");

const process = async (options) => {
    const response = { options: options };
    let repeat = "-stream_loop 0";
    if (options?.input?.repeat) {
        repeat = `-stream_loop -1`;
    }

    ffmpeg.setFfmpegPath("/root/bin/ffmpeg");

    try {
        const job = jobManager.start(
            `${options?.output?.address}:${options?.output?.port}`,
            `File to SRT srt://${options?.output?.address}:${options?.output?.port}`,
            ["encode", "srt"]
        );
        const filters = await filterCombine(await filterText({ ...options, ...job }));

        let command = ffmpeg({ logger: logger })
            .input(path.join(__dirname, "..", "data", "media", options?.input?.file))
            .inputOptions([repeat, "-protocol_whitelist", "file,udp,rtp", "-stats", "-re"])
            .output(
                `srt://${options?.output?.address}:${options?.output?.port}?pkt_size=${
                    options?.output?.packetSize || 1316
                }&latency=${parseInt(options?.output?.latency) * 1000 || "250000"}&mode=${
                    options?.output?.mode || "caller"
                }&ipttl=${options?.output?.ttl || "64"}&iptos=${options?.output?.tos || "104"}&transtype=${
                    options?.output?.transtype || "live"
                }&maxbw==${options?.output?.maxbw || "-1"}`
            )
            .outputOptions([`-preset ${options?.output?.encodePreset || "ultrafast"}`, "-f mpegts"])
            .outputOptions(`-b:v ${options?.output?.bitrate || "5M"}`);

        command = setCodec(command, options?.output);

        if (options?.output?.vbr) {
            command.outputOptions([
                `-minrate ${options?.output?.vbr?.minBitrate || "5M"}`,
                `-maxrate ${options?.output?.vbr?.maxBitrate || "5M"}`,
                `-muxrate ${options?.output?.bitrate || "5M"}`,
                `-bufsize 500K`,
            ]);
        }

        if (Array.isArray(filters)) {
            command.videoFilters(filters);
        }

        if (options?.thumbnail !== false) {
            command
                .output(path.join(__dirname, "..", "data", "thumbnail", `${job?.jobId}.png`))
                .outputOptions([`-r ${options?.thumbnail?.frequency || 1}`, "-update 1"]);

            if (Array.isArray(filters)) {
                command.videoFilters(filters);
            }
        }

        command.on("end", () => {
            logger.info("Finished processing");
            jobManager.end(job?.jobId, false);
        });

        command.on("start", (commandString) => {
            logger.debug(`Spawned FFmpeg with command: ${commandString}`);
            jobManager.update(job?.jobId, { command: commandString, pid: command.ffmpegProc.pid, options: options });
            return response;
        });

        command.on("progress", (progress) => {
            logger.info("ffmpeg-progress: " + Math.floor(progress.percent) + "% done");
            jobManager.update(job?.jobId, { progress: Math.floor(progress.percent) });
        });

        command.on("stderr", (stderrLine) => {
            logger.info("ffmpeg: " + stderrLine);
        });

        command.on("error", (error) => {
            logger.error(error);
            jobManager.end(job?.jobId, false);
            //If IO Error (Network error, restart)
            if (error.toString().includes("Input/output error") || error.toString().includes("Conversion failed!")) {
                logger.info("Restarting due to IO error");
                process(options);
            }
        });

        command.run();
    } catch (error) {
        logger.error(error.message);
        response.errors = [error];
    }

    response.job = jobManager.get(`${options?.output?.address}:${options?.output?.port}`);
    return response;
};

module.exports = process;
