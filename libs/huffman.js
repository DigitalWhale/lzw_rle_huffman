//{name: 255, stat: 123}
const fSort = (a, b) => {
    if(a.stat < b.stat) return 1;
    else return -1;
};

const recursiveCreate = (encTable/*, decTable*/, obj, str) => {
    if(obj['0'] !== undefined){ recursiveCreate(encTable/*, decTable*/, obj['0'], str + '0'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
     //   decTable[obj.path] = obj.name;
    }

    if(obj['1'] !== undefined){ recursiveCreate(encTable/*, decTable*/, obj['1'], str + '1'); }
    else {
        obj['path'] = str;
        encTable[obj.name] = obj.path;
       // decTable[obj.path] = obj.name;
    }
};

const recursiveFindName = (obj, str, index) => {
    let node = obj[str[index]];
    if(node !== undefined){return recursiveFindName(node, str, ++index); }
    return [obj.name, index];
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
    //let decodingTable = {};
    recursiveCreate(encodingTable/*, decodingTable*/, table[0], '');
    //return [encodingTable, decodingTable];
    return [encodingTable, table[0]];
};

module.exports.encode = (data) => {
        let a = Date.now();
        const endTable = createCodeTable(data);
        let str = '';
        for(let i = 0, dataLength = data.length; i < dataLength; i++) {
            str += endTable[0][data[i]];
        }
        a = Date.now() - a;
        let per = str.length/(data.length*8)*100;
        return {decode: endTable[1], obj: str, stat: {timeEncode: a, per: 100-per}};
};

module.exports.decode = (tree, obj) => {
    let a = Date.now();
    let index = 0;
    let data = [];
    let out = [];
    let len = obj.length;
    while (index < len){
        out = recursiveFindName(tree, obj, index);
        data.push(out[0]);
        index = out[1];
    }
    a = Date.now() - a;
    return a;
};

