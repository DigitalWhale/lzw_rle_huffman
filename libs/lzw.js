'use strict';

let weight = (encoded) => {
    encoded.join('');
    return encoded.length;
};

module.exports.encode = (data) => {
    let a = Date.now();
    let dictionary = {};
    for(let i = 0; i < 256; i++){
        dictionary[String.fromCharCode(i)] = i.toString(2);
    }
    let max = (255).toString(2);
//abacabadabacabae
    a = Date.now() - a;
    console.log('Создание словаря' + a);

    a = Date.now();
    let series = String.fromCharCode(data[0]);
    let code = [];
//code.push(dictionary[series]);

    for(let i = 1; i < data.length; i++){
        if(series+String.fromCharCode(data[i]) in dictionary){
            series +=String.fromCharCode(data[i]);
        }
        else {
            code.push(dictionary[series]);
            max = dictionary[series+String.fromCharCode(data[i])] = (parseInt(max,2)+1).toString(2);
            series = String.fromCharCode(data[i]);
        }
    }
    code.push(dictionary[series]);
    a = Date.now() - a;
    console.log('Обновление словаря' + a);
    let per = weight(code)/data.length*100;
    console.log("Сжатие " + per);
    //return {obj: code, stat: {timeEncode: a, per: 100 - per}};
    return code
};

module.exports.decode = (code) => {
   let a = Date.now();
    let dictionary = {};
    //Создаем словарь
    for(let i = 0; i < 256; i++){
        dictionary[i.toString(2)] = i.toString();
    }

    //Указываем последний элемент
     let max = (255).toString(2);
//let decodeStr = [];
    let decodeStr = '';

    let OCode, NCode;
    //Серия
    let series = '';
    //Текущий элемент
    let elem;
    OCode = code[0];
    decodeStr+=dictionary[OCode];
    for(let i = 1; i < code.length; i++) {
        NCode = code[i];
        if(NCode in dictionary){
            series = ','+dictionary[NCode];
        }
        else {
            series = ','+dictionary[OCode]+','+elem;
        }
        decodeStr +=series;
        elem = series.match(/\d+/);
        max = (parseInt(max,2)+1).toString(2);
        dictionary[max] = dictionary[OCode]+','+elem;
        OCode = NCode;
    }
    decodeStr = decodeStr.split(',');
    //console.log(decodeStr.length);
    a = Date.now() - a;
    console.log(a);
return decodeStr;
};