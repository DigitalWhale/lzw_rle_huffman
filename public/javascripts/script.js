'use strict';

let socket = io('http://localhost:8888');
socket.on('eventClient', (data)=>{
    console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });

let logFilter = (imageData) =>{
    let pixelChannel = imageData.data;
    let r, g, b, a, k = 256/Math.log(256);
    for(let i = 0; i < pixelChannel.length; i += 4) {
        r = pixelChannel[i];
        g = pixelChannel[i + 1];
        b = pixelChannel[i + 2];
        a = pixelChannel[i + 3];

        pixelChannel[i] = k*Math.log(1 + r);
        pixelChannel[i+1] = k*Math.log(1 + g);
        pixelChannel[i+2] = k*Math.log(1 + b);
        pixelChannel[i+3] = k*Math.log(1 + a);

    }
    return imageData;
};

let expFilter = (imageData) =>{
    let pixelChannel = imageData.data;
    let r, g, b, a, k = 1;
    for(let i = 0; i < pixelChannel.length; i += 4) {
        r = pixelChannel[i];
        g = pixelChannel[i + 1];
        b = pixelChannel[i + 2];
        a = pixelChannel[i + 3];

        pixelChannel[i] = k*Math.pow(r, 0.9);
        pixelChannel[i+1] = k*Math.pow(g, 0.9);
        pixelChannel[i+2] = k*Math.pow(b, 0.9);
        pixelChannel[i+3] = k*Math.pow(a, 0.9);

    }
    return imageData;
};

window.onload = () =>{
    let video = $("#vid").get(0);
    let canvVideo = $("#vidCanv").get(0);
    let canvLog = $("#vidLog").get(0);
    let canvExp = $("#vidExp").get(0);
    let canvHaffman = $("#canvHaffman").get(0);
    let StatHaffman = $("#HaffmanStat").get(0);
    let canvRLE = $("#canvRLE").get(0);
    let StatRLE = $("#RLEStat").get(0);
    let canvLZW = $("#canvLZW").get(0);
    let StatLZW = $("#LZWStat").get(0);
    let ctx = canvVideo.getContext("2d");
    let ctxLog = canvLog.getContext("2d");
    let ctxExp = canvExp.getContext("2d");
    let ctxHaffman = canvHaffman.getContext("2d");
    let ctxStatH = StatHaffman.getContext("2d");
    let ctxRLE = canvRLE.getContext("2d");
    let ctxStatR = StatRLE.getContext("2d");
    let ctxLZW = canvLZW.getContext("2d");
    let ctxStatL = StatLZW.getContext("2d");
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
            for (let i = 0, len = res.length; i < 2457600 && i < len; i += 8) {
                let str = res[i] + res[i + 1] + res[i + 2] + res[i + 3] + res[i + 4] + res[i + 5] + res[i + 6] + res[i + 7];
                newData.push(parseInt(str, 2));
            }
            for (let i = newData.length; i < 307200; i++) {
                newData.push(255);
            }
            let iD = new ImageData(Uint8ClampedArray.from(newData), 320, 240);
            ctxHaffman.putImageData(iD, 0, 0);
            drawGraphic(ctxStatH, data.stat);
    });

    socket.on('codeRLE', (data) => {
        console.log("rle " + data.stat.timeEncode + " " + data.stat.timeDecode);
        let res = data.obj;
        let newData = [].concat(res[0]).concat(res[1]).concat(res[2]).concat(res[3]);

        for(let i = 3; i < newData.length; i += 4){
            newData[i] = 255;
        }
        if(newData.length <= 307200){
            for (let i = newData.length; i < 307200; i++) {
                newData.push(255);
            }
        }
        else{
            newData.splice(307200);
        }
        let iD = new ImageData(Uint8ClampedArray.from(newData), 320, 240);
        ctxRLE.putImageData(iD, 0, 0);
        drawGraphic(ctxStatR, data.stat);
    });

    socket.on('codeLZW', (data) => {
            let res = data.obj;
            let len = res.length;
        for(let i = 3; i < res.length; i += 4){
            res[i] = 255;
        }
            if(len <= 307200){
                for (let i = res.length; i < 307200; i++) {
                    res.push(255);
                }
            }
            else{
                res.splice(307200);
            }
            let iD = new ImageData(Uint8ClampedArray.from(res), 320, 240);
            ctxLZW.putImageData(iD, 0, 0);
            drawGraphic(ctxStatL, data.stat);

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
            ctxLog.putImageData(logFilter(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)), 0 ,0);
            ctxExp.putImageData(expFilter(ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)), 0 ,0);
        }
    };

    navigator.getUserMedia =  navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
    navigator.getUserMedia({video: {height: 240, width: 320}}, initVideoStream, onCameraFail);

    //Отображаем превью фильтров
    let cameraInterval = setInterval(() => {
        videoToCanvas();
    }, 8 );

    let algInterval = setInterval(()=>{
        socket.emit("sendScreen", {imageData: canvVideo.toDataURL()})
    }, 1500);


    btn.addEventListener("click", () => {
        videoToCanvas();
    });

};
