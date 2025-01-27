"use strict";

const fs = require('fs');
const path = require("path");
const logger = require("@utils/logger")(module);

const parse = async (data) =>{
    try{
        const lines = data.split("\n");
        const items = [];
        for(let line of lines){
            if(line && line[0] !== "#"){
                const lineParts = line.split("/");
                items.push(lineParts[lineParts.length-1]);
            }
        }
        return items;
    }
    catch(error){
        logger.warn(error)
        return false;
    }    
}

const get = async (playlist="playlist") => {
    try{
        const playlistFilePath = path.join(__dirname, "..", "data", "playlist", `${playlist}.ffconcat`);
        const contents = await fs.readFileSync(playlistFilePath);
        return contents.toString();
    }
    catch(error){
        logger.warn(error)
        return false
    }
};

const set = async (playlist="playlist",items=[]) => {
    try{
        const playlistFilePath = path.join(__dirname, "..", "data", "playlist", `${playlist}.ffconcat`);
        let data = `# Playlist Name: ${playlist}.ffconcat`;

        for(let item of items){
            data += `\n\n# File Name: ${item}\n${path.join(__dirname, "..", "data", "media", item)}`;
        }

        await fs.writeFileSync(playlistFilePath, data);

        return {data:{raw:data,items:items}}
    }
    catch(error){
        logger.warn(error)
        return false
    }
};

const add = async (playlist="playlist",item) => {
    try{
        let data = await get(playlist);

        if(item){
            data += `\n\n# File Name: ${item}\n${path.join(__dirname, "..", "data", "media", item)}`;
        }

        const items = await parse(data);
        const setData = await set(playlist,items);

        return {data:{raw:data,items:items}}

    }
    catch(error){
        logger.warn(error)
        return false
    }
};

const remove = async (playlist="playlist",item) => {
    try{
        const itemPath = path.join(__dirname, "..", "data", "media", item);
        const data = await get(playlist);
        const lines = data.split("\n");
        const items = [];

        for(let line of lines){
            if(line && line[0] !== "#" && line !== itemPath){
                const lineParts = line.split("/");
                items.push(lineParts[lineParts.length-1]);
            }
        }

        const setData = await set(playlist,items);
        return {data: items, raw: setData.data.raw};
    }
    catch(error){
        logger.warn(error)
        return false;
    }
};

const getItems = async (playlist="playlist") => {
    try{
        const data = await get(playlist);
        const items = await parse(data);
        return {data:{items:items,raw:data}};
    }
    catch(error){
        logger.warn(error)
        return false
    }
};

module.exports = ({getItems:getItems,set:set,add:add,remove:remove})