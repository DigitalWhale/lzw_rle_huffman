'use strict';

const log = require("./libs/logger")(module);
const huffman = require('./libs/huffman');
const rle = require('./libs/rle');
const lzw = require('./libs/lzw');
const PNG = require('pngjs').PNG;
let io;

const compression = (base64, client) => {
    base64 = base64.replace(/^data:image\/png;base64,/,"");
    new PNG({ filterType:4 }).parse( new Buffer(base64, 'base64'), (err, data) =>
    {
        if(err) throw err;
        let bin;
        bin = huffman.encode(data.data);
        bin.stat.timeDecode = huffman.decode(bin.decode, bin.obj);
        client.emit('codeHuffman', bin);

        bin = rle.encode(data.data);
        bin.stat.timeDecode = rle.decode(bin.obj);
        client.emit('codeRLE', bin);

        bin = lzw.encode(data.data);
        bin.stat.timeDecode = lzw.decode(bin.obj);
        client.emit('codeLZW', bin);
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
        client.on("sendScreen", (req) => {
           compression(req.imageData, client);
        });
    });
};



