let PNG = require('pngjs').PNG;
let ADarray = require('./AutosortDynamicArray').AArray;
let logger = require('./logger')(module);

//{name: 255, statistic: 123}
let fSort = (a, b) => {
    if(a.stat < b.stat) return 1;
    else return -1;
};

let recursive = (endTable, obj, str) => {
    if(obj['0'] !== undefined){ recursive(endTable, obj['0'], str + '0'); }
    else {
        obj['path'] = str;
        endTable[obj.name] = obj.path;
    }

    if(obj['1'] !== undefined){ recursive(endTable, obj['1'], str + '1'); }
    else {
        obj['path'] = str;
        endTable[obj.name] = obj.path;
    }
};
let endTable = {};

let dSortInvert = (arr, index, typeSort) => {
    while(index != 0 && typeSort(arr[index], arr[index-1]) == -1){
        let buffer = arr[index];
        arr[index] = arr[index-1];
        arr[index-1]=buffer;
        index--;
    }
};


let createCodeTable = (imgData) => {
    let b = Date.now();
    let table = [];
    let endTable = {};
    for (let i = 0; i< 256; i++){
        table.push({'name': i, 'stat': 1});
    }
    for(let i = 0, dataLength = imgData.length; i < dataLength; i++) {
        table[imgData[i]].stat++
    }
    b = Date.now() - b;
    logger.info("Заполнение массива " + b);
    b = Date.now();
    table.sort();
    b = Date.now() - b;
    logger.info("Cортровка массива " + b);
    b = Date.now();
    let sizeTable = table.length;
    while(sizeTable > 1){
        let right = table[sizeTable-1];
        if(right.stat != 0){
            let left = table[sizeTable - 2];
            let node = {stat: (left.stat + right.stat), '1': right, '0': left};
            table.splice(sizeTable - 2, 2, node);
            dSortInvert(table, sizeTable-2, fSort);

        }
        table.splice(--sizeTable, 1);
    }

    b = Date.now() - b;
    logger.info("Создание дерева " + b);
    b = Date.now();
    recursive(endTable, table[0], '');

    b = Date.now() - b;
    logger.info("Создание таблицы " + b);

    return endTable;
};


module.exports.encode = (base64) => {
    let a = Date.now();
    base64 = base64.replace(/^data:image\/png;base64,/,"");
    a = Date.now() - a;
    logger.info("Обрезка base84 " + a);
     a = Date.now();
    new PNG({ filterType:4 }).parse( new Buffer(base64, 'base64'), (err, data) =>
    {
        if(err) throw err;
         a = Date.now()-a;
         d = data.data;
        logger.info("Парсинг в PNG " + a);
        let endTable = createCodeTable(d);
        a = Date.now();
        let end = '';
        for(let i = 0, dataLength = d.length; i < dataLength; i++) {
           end += endTable[d[i]];
        }
        a = Date.now() - a;
        logger.info("Кодировка " + a);
    });
};