const express = require("express");
const documentation = express.Router();

const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");

const host = process.env.HOST || "localhost";
const port = process.env.PORT || "80";
const url = `http://${host}:${port}/api/`;

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "FFmpeg Docker API",
            version: "0.1.0",
            description: "Common FFmpeg functions from a RESTful API",
            license: {
                name: "GPLv3",
                url: "https://www.gnu.org/licenses/gpl-3.0.en.html",
            },
            contact: {
                name: "Ryan McCartney",
                url: "https://ryan.mccartney.info/ffmpeg-docker",
                email: "ryan@mccartney.info",
            },
        },
        servers: [
            {
                url: url,
            },
        ],
    },
    apis: ["./routes/*.js", "./modules/*.js"],
};

const swaggerDocs = swaggerJSDoc(swaggerOptions);
documentation.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = documentation;
