'use strict';

const log = require("./libs/logger")(module);
const huffman = require('./libs/huffman');
const PNG = require('pngjs').PNG;
let io;

const compression = (base64) => {
    base64 = base64.replace(/^data:image\/png;base64,/,"");
    new PNG({ filterType:4 }).parse( new Buffer(base64, 'base64'), (err, data) =>
    {
        if(err) throw err;
        let a = Date.now();
        console.log("encode");
        let bin = huffman.encode(data.data);
        console.log("decode");
        huffman.decode(bin.decode, bin.obj);
        console.log("end");
        a = Date.now() - a;
        console.log(a);
    });
};

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
           compression(req.imageData);
            // client.emit("resultVideo", {req});
        });
    });
};



