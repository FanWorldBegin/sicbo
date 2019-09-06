var calculate = {

  'accAdd': function(a,b) {
    var a1,b1,m;
    try {
      a1=a.toString().split('.')[1].length;  //获取小数点位数
    }catch(e){
      a1=0;
    }
    try {
      b1=b.toString().split('.')[1].length;
    }catch(e){
      b1=0;
    }
    m=Math.pow(10, Math.max(a1,b1));
    return (a*m+b*m)/m;
  },

//减法运算
  'accSub':function(a,b) {
       var r1,r2,m,n;
       try{r1=a.toString().split(".")[1].length}catch(e){r1=0}
       try{r2=b.toString().split(".")[1].length}catch(e){r2=0}
       m=Math.pow(10,Math.max(r1,r2));
       n=(r1>=r2)?r1:r2;
       return ((a*m-b*m)/m).toFixed(n);
  },

  //乘法运算
  //	jiangjin=count.accMul(tipMoney,Data[arr[i]].beishu);
  // sumMoney+=count.accAdd(tipMoney,Number(jiangjin));
  'accMul':function(a,b)
  {
       var m=0,s1=a.toString(),s2=b.toString();
       try{m+=s1.split(".")[1].length}catch(e){}  //获取有几位小数点
       try{m+=s2.split(".")[1].length}catch(e){}
     //  console.log(s2.split(".")); ["0", "98"]
       return Number(s1.replace(".",""))*Number(s2.replace(".",""))/Math.pow(10,m) //pow() 方法可返回 x 的 y 次幂的值。
  },

    //除法运算
  'accDiv':function(a,b){
       var t1=0,t2=0,r1,r2;
       try{t1=a.toString().split(".")[1].length}catch(e){}
       try{t2=b.toString().split(".")[1].length}catch(e){}
            r1=Number(a.toString().replace(".",""))
            r2=Number(b.toString().replace(".",""))
            return (r1/r2)*Math.pow(10,t2-t1);
  },
}

export default calculate;
