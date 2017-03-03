'use strict';
const log = require("./libs/logger")(module);
const png_archivator = require('./libs/huffman');
let io;


module.exports.Socket = (http) => {
    io = require("socket.io")(http);
};

module.exports.start  = () => {
    io.on('connection', (client) => {
        client.on('eventServer',  (data) => {
            console.log(data);
            client.emit('eventClient', { data: 'Connected' });
        });
        client.on('disconnect', ()=> {
            console.log('user disconnected');
        });

        //Тест отправки видео назад
        client.on("sendVideo", (req) => {
           png_archivator.archivator(req.imageData);
            // client.emit("resultVideo", {req});
        });
    });
};



