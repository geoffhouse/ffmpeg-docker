"use strict";

const logger = require("@utils/logger")(module);
const jobManager = require("@utils/jobManager");

module.exports = async (jobId) => {
    try {
        logger.info(`Killing job ${jobId}`);
        const job = jobManager.end(jobId);
        return job;
    } catch (error) {
        logger.warn("Cannot kill job. " + error.message);
        return { error: error.toString() };
    }
};
