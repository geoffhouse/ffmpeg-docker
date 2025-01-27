"use strict";

const logger = require("@utils/logger")(module);
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const filterCombine = require("@utils/filter-combine");
const filterText = require("@utils/filter-text");
const filterImage = require("@utils/filter-image");
const jobManager = require("@utils/jobManager");

const process = async (options) => {
    const response = { options: options };

    ffmpeg.setFfmpegPath("/root/bin/ffmpeg");

    try {
        const job = jobManager.start(`${options?.output?.cardName}-out`, `Bars to ${options?.output?.cardName}`, [
            "bars",
            "decklink",
        ]);

        const filters = await filterCombine(await filterText({ ...options, ...job }));

        let command = ffmpeg({ logger: logger })
            .addInput(`${options.input?.type || "smptehdbars"}=rate=25:size=1920x1080`)
            .inputOptions(["-re", "-f lavfi"])
            .addInput(`sine=frequency=${options.input?.frequency || 1000}:sample_rate=48000`)
            .inputOptions(["-f lavfi"])
            .outputOptions([
                "-pix_fmt uyvy422",
                "-s 1920x1080",
                "-ac 16",
                "-f decklink",
                `-af volume=${options?.output?.volume || 0.25}`,
                "-flags low_delay",
                "-bufsize 0",
                "-muxdelay 0",
            ])
            .output(options.output?.cardName);

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
            response.job = jobManager.update(job?.jobId, {
                command: commandString,
                pid: command.ffmpegProc.pid,
                options: options,
            });
            return response;
        });

        command.on("stderr", (stderrLine) => {
            logger.info("ffmpeg: " + stderrLine);
        });

        command.on("error", (error) => {
            logger.error(error);
            jobManager.end(job?.jobId, false);
        });

        command.run();
    } catch (error) {
        logger.error(error.message);
        response.errors = [error];
    }

    response.job = await jobManager.get(`${options?.output?.cardName}-out`);
    return response;
};

module.exports = process;
