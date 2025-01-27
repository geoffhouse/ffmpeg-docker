"use strict";

const logger = require("@utils/logger")(module);
const ffmpeg = require("fluent-ffmpeg");
const path = require("path");
const filterCombine = require("@utils/filter-combine");
const filterText = require("@utils/filter-text");
const filterImage = require("@utils/filter-image");
const setCodec = require("@utils/set-codec");
const jobManager = require("@utils/jobManager");
const getFilePath = require("@utils/get-filepath");

const process = async (options) => {
    const response = { options: options };
    ffmpeg.setFfmpegPath("/root/bin/ffmpeg");

    try {
        const job = jobManager.start(`${options?.input.cardName}-in`, `${options?.input.cardName} to file`, [
            "decode",
            "file",
            "decklink",
        ]);

        const filePath = await getFilePath({
            file: options?.output?.file || job.jobId,
            format: options?.output?.format,
            chunks: options?.output?.chunkSize,
        });

        const filters = await filterCombine(await filterText({ ...options, ...job }));

        let command = ffmpeg({ logger: logger })
            .input(options?.input.cardName)
            .inputFormat("decklink")
            .inputOptions([
                "-protocol_whitelist",
                "srt,udp,rtp",
                "-stats",
                "-re",
                "-duplex_mode",
                `${options?.input?.duplexMode || "unset"}`,
            ]);

        if (options?.output?.chunkSize) {
            command
                .outputOptions("-f", "segment")
                .outputOptions("-segment_time", parseInt(options?.output?.chunkSize))
                .outputOptions("-reset_timestamps", 1, "-y");
        }

        command.output(filePath);

        command = setCodec(command, options?.output);

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
                file: filePath,
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

    response.job = await jobManager.get(`${options?.input?.cardName}-in`);
    return response;
};

module.exports = process;
