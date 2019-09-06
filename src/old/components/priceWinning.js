import Data from './data.js';
/**
 * [prizewinning 判断是否中奖]
 * @param  {[type]} arr [开奖号码]
 * @return {[type]} winIndex [中奖索引]
 */
  export function prizeWinning(arr) {
    var self = this;
    var three=0; //出现三次
    var two=0;    //出现两次
    var winIndex = []; //记录中奖索引
    //和值
    var sum = parseInt(arr[0])+parseInt(arr[1])+parseInt(arr[2]);
    if(arr[0] == arr[1] && arr[0] == arr[2]){
      winIndex.push(16);         //豹子
      three = arr[0] + arr[1] + arr[2];
    }
    //对子
    if(arr[0] == arr[1]){
      two = arr[0] + arr[1];
    } else if(arr[0] == arr[2]){
      two = arr[0] + arr[2];
    } else if(arr[1] == arr[2]){
      two = arr[1] + arr[2];
    }
  //  console.log(two);
    //组合
    var pair1 = arr[0] < arr[1] ? arr[0] + arr[1] : arr[1] + arr[0];
    var pair2 = arr[0] < arr[2] ? arr[0] + arr[2] : arr[2] + arr[0];
    var pair3 = arr[1] < arr[2] ? arr[1] + arr[2] : arr[2] + arr[1];

   //单双
   winIndex.push(sum%2 ? 2 : 3);
   //大小
   if( sum>=4 && sum <= 10) {
     winIndex.push(1);
   }else if(sum >=11 && sum<=17) {
     winIndex.push(0);
   }
//   console.log(arr);
   for(var i=0; i<Data.length; i++) {
    if( Data[i].property.name == 'two' + two || Data[i].property.name == "three" + three || Data[i].property.name == 'sum' + sum ||
        Data[i].property.name == 'pair' + pair1 || Data[i].property.name == 'pair' + pair2 ||  Data[i].property.name == 'pair' + pair3 ||
        Data[i].property.name == 'one' + arr[0] || Data[i].property.name == 'one' + arr[1] || Data[i].property.name == 'one' + arr[2] ||
        Data[i].property.name == 'one' + two || Data[i].property.name == 'one' + three) {
        winIndex.push(i)
    }
   }
   var sortWinIndex = sortWInIndex(winIndex);
   //console.log(sortWinIndex);
   return sortWinIndex;
  }
  
  /**
   * [sortWInIndex 对获奖索引进行排序]
   * @param  {[type]} winIndex [索引数组]
   * @return {[type]}          [description]
   */
   function sortWInIndex(array) {
     var length = array.length;
     var i, j, minIndex, minValue, temp;
     for(i=0; i <length -1; i++) {
       minIndex = i;
       minValue = array[minIndex];
       for(j = i + 1; j < length; j++) {
         if(array[j] < minValue) {
           minIndex = j;
           minValue = array[minIndex];
         }
       }

       //交换位置
       temp = array[i];
       array[i] = minValue;
       array[minIndex] = temp;
     }
     return array;
   }
