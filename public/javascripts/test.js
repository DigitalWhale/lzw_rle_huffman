'use strict';

let socket = io('http://localhost:8888');
socket.on('eventClient', (data)=>{
    console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });

window.onload = () =>{
  let img = jQuery("#img").get(0);
  let canvVideo = $("#Canv").get(0);
  let ctx = canvVideo.getContext("2d");
  ctx.drawImage(img, 0, 0);
   socket.emit("sendVideo", {imageData: canvVideo.toDataURL()})
};