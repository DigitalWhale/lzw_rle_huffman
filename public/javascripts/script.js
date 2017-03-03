'use strict';

let socket = io('http://localhost:8888');
socket.on('eventClient', (data)=>{
    console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });

window.onload = () =>{
  let video = $("#vid").get(0);
  let canvVideo = $("#vidCanv").get(0);
  let canvHaffman = $("#canvHaffman").get(0);
  let ctx = canvVideo.getContext("2d");
  let ctxHaffman = canvHaffman.getContext("2d");
  let localMediaStream = null;


     socket.on('resultVideo', (res) => {
        // console.log(res.req.imageData);
         let image = new Image();
         image.src = res.req.imageData;
         image.onload = function() {
             ctxHaffman.drawImage(image, 0, 0);
         };
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
        socket.emit("sendVideo", {imageData: canvVideo.toDataURL()})
    }, 40 );

};