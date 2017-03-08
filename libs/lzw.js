'use strict';

let weight = (encoded) => {
    encoded.join('');
    return encoded.length;
};

module.exports.encode = (data) => {
    let a = Date.now();
    let dictionary = {};
    for(let i = 0; i < 256; i++){
        dictionary[String.fromCharCode(i)] = i;
    }
    let max = 256;
    let series = String.fromCharCode(data[0]);
    let code = [];
    for(let i = 1; i < data.length; i++){
        if(series+String.fromCharCode(data[i]) in dictionary){
            series +=String.fromCharCode(data[i]);
        }
        else {
            code.push(dictionary[series]);
            dictionary[series+String.fromCharCode(data[i])] = max++;
            series = String.fromCharCode(data[i]);
        }
    }
    code.push(dictionary[series]);
    a = Date.now() - a;
    let per = weight(code)/data.length*100;
    return {obj: code, stat: {timeEncode: a, per: 100 - per}};
   // return code;
};

module.exports.decode = (code) => {
   let a = Date.now();
    let dictionary = {};
    //Создаем словарь
    for(let i = 0; i < 256; i++){
        dictionary[i] = i.toString();
    }

    //Указываем последний элемент
     let max = 256;
    let decodeStr = '';
    let OCode, NCode;
    //Текущий элемент
    let elem;
    OCode = code[0];
    decodeStr+=dictionary[OCode];
    for(let i = 1; i < code.length; i++) {
        NCode = code[i];
        if(NCode in dictionary){
            decodeStr += ','+dictionary[NCode];
            elem = dictionary[NCode].match(/\d+/);
        }
        else {
            decodeStr += ','+dictionary[OCode]+','+elem;
            elem = dictionary[OCode].match(/\d+/);
        }
        dictionary[max++] = dictionary[OCode]+','+elem;
        OCode = NCode;
    }
    decodeStr = decodeStr.split(',');
    a = Date.now() - a;
    return a;
};