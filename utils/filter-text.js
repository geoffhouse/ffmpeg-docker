"use strict";

const logger = require("@utils/logger")(module);
const path = require("path");
const parse = require("@utils/parse");

module.exports = async (options = {}) => {
    const fontSize = options?.overlay?.fontSize || 50;
    const filters = [];
    try {
        if (options?.overlay?.line1) {
            filters.push({
                filter: `${options?.overlay?.scrolling ? "scrolltext" : "drawtext"}`,
                options: `fontfile=\'${path.join(
                    __dirname,
                    "..",
                    "public",
                    "fonts",
                    `${options?.font || "swansea-bold.ttf"}`
                )}:\'text=\'${await parse(options?.overlay?.line1, options)}\':fontcolor=${
                    options?.overlay?.textColor || "white"
                }:fontsize=${fontSize}:box=1:boxcolor=${
                    options?.overlay?.backgroundColor || "black"
                }@0.5:boxborderw=8:x=(w-text_w)/2:y=((h-text_h)/2)-${parseInt(fontSize * 0.6)}`,
            });
        }

        if (options?.overlay.line2) {
            filters.push({
                filter: `${options?.scrolling ? "scrolltext" : "drawtext"}`,
                options: `fontfile=\'${path.join(
                    __dirname,
                    "..",
                    "public",
                    "fonts",
                    `${options?.font || "swansea-bold.ttf"}`
                )}:\'text=\'${await parse(options?.overlay?.line2, options)}\':fontcolor=${
                    options?.overlay?.textColor || "white"
                }:fontsize=${fontSize}:box=1:boxcolor=${
                    options?.overlay?.backgroundColor || "black"
                }@0.5:boxborderw=8:x=(w-text_w)/2:y=((h-text_h)/2)+${parseInt(fontSize * 0.6)}`,
            });
        }

        if (options?.overlay.topRight) {
            if (options?.overlay.topRight.line1) {
                filters.push({
                    filter: "drawtext",
                    options: `fontfile=\'${path.join(
                        __dirname,
                        "..",
                        "public",
                        "fonts",
                        `${options?.overlay?.font || "swansea-bold.ttf"}`
                    )}:\'text=\'${await parse(options?.overlay.topRight.line1, options)}\':fontcolor=${
                        options?.textColor || "white"
                    }:fontsize=${parseInt(fontSize / 2)}:box=1:boxcolor=${
                        options?.backgroundColor || "black"
                    }@0.5:boxborderw=8:x=(w-text_w-${parseInt(fontSize * 0.4)}):y=${parseInt(fontSize * 0.6)}`,
                });
            }
            if (options?.overlay.topRight.line2) {
                filters.push({
                    filter: "drawtext",
                    options: `fontfile=\'${path.join(
                        __dirname,
                        "..",
                        "public",
                        "fonts",
                        `${options?.overlay?.font || "swansea-bold.ttf"}`
                    )}:\'text=\'${await parse(options?.overlay.topRight.line2, options)}\':fontcolor=${
                        options?.overlay?.textColor || "white"
                    }:fontsize=${parseInt(fontSize / 2)}:box=1:boxcolor=${
                        options?.overlay?.backgroundColor || "black"
                    }@0.5:boxborderw=8:x=(w-text_w-${parseInt(fontSize * 0.4)}):y=${parseInt(fontSize * 1.2)}`,
                });
            }
        }
        if (options?.overlay.timecode) {
            let offset = 0;

            if (options?.overlay.offset) {
                offset = 60 * 60 * parseInt(options?.overlay.offset);
            }

            filters.push({
                filter: `${options?.overlay?.scrolling ? "scrolltext" : "drawtext"}`,
                options: `fontfile=\'${path.join(
                    __dirname,
                    "..",
                    "public",
                    "fonts",
                    `${options?.overlay?.font || "swansea-bold.ttf"}`
                )}:\'text=\'%{pts\\:gmtime\\:${Date.now() / 1000 + offset}}\':fontcolor=${
                    options?.overlay?.textColor || "white"
                }:fontsize=${fontSize}:box=1:boxcolor=${
                    options?.overlay?.backgroundColor || "black"
                }@0.5:boxborderw=8:x=(w-text_w)/2:y=((h-text_h)/2)+${parseInt(fontSize * 1.8)}`,
            });
        }
    } catch (error) {
        logger.warn("Cannot create text filter " + error.message);
    }
    return filters;
};
