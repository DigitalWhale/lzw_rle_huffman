(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
const decoderHuffman = require('../libs/huffman').decode;

let socket = io('http://localhost:8888');
socket.on('eventClient', (data)=>{
    console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });

window.onload = () =>{
    let video = $("#vid").get(0);
    let canvVideo = $("#vidCanv").get(0);
    let canvHaffman = $("#canvHaffman").get(0);
    let StatHaffman = $("#HaffmanStat").get(0);
    let canvRLE = $("#canvRLE").get(0);
    let StatRLE = $("#RLEStat").get(0);
    let ctx = canvVideo.getContext("2d");
    let ctxHaffman = canvHaffman.getContext("2d");
    let ctxStatH = StatHaffman.getContext("2d");
    let ctxRLE = canvRLE.getContext("2d");
    let ctxStatR = StatRLE.getContext("2d");
    let localMediaStream = null;
    let btn = document.getElementById("btn");

    let drawGraphic = (ctx, stat) => {
        ctx.fillStyle = "#f1f1f1";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);
        ctx.fillStyle = "#ff0000";
        ctx.fillRect(ctx.canvas.width/7, ctx.canvas.height*(1-stat.per/100), ctx.canvas.width/7, ctx.canvas.height*(stat.per/100));
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(ctx.canvas.width/7*3,ctx.canvas.height*(1-stat.timeEncode/360), ctx.canvas.width/7, ctx.canvas.height*(stat.timeEncode/360));
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(ctx.canvas.width/7*5,ctx.canvas.height*(1-stat.timeDecode/360), ctx.canvas.width/7, ctx.canvas.height*(stat.timeDecode/360));
    };

    socket.on('codeHuffman', (data) => {
        let res = data.obj;
        let newData = [];
        let len = res.length;
          for (let i = 0, len = res.length; i < 2764800 && i < len; i += 8) {
              let str = res[i] + res[i + 1] + res[i + 2] + res[i + 3] + res[i + 4] + res[i + 5] + res[i + 6] + res[i + 7];
              newData.push(parseInt(str, 2));
          }
          for (let i = newData.length; i < 345600; i++) {
              newData.push(255);
          }
        let iD = new ImageData(Uint8ClampedArray.from(newData), 360, 240);
        ctxHaffman.putImageData(iD, 0, 0);

        drawGraphic(ctxStatH, data.stat);

    });

    socket.on('codeRLE', (data) => {
        let res = data.obj;
        let newData = [].concat(res[0]).concat(res[1]).concat(res[2]).concat(res[3]);
        let len = newData.length;
    console.log(len);
        if(len < 345600){
            for (let i = newData.length; i < 345600; i++) {
                newData.push(255);
            }
        }
        else{
            newData.splice(345599);
        }
        len = newData.length;
        console.log(len);

        let iD = new ImageData(Uint8ClampedArray.from(newData), 360, 240);
        ctxRLE.putImageData(iD, 0, 0);
        drawGraphic(ctxStatR, data.stat);

    });


    //Перехват видео потока с камеры на тэг video
    let initVideoStream = (stream) => {
        if(typeof (video.srcObject) !== undefined){
            console.log("srcObject");
            video.srcObject = stream;
        }
        else {
            console.log("URL object");
            video.src = URL.createObjectURL(stream);
        }
        localMediaStream = stream;
    };

    // Исключение на случай, если камера не работает
    let onCameraFail =  (e) => {
        console.log('Camera did not work.', e);
    };

    let imageData;
    let videoToCanvas = ()=>{
        if(localMediaStream){
            ctx.drawImage(video, 0, 0);
        }
    };

    navigator.getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({video: {width: 480, height:320}}, initVideoStream, onCameraFail);

    //Отображаем превью фильтров
    let cameraInterval = setInterval(() => {
        videoToCanvas();
    }, 8 );


    btn.addEventListener("click", () => {
        clearInterval(cameraInterval);
        videoToCanvas();
        socket.emit("sendScreen", {imageData: canvVideo.toDataURL()})
    });

};
},{"../libs/huffman":2}],2:[function(require,module,exports){
//{name: 255, stat: 123}
const fSort = (a, b) => {
    if(a.stat < b.stat) return 1;
    else return -1;
};

const recursiveCreate = (encTable/*, decTable*/, obj, str) => {
    if(obj['0'] !== undefined){ recursiveCreate(encTable/*, decTable*/, obj['0'], str + '0'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
     //   decTable[obj.path] = obj.name;
    }

    if(obj['1'] !== undefined){ recursiveCreate(encTable/*, decTable*/, obj['1'], str + '1'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
       // decTable[obj.path] = obj.name;
    }
};

const recursiveFindName = (obj, str, index) => {
    let node = obj[str[index]];
    if(node !== undefined){return recursiveFindName(node, str, ++index); }
    return [obj.name, index];
};

const tree = (table) => {
    table.sort();
    let sizeTable = table.length;
    let right, left, node;
    while(sizeTable > 1){
        right = table[sizeTable-1];
        if(right.stat != 0){
            left = table[sizeTable - 2];
            node = {stat: (left.stat + right.stat), '1': right, '0': left};
            table.splice(sizeTable - 2, 2, node);
            dSortInvert(table, sizeTable-2, fSort);

        }
        table.splice(--sizeTable, 1);
    }
};

const dSortInvert = (arr, index, typeSort) => {
    while(index != 0 && typeSort(arr[index], arr[index-1]) == -1){
        let buffer = arr[index];
        arr[index] = arr[index-1];
        arr[index-1]=buffer;
        index--;
    }
};


const createCodeTable = (imgData) => {
    let table = [];
    for (let i = 0; i< 256; i++){
        table.push({'name': i, 'stat': 1});
    }
    for(let i = 0, dataLength = imgData.length; i < dataLength; i++) {
        table[imgData[i]].stat++
    }
    tree(table);
    let encodingTable = {};
    //let decodingTable = {};
    recursiveCreate(encodingTable/*, decodingTable*/, table[0], '');
    //return [encodingTable, decodingTable];
    return [encodingTable, table[0]];
};

module.exports.encode = (data) => {
        let a = Date.now();
        const endTable = createCodeTable(data);
        let str = '';
        for(let i = 0, dataLength = data.length; i < dataLength; i++) {
            str += endTable[0][data[i]];
        }
        a = Date.now() - a;
        let per = str.length/(data.length*8)*100;
        return {decode: endTable[1], obj: str, stat: {timeEncode: a, per: 100-per}};
};

module.exports.decode = (tree, obj) => {
    let a = Date.now();
    let index = 0;
    let data = [];
    let out = [];
    let len = obj.length;
    while (index < len){
        out = recursiveFindName(tree, obj, index);
        data.push(out[0]);
        index = out[1];
    }
    a = Date.now() - a;
    return a;
};


},{}]},{},[1]);
