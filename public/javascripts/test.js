'use strict';

let socket = io('http://localhost:8888');
socket.on('eventClient', (data)=>{
    console.log(data);
});
socket.emit('eventServer', { data: 'Hello Server' });

socket.on('codeHuffman', (data) => {
    let res = data.obj;
    let newData = [];
    for(let i = 0, len = res.length; i < len; i += 8){
        let str = res[i] + res[i+1]+res[i+2]+ res[i+3]+res[i+4]+ res[i+5]+res[i+6] + res[i+7];
        newData.push(parseInt(str, 2));
    }
    console.log(data.stat.per);
    let iD = new ImageData(Uint8ClampedArray.from(newData), 360, 240);
    ctxHaffman.putImageData(iD, 0, 0);

});

window.onload = () =>{
  let img = jQuery("#img").get(0);
  let canvVideo = $("#Canv").get(0);
  let ctx = canvVideo.getContext("2d");
  ctx.drawImage(img, 0, 0);
   socket.emit("sendScreen", {imageData: canvVideo.toDataURL()})
};