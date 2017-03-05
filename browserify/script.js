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