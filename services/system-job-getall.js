"use strict";

const logger = require("@utils/logger")(module);
const jobManager = require("@utils/jobManager");

module.exports = async () => {
    try {
        const jobs = await jobManager.getAll();
        return { jobs: jobs };
    } catch (error) {
        logger.warn(error.message);
        return { error: error.toString() };
    }
};
