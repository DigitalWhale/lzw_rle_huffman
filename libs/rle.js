'use strict';
let logger = require('./logger')(module);

let stat = (codeRLE) => {
    let weight = 0;
    for(let i = 0; i < 4; i++) {
        let len = codeRLE[i].length;
        for (let j = 1; j < len; j += 2) {
            weight += Math.ceil(codeRLE[i][j]/256);
        }
        weight += len/2;
    }
    return weight;
};

module.exports.encode = (data) => {
     let a = Date.now();
    let end = [[], [], [], []];
    let count = [0, 0, 0, 0];
    for(let i = 0, len = data.length; i < len; i+=4){
        for(let j = 0; j<4; j++){
            count[j]++;
            if( data[i+j] != data[i+4+j]){
                end[j].push(data[i+j]);
                end[j].push(count[j]);
                count[j] = 0;
            }
        }
    }
     a = Date.now() - a;
    let per = stat(end);
    per = per/data.length*100;
    return {obj: end, stat: {timeEncode: a, per: 100-per}};
};

module.exports.decode = (rleCode) => {//rleCode - код rle для каждого канала
    let decodeRLE = [];
    let a = Date.now();

    for(let i = 0; i < 4; i++){
        let start = 0;
        for(let j = 0; j < rleCode[i].length; j+=2){
            for(let k = start; k < start + rleCode[i][j+1]; k++){
                decodeRLE[k*4+i] = rleCode[i][j];
            }
            start +=  rleCode[i][j+1];
        }
   }
   a = Date.now() - a;
    return a;


};