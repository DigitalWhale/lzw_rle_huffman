'use strict';

 let AArray = function(typeSort){ //typeSort: true - сортирвка по возрастанию, false - по убыванию
    this.array = [];
   if (typeof (typeSort) == "function") {
       this.typeSort = typeSort;
   }
   else {
       this.typeSort = function(a, b){
           if(a.toString() > b.toString()){
               return 1;
           }
           else {
               return -1;
           }
       };
   }

};

//Сортировка элемента
AArray.prototype.dSortInvert = function(index){
    while(index != 0 && this.typeSort(this.array[index], this.array[index-1]) == -1){
        let buffer = this.array[index];
        this.array[index] = this.array[index-1];
        this.array[index-1]=buffer;
        index--;
    }
};

AArray.prototype.dSort = function(index){
    while(index != this.array.length-1 && this.typeSort(this.array[index], this.array[index+1]) == 1){
        let buffer = this.array[index];
        this.array[index] = this.array[index+1];
        this.array[index+1]=buffer;
        index++;
    }
};

AArray.prototype.sort = function () {
    this.array.sort(this.typeSort);
};



//Добавление элемента с автосортировкой
AArray.prototype.push = function(element){
    this.array.push(element);
    this.dSortInvert(this.array.length-1);
};

//Добавление без сортировки
AArray.prototype.NSpush = function (element) {
    this.array.push(element);
};

AArray.prototype.add = function (index, element) {
    if(this.array[index] === undefined){
        this.array[index] = element;
    }
    else {
        this.array.splice(index, 0 ,element);
    }
};




AArray.prototype.edit = function(index, value, pole){
    if(pole){
            this.array[index][pole] = value;
    }
    else {
            this.array[index] = value;
    }
    if(this.typeSort(this.array[index], this.array[index+1]) == 1){
        this.dSort(index);
    } else  if(this.typeSort(this.array[index-1], this.array[index]) == 1){
        this.dSortInvert(index);
    }
};

AArray.prototype.get = function(index){
    return this.array[index];
};

AArray.prototype.getArr = function(){
    return this.array;
};

AArray.prototype.size = function(){
    return this.array.length;
};

AArray.prototype.clear = function(){
    this.arr = [];
};


AArray.prototype.deleteElement = function(index, deleteCount){
    this.array.splice(index, deleteCount);
};

module.exports.AArray = AArray;



