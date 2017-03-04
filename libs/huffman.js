let logger = require('./logger')(module);

//{name: 255, stat: 123}
const fSort = (a, b) => {
    if(a.stat < b.stat) return 1;
    else return -1;
};

const recursive = (encTable, decTable, obj, str) => {
    if(obj['0'] !== undefined){ recursive(encTable, decTable, obj['0'], str + '0'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
        decTable[obj.path] = obj.name;
    }

    if(obj['1'] !== undefined){ recursive(encTable, decTable, obj['1'], str + '1'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
        decTable[obj.path] = obj.name;
    }
};

const tree = (table) => {
    table.sort();
    let sizeTable = table.length;
    let right, left, node;
    while(sizeTable > 1){
        right = table[sizeTable-1];
        if(right.stat != 0){
            left = table[sizeTable - 2];
            node = {stat: (left.stat + right.stat), '1': right, '0': left};
            table.splice(sizeTable - 2, 2, node);
            dSortInvert(table, sizeTable-2, fSort);

        }
        table.splice(--sizeTable, 1);
    }
};

const dSortInvert = (arr, index, typeSort) => {
    while(index != 0 && typeSort(arr[index], arr[index-1]) == -1){
        let buffer = arr[index];
        arr[index] = arr[index-1];
        arr[index-1]=buffer;
        index--;
    }
};


const createCodeTable = (imgData) => {
    let table = [];
    for (let i = 0; i< 256; i++){
        table.push({'name': i, 'stat': 1});
    }
    for(let i = 0, dataLength = imgData.length; i < dataLength; i++) {
        table[imgData[i]].stat++
    }
    tree(table);
    let encodingTable = {};
    let decodingTable = {};
    recursive(encodingTable, decodingTable, table[0], '');
    return [encodingTable, decodingTable];
};

module.exports.encode = (data) => {
        const endTable = createCodeTable(data);
        let imgData = [];

        for(let i = 0, dataLength = data.length; i < dataLength; i++) {
            imgData[i] = endTable[0][data[i]];
        }
        return {decode: endTable[1], obj: imgData};
};

module.exports.decode = (decTable, obj) => {
    for(let i = 0; i < obj.length; i++){
        obj[i] = decTable[obj[i]];
    }
    return obj;
};

