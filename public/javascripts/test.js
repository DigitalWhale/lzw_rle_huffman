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
  socket.on('codeLZW', (data) => {
        let nd = [].concat(data);
        nd.splice(307200);
        if(nd.length <= 307200){
          for (let i = nd.length; i < 307200; i++) {
              nd.push(255);
          }
      }
        console.log(nd.length);
        let iD = new ImageData(Uint8ClampedArray.from(nd), 320, 240);
        ctx.putImageData(iD, 0, 0);

    });
   socket.emit("sendScreen", {imageData: canvVideo.toDataURL()})
};