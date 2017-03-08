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

let addCol = (dataImg) => {
    let len = dataImg.length;
    for(let i = 3; i < dataImg.length; i += 4){
        dataImg[i] = 255;
    }
    if(len < 307200){
        for (let i = dataImg.length; i < 307200; i++) {

                dataImg.push(255);

        }
    }
    else{
        dataImg.splice(307200);
    }
    return dataImg;
};

window.onload = () =>{
    let video = $("#vid").get(0);

    let canvVideo = $("#vidCanv").get(0);
    let ctx = canvVideo.getContext("2d");

    let canvHaffman = $("#canvHaffman").get(0);
    let StatHaffman = $("#HaffmanStat").get(0);
    let ctxHaffman = canvHaffman.getContext("2d");
    let ctxStatH = StatHaffman.getContext("2d");

    let canvRLE = $("#canvRLE").get(0);
    let StatRLE = $("#RLEStat").get(0);
    let ctxRLE = canvRLE.getContext("2d");
    let ctxStatR = StatRLE.getContext("2d");

    let canvLZW = $("#canvLZW").get(0);
    let StatLZW = $("#LZWStat").get(0);
    let ctxLZW = canvLZW.getContext("2d");
    let ctxStatL = StatLZW.getContext("2d");

    let canvLog = $("#vidLog").get(0);
    let ctxLog = canvLog.getContext("2d");
    let canvExp = $("#vidExp").get(0);
    let ctxExp = canvExp.getContext("2d");

    let localMediaStream = null;

    let drawGraphic = (ctx, stat) => {
        ctx.fillStyle = "#595959";
        ctx.fillRect(0, 0, ctx.canvas.width, ctx.canvas.height);

        ctx.fillStyle = "#ff0000";
        ctx.fillRect(ctx.canvas.width/7, ctx.canvas.height*(1-stat.per/100)-1, ctx.canvas.width/7, ctx.canvas.height*(stat.per/100)-1);
        ctx.fillStyle = "#00ff00";
        ctx.fillRect(ctx.canvas.width/7*3,ctx.canvas.height*(1-stat.timeEncode/360)-1, ctx.canvas.width/7, ctx.canvas.height*(stat.timeEncode/360)-1);
        ctx.fillStyle = "#0000ff";
        ctx.fillRect(ctx.canvas.width/7*5,ctx.canvas.height*(1-stat.timeDecode/360)-1, ctx.canvas.width/7, ctx.canvas.height*(stat.timeDecode/360)-1);

        ctx.fillStyle = "#f1f1f1";
        ctx.font = '10px sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(Math.round(stat.per*10)/10 + '%', ctx.canvas.width/7*1.5, ctx.canvas.height/2);
        ctx.fillText(stat.timeEncode + 'ms', ctx.canvas.width/7*3.5, ctx.canvas.height/2);
        ctx.fillText(stat.timeDecode + 'ms', ctx.canvas.width/7*5.5, ctx.canvas.height/2);


        ctx.strokeStylekeS = "#333333";
        ctx.beginPath();

        ctx.moveTo(0, 0);
        ctx.lineTo(0, ctx.canvas.height-1);
        ctx.moveTo(0, ctx.canvas.height-1);
        ctx.lineTo(ctx.canvas.width, ctx.canvas.height-1);
        ctx.stroke();

    };

    let drawName= (ctx, name) => {
        ctx.fillStyle = "#545454";
        ctx.font = '60px sans-serif';
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(name, ctx.canvas.width/2, ctx.canvas.height/2);
    }

    socket.on('codeHuffman', (data) => {
        let res = data.obj;
        let newData = [];
        for (let i = 0, len = res.length; i < 2457600 && i < len; i += 8) {
            let str = res[i] + res[i + 1] + res[i + 2] + res[i + 3] + res[i + 4] + res[i + 5] + res[i + 6] + res[i + 7];
            newData.push(parseInt(str, 2));
        }
        newData = addCol(newData);
        let iD = new ImageData(Uint8ClampedArray.from(newData), 320, 240);
        ctxHaffman.putImageData(iD, 0, 0);
        drawGraphic(ctxStatH, data.stat, "Huffman");
        drawName(ctxHaffman, "Huffman");

    });

    socket.on('codeRLE', (data) => {
        console.log("rle " + data.stat.timeEncode + " " + data.stat.timeDecode);
        let res = data.obj;
        res = [].concat(res[0]).concat(res[1]).concat(res[2]).concat(res[3]);
        res = addCol(res);
        let iD = new ImageData(Uint8ClampedArray.from(res), 320, 240);
        ctxRLE.putImageData(iD, 0, 0);
        drawGraphic(ctxStatR, data.stat);
        drawName(ctxRLE, "RLE");
    });

    socket.on('codeLZW', (data) => {
        let res = addCol(data.obj);
        let iD = new ImageData(Uint8ClampedArray.from(res), 320, 240);
        ctxLZW.putImageData(iD, 0, 0);
        drawGraphic(ctxStatL, data.stat);
        drawName(ctxLZW, "LZW");
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
