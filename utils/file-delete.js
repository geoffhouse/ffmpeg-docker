"use strict";

const fs = require("fs").promises;
const path = require("path");
const logger = require("@utils/logger")(module);

module.exports = async (relativePath) => {
    try {
        const absolutePath = path.resolve(relativePath);
        if (await fs.unlink(absolutePath)) {
            return true;
        }
        return false;
    } catch (error) {
        logger.warn(error);
        return false;
    }
};
