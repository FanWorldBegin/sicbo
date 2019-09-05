import React, {Component} from 'react';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Data from './data.js';
import calculate from './calculate.js';
import ChipGroup from './chipGroup.js';
import ChipTable from "./chipTable.js";
import DicePanel from './dicePanel.js';
import {prizeWinning} from './priceWinning.js'
import {PickerGameAppClass} from './lot.game.basic.helper.js';
import ConfirmWindow from './confirmWindow.js';
import OrderList from './orderList.js';
// const {pickerActions, timerActions, orderActions} = PickerActions;

// import {bindActionCreators} from 'redux';
// import {connect} from 'react-redux';
// console.log(Actions);
// const {pickerActions, timerActions, orderActions} = PickerActions;
var nowTime=new Date();
var chipArr=new Array(Data.length); // 创建一个空数组，长度为投注种类长度 52 存放每个投注类型中的筹码数量
for (var x=0;x < chipArr.length ;x++ ) {  //存放每个投注类型中的筹码数
  chipArr[x]=new Array();
}

var open = true;                          //是否可下注模式
var chipRecordArr= new Array();           // 数据数组记录每次投注信息

var clientOrders = {
  AwardGroupCode: "AWARD1800",
  ClientOrderId: "402264641",
  Issue: "20170918-062",
  LottCata: "K3",
  LottType: window.LOTT_INFO,
  Multiple: 1,
  OriginalRecord: "1",
  PlayType: "K3T_3T",
  SelectedPosition:"",
  SelectedRate:0,
  Unit:"yuan",
}
export default class GameLogicLayout extends Component {
  constructor(props) {
    super(props);
    this.AddChipThere = this.AddChipThere.bind(this);
    this.showMoney = this.showMoney.bind(this);
    this.buttonClick = this.buttonClick.bind(this);
    this.repealChip = this.repealChip.bind(this);
  //  this.prizeWinning = this.prizeWinning.bind(this);
  //this.settleAccount = this.settleAccount.bind(this);
    this.createChip = this.createChip.bind(this);
    this.saveHistory = this.saveHistory.bind(this);
    //this.sortWInIndex = this.sortWInIndex.bind(this);
    // this.confirmBets = this.confirmBets.bind(this);
    this.empty=this.empty.bind(this);
    this.repealChip=this.repealChip.bind(this);
    this.conformCss=this.conformCss.bind(this);
    this.state = {
      dataCountAmount: '0.00',
      dataUserBalance: (window.USER_INFO || {}).Balance,
      history: [],
      activeChip: 1,
      betInfo: this.props.transactionStatus,
      times:1,
      newList:[],  //处理好的历史记录
      chipRecordArrState:[],
      chipArrState: chipArr,
    };
    /**
     * 游戏接口,打开游戏界面时收到传入的玩家信息
     */
    window.UserCreditUpdate = function(userInfo) {

    }
    //筹码面值
    this.ChipArr = [
      1, 2, 5, 10, 20, 50, 100, 500, 1000, 5000,
    ];
    //下注时需传入的参数
    //this.selectedLotType = props.gameplayData.code;  //AHK3
    this.selectedLotType = "AHK3";
  }
  /**
   * [updateUserInfo 设置余额]
   * @param  {[type]} userInfo [用户的信息]
   * @return {[type]}          [description]
   */
  updateUserInfo = (userInfo) => {
    this.setState({
      dataUserBalance: userInfo.Balance
    })
    console.log('******** gameLogic.js: userInfo.Balance ********');
    console.log(userInfo.Balance);
  }

  //history {restArr:[],winIndex:[],index}
  /**
   * [changeChip 传入chipGroup组件]
   * @param  {[type]} chipVal [获取当前点击元素]
   * @return {[type]}         [description]
   */
  changeChip(chipVal) {    //作为参数传入
    this.setState({
      activeChip: chipVal
    });
    let {times} = this.state;
    let val = (chipVal * times).toString();
    //this.props.pickerActions.changeMultiple(val);  //设置投注倍数
  }
  /**
   * [addTimes 增加倍数]
   */
  addTimes() {
    this.setState( previousState => {
      return {times: ++previousState.times }
    }, function(){
      let {activeChip} = this.state;
      let {times} = this.state;
      let val = (activeChip * times).toString();
      //this.props.pickerActions.changeMultiple(val);  //设置投注倍数
      //console.log(val);
    })
  }
  minusTimes() {
    this.setState( previousState => {
      return {times: --previousState.times >=1 ? previousState.times : 1 }
    }, function() {
      let {activeChip} = this.state;
      let {times} = this.state;
      let val = (activeChip * times).toString();
      //this.props.pickerActions.changeMultiple(val);  //设置投注倍数
    })
  }

/**
 * [bet 传入chipTable组件]
 * @param  {[type]} value [betContainer对象]
 * @return {[type]}       [description]
 */
  bet(e) {
    if(open) {
      var self = this;      //GameLogic
      var betContainer = e.target.parentNode;            //当前对象
      var classC = betContainer.getAttribute('class').toString();
      if (e.target && (e.target.matches('.bet-type') || e.target.matches('.chip-add'))) {
        var chipSelect = document.getElementsByClassName('chip-seleced')[0];     //选中的筹码
        var chipMoney = chipSelect.getAttribute('data-money');            //获取当前选中筹码的金额
        var chipW = chipSelect.offsetWidth;
        var chipH = chipSelect.offsetHeight;
        var index = classC.match(/[0-9][0-9]?/)[0]; //获取索引值：下筹码的位置
        var x = betContainer.getBoundingClientRect().left + betContainer.offsetWidth/2-chipW/2;  //筹码在投注类型中的位置
        var y = betContainer.getBoundingClientRect().top + betContainer.offsetHeight/2-chipH/2;  //筹码在投注类型中的位置
        //左键投注 1
        if(e.button == 0) {
          var json={};
          var chipLeft = chipSelect.getBoundingClientRect().left; //当前选中筹码的位置(下方)
          var chipTop = chipSelect.getBoundingClientRect().top;
          var chipBackpo =  window.getComputedStyle(chipSelect , null).getPropertyValue('background-position'); //当前选中筹码的 backgroundPosition
          var {dataCountAmount,dataUserBalance, times} = self.state;
          /*********************当前投注金额，以后待修改***********************************/
          var nowCountAmount = dataCountAmount*1 + chipMoney*times; //当前投注金额
          if(new Date() - nowTime > 300) {
          /*********************判断余额是否足够***********************************/
            if(nowCountAmount > dataUserBalance*1) {
              alert('余额不足，请充值');
            } else {
              //可以设置最大投注金额
              var chipAdd = document.createElement('i'); //创建可移动的筹码
              chipAdd.className = 'chip chip-add';
              //在当前选中的筹码位置上创建筹码用于移动动画
              chipAdd.style.cssText = 'left:' + chipLeft + 'px; top:'+ chipTop + 'px; background-position:' + chipBackpo+';'; // 设置css为当前选中筹码的位置（屏幕下侧一排）
              document.body.appendChild(chipAdd); // 先创建一个筹码添加到body里面，然后动画飞到创建位置
              console.log(document.styleSheets);
              var styleSheet=document.styleSheets[0];
              // console.log('styleSheet');
              // console.log(styleSheet);
              styleSheet.deleteRule(151);
              styleSheet.insertRule(`@keyframes chipAnimation { 100%{left:${x}px;top:${y}px}}`,151);  //飞到选中区域中间
              chipAdd.setAttribute('class', 'chip chip-add chipMove');
              setTimeout(function(){
                chipAdd.parentNode.removeChild(chipAdd);
                self.AddChipThere( betContainer, chipMoney, index, chipBackpo, chipW, chipH);
              },150);
                json={
                  'chipBackpo': chipBackpo,     //当前选中筹码的 backgroundPosition
                  'chipMoney': chipMoney,   //获取当前选中筹码的金额
                  'postLeft': x,            //筹码在投注类型中放置位置
                  'postTop': y,
                  'index': index,       //当前投注类型的索引值
                  'bitTypeSelf': betContainer,       //指针指向当前选中的投注块
               }
               chipArr[index].length++; //当前选中类型中的筹码数加1
               self.setState({
                 chipArrState : chipArr,
               })
               chipRecordArr.unshift(json);  //从头部插入当前投注信息(记录每次投注信息0)
               self.setState({
                 chipRecordArrState : chipRecordArr,
               })
               //console.log(chipRecordArr);
               //下单后取消btn禁止状态
               var uiBtn = document.getElementsByClassName('ui-button');
               for(var i=0; i<uiBtn.length; i++) {
                 uiBtn[i].classList.remove('btn-disabled');
               }

               nowTime = new Date();
              //  //点击选号，添加选号
              //  const {pickerActions, gameplayData} = self.props;
              //  var orders = Data[index].orders;  //事先对应存好
              //  var playTypeDetails = gameplayData.gameplayGroups[orders.gameplayGroup].groups[orders.group].actions[orders.actionc];
              //  var playType = gameplayData.gameplayGroups[orders.gameplayGroup].code + '_' +  playTypeDetails.code;
              //  //玩法选择 (改变玩法)
              //  pickerActions.changeLocator(gameplayData.gameplayGroups[orders.gameplayGroup], gameplayData.defaultGameplay); //先换group
              //  setTimeout(() => {
              //    pickerActions.changeGameplay( //玩法选择 (改变玩法)
              //      gameplayData.gameplayGroups[orders.gameplayGroup].groups[orders.group].actions[orders.actionc],
              //      playType
              //    )
              // }, 1);

              //  setTimeout(() => {
              //    if(orders.type == 'PICKUP' ) {
              //      pickerActions.changeSelectedNumber(
              //        'PICKUP',  //选择的过程，不用管。
              //        [{"locate":orders.locate, "numberUnit":orders.numberUnit, "display":orders.display}],  //传入的值
              //        playTypeDetails.rule,   //玩法规则
              //        {},    //忽略
              //        playTypeDetails.numberRange,  //当前玩法的索引范围【大小单双为一组01514】
              //      );
              //    } else if (orders.type == 'INPUT') {
              //      // Input单式
              //      pickerActions.changeSelectedNumber(
              //        'INPUT',  //选择的过程，不用管。
              //        [orders.numberUnit],  //传入的值
              //        playTypeDetails.rule,   //玩法规则
              //        {},    //忽略
              //        playTypeDetails.numberRange,  //当前玩法的索引范围【大小单双为一组01514】
              //      );
              //    }
              //   //确认选号
              //    setTimeout(() => {
              //      const {selectedNumbers} = self.props;
              //      //添加到购物车 --transactionList ,selectedNumber清空
              //      self.onAddTransaction(selectedNumbers.verifyInfo);
              //      //添加购物车后计算金额
              //      self.showMoney(betContainer,chipMoney);
              //      console.log('**********this.props添加购物车*******');
              //      console.log(this.props);
              //    }, 10);
              //  }, 10);
            }
          }
          //右键撤销
        } else if(e.button == 2) {
          if(new Date() - nowTime > 300) {
             if(chipArr[index].length && chipRecordArr.length) { //如果当前区块內存在筹码，且存在投注记录
               // 获取当前撤销筹码的金额
              var chipData = betContainer.getElementsByTagName('i')[chipArr[index].length - 1].getAttribute('data-money');
              var chipGroup = document.getElementById('bottom').getElementsByTagName('i');
              var targetChip = this.getDomByAttr(chipGroup, 'data-money', chipData)[0];
              if(targetChip) {
                var targetL = targetChip.getBoundingClientRect().left;     //获取下侧筹码的位置
                var targetT = targetChip.getBoundingClientRect().top;
                var targetBackpo = window.getComputedStyle(targetChip , null).getPropertyValue('background-position');
                var chipRemove = betContainer.getElementsByTagName('i')[chipArr[index].length - 1];
                chipRemove.parentNode.removeChild(chipRemove);
                var remChip = document.createElement('i');
                remChip.className='chip chip-add';
                remChip.style.cssText='left:'+x+'px;top:'+y+'px;background-position:'+targetBackpo+';';
                document.body.appendChild(remChip); // 先创建一个筹码添加到body里面，然后动画飞到创建位置
                var styleSheet=document.styleSheets[2];
                styleSheet.deleteRule(151);
                styleSheet.insertRule(`@keyframes chipAnimation { 100%{left:${targetL}px;top:${targetT}px}}`,151);
                remChip.setAttribute('class', 'chip chip-add chipMove');
                setTimeout(function(){
                  remChip.parentNode.removeChild(remChip);
                },100);
                //判断当前选区存在筹码，筹码个数减1，
               chipArr[index].length > 0? chipArr[index].length-- :chipArr[index].length=0;
               self.setState({
                 chipArrState : chipArr,
               })

               for(var i=0; i<chipRecordArr.length; i++) {  //从前往后找 当前区域中最后一个投注值
                  if(index == chipRecordArr[i].index) {
                    chipRecordArr.splice(i,1);   //当投注区域的index 匹配到 投注记录最新投注的index，则删除这条记录
                    self.setState({
                      chipRecordArrState : chipRecordArr,
                    })
                    self.props.pickerActions.removeTxItem(i);   //删除下注信息
                    setTimeout(function(){
                      //显示投注总钱数
                     self.showMoney(betContainer,-chipData);
                      console.log('**********this.props右键撤销*******');
                      console.log(self.props);
                    },10)
                    break;   //不需要在执行下去(每次撤销只删除一个)
                  }
                }

                //投注记录为0 则禁用按钮
                if(chipRecordArr.length == 0) {
                  var uiBtn = document.getElementsByClassName('ui-button');
                  for(var i=0; i<uiBtn.length; i++) {
                    uiBtn[i].classList.add('btn-disabled');
                  }
                }
              }
             }
             nowTime = new Date();
          }
        }

      }else {
        console.log('请点击有效投位置！');
      }
    }
}
  //
  // getCountDownTime() {
  //   self =this;
  //   setInterval(function(){
  //     self.props.timerActions.applySyncTime('AHK3', 'callback', true);
  //     var countDownTime = self.props.lotTimerInfo.leftSeconds;
  //     self.setState({
  //       countDown:countDownTime
  //     });
  //     if(countDownTime == 1) {
  //     setTimeout(function(){
  //       self.props.timerActions.applySyncTime('AHK3', 'callback', true);
  //       var openCodes = self.props.openCodesInfo[0].Code;
  //       var arr = openCodes.split('');
  //       console.log('开奖号码');
  //       console.log(arr);
  //       self.lotteryDrawCss(arr);
  //     },1500)
  //     }
  //   },1000);
  // }

// /**
//  * [第一次获取并显示历史记录]
//  * @return {[type]} [description]
//  */
//   getHistory() {
//     var self = this;
//     setTimeout(function(){
//       self.props.timerActions.applySyncTime(clientOrders.LottType, 'callback', true);
//       var openCodeList = self.props.openCodesInfo;  //历史记录列表
//       var newList = [];
//       openCodeList.map((item, index) => {
//         var codeArr = item.Code.split('');
//         var defineArr = self.defineCodeArr(codeArr);
//         newList.push({code: codeArr, time: item.Issue, sum: defineArr.sum, bigSmall: defineArr.bigSmall, oddEven:defineArr.oddEven});
//       })
//       self.setState({
//         newList: newList,
//       });
//     },1000)
// }



  /**
   * [getDomByAttr 通过属性值获取Dom元素]
   * @param  {[type]} domArray [将要处理的值集合]
   * @param  {[type]} attr    [属性名]
   * @param  {[type]} value   [属性值]
   * @return {[type]}         [description]
   */
  getDomByAttr(domArray, attr, value){
    var Dom = [];
    for (var i=0; i<domArray.length; i++) {
      if(Number(value) === Number(domArray[i].getAttribute(attr))){
        Dom.push(domArray[i])
      }
    }
    return Dom;
  }
/**
 * [AddChipThere 创建筹码]
 * @param {[type]} bitTypeSelf [当前投注类型的this指针]
 * @param {[type]} chipMoney   [当前选中的筹码面额]
 * @param {[type]} index       [投注类型的索引]
 * @param {[type]} chipBackpo  [筹码的background-position]
 * @param {[type]} chipW       [筹码的宽]
 * @param {[type]} chipH       [筹码的高]
 */
  AddChipThere(bitTypeSelf, chipMoney, index, chipBackpo, chipW, chipH) {
    var chipAdd = document.createElement('i'); //创建要添加的筹码对象
    chipAdd.className = 'chip chip-add';
    chipAdd.setAttribute('data-money', chipMoney);
    chipAdd.style.cssText = 'left:50%; top:50%; margin-left:' + (-chipW/2) + 'px;margin-top:' + (-chipH/2) + 'px; background-position:' + chipBackpo + ';';
    bitTypeSelf.append(chipAdd);

  }

/**
 * [showMoney 1.显示tip中金额。2.更新总金额。3.计算投注钱数]
 * @param  {[type]} bitTypeSelf [当前投注类型的this指针]
 * @param  {[type]} chipMon     [当前选中筹码的面额]
 * @return {[type]}             [description]
 */
  showMoney(bitTypeSelf,chipMon) {
    var chipMon = Number(chipMon);
      var tipMoney =parseInt(bitTypeSelf.getElementsByClassName('text')[0].innerText);   //获取当前投注块的标签中的总筹码金额
      var money = tipMoney + chipMon;
      if(money>=0) {
        var sum = 0;
          bitTypeSelf.getElementsByClassName('text')[0].innerHTML = tipMoney + chipMon + '.00';
          //更新投注总金额
          // for(let i=0; i<chipRecordArr.length; i++){
          //   sum+=parseInt(chipRecordArr[i].chipMoney);
          // }
          var {transactionList} = this.props;
          transactionList.map((val, idx) => {
            sum += Number(val.multiple)* window.BASE_MUL
          })
          var sumchar = sum + '.00';
          this.setState({
            dataCountAmount: sumchar,
          })
      }

  }

  buttonClick() {
    var self = this;
    document.getElementsByClassName('button-revocation')[0].onclick = function(){
      if(!this.classList.contains('btn-disabled')){
        self.repealChip();
      }
    };
    document.getElementsByClassName('button-clear')[0].onclick = function(){
      if(!this.classList.contains('btn-disabled')){
        self.empty();
      }
    }
  }
  /**
   * [buttonHover 下注／撤销／清空筹码鼠标悬浮提示]
   * @return {[type]} [description]
   */
  buttonHover() {
    var btns = document.getElementsByClassName('ui-button');
    var betTip = document.getElementsByClassName('bet-tip')[0];
    for(var i=0; i<btns.length; i++ ) {
      btns[i].onmouseenter = function () {
        if(this.classList.contains('btn-disabled')) {
          betTip.style.visibility = 'visible';
        }
      }
      btns[i].onmouseleave = function() {
        betTip.style.visibility = 'hidden';
      }
    }
  }
  /**
   * [empty 清空筹码]
   * @return {[type]} [description]
   */
  empty() {
    console.log(this);
    var btns = document.getElementsByClassName('ui-button');
    for(var i=0; i<btns.length; i++) {
      btns[i].classList.add('btn-disabled');
    }
    var bitTypes = document.getElementsByClassName('dice-table')[0].getElementsByClassName('bet-container');
    var tips = document.getElementsByClassName('dice-sheet')[0].getElementsByClassName('tip');
    for(var i=0; i<bitTypes.length; i++) {
      var chips = bitTypes[i].getElementsByTagName('i');
      if(chips.length!= 0) {
      //  console.log(chips);
        for(var i=chips.length - 1; i>=0; i--) {
          chips[i].remove();
        }
      }
    }
    for(var i=0; i<tips.length; i++){
      tips[i].getElementsByClassName('text')[0].innerHTML='0.00'
    }
    this.setState({
      dataCountAmount: '0.00',
    });
    //撤销动画
    for(let i=0; i<chipRecordArr.length; i++){
      this.animationTip(chipRecordArr[i]);
    }
    //清空各个区块筹码个数
    for(let i = 0; i < chipArr.length; i++){
      chipArr[i].length = 0;
    }
    // this.props.pickerActions.removeAllTxItem();   //删除下注信息
    chipRecordArr.length = 0;
  }

/**
 * [createChip 根据位置信息创建筹码]
 * @param  {[type]} arr [投注记录]
 * @return {[type]}     [description]
 */
  createChip(arr) {
    var chipRemove = document.createElement('i');
    chipRemove.className = 'chip chip-add';
    chipRemove.setAttribute('data-money', arr.chipMoney);
    chipRemove.style.cssText = 'left:' + arr.postLeft + 'px;top:' + arr.postTop + 'px;background-position:' + arr.chipBackpo+';';
    return chipRemove;
  }
  /**
   * [animationTip 筹码撤销动画]
   * @param  {[type]} arr [投注记录]
   * @return {[type]}     [description]
   */
  animationTip(arr) {
    var chipRemove = this.createChip(arr);
    document.body.appendChild(chipRemove);
    var chipGroup = document.getElementById('bottom').getElementsByTagName('i');
    var targetChip = this.getDomByAttr(chipGroup,'data-money',arr.chipMoney)[0];
    var targetLeft = targetChip.getBoundingClientRect().left;
    var targetTop = targetChip.getBoundingClientRect().top;

    var styleSheet=document.styleSheets[0];
    styleSheet.deleteRule(151);
    styleSheet.insertRule(`@keyframes chipAnimation { 100%{left:${targetLeft}px;top:${targetTop}px}}`,151);
    chipRemove.setAttribute('class', 'chip chip-add chipMove');
    setTimeout(function(){
      chipRemove.remove();
    },150);

  }
  /**
   * [repealChip 撤销]
   * @return {[type]} [description]
   */
  repealChip() {
    if(new Date() - nowTime > 500) {
      if(chipRecordArr.length){
        // this.props.pickerActions.removeTxItem(0);   //删除下注信息
        var lastChip = chipRecordArr.shift();
        this.setState({
          chipRecordArrState : chipRecordArr,
        })
        var chipRemove =lastChip.bitTypeSelf.getElementsByTagName('i')[chipArr[lastChip.index].length - 1];
         chipRemove.remove();
        chipArr[lastChip.index].length ? chipArr[lastChip.index].length -- : chipArr[lastChip.index].length = 0;
        this.animationTip(lastChip);
        this.showMoney(lastChip.bitTypeSelf,-lastChip.chipMoney);
        if(!chipRecordArr.length){
          var uiBtn = document.getElementsByClassName('ui-button');
          for(var i=0; i<uiBtn.length; i++) {
            uiBtn[i].classList.add('btn-disabled')
          }
        }
      }
      nowTime = new Date();
    }
  }

  //
  // lotteryDrawCss(arr = [4,5,6]) {
  //   self = this;
  //   var glass = document.getElementsByClassName('dice-panel')[0].getElementsByClassName('glass')[0];
  //   document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='none';
  //   var RegExp =/[1-6]/;
  //   var resArr=[];  //记录开奖号码
  //   var arr = arr; //开奖号码
  //   // var {dataCountAmount,dataUserBalance} = this.state;
  //     // var dataCountAmount = parseInt(dataCountAmount);
  //     // var dataUserBalance = Number(dataUserBalance);
  //     // var balance = calculate.accSub(dataUserBalance,dataCountAmount);
  //     var uiBtn = document.getElementsByClassName('ui-button');
  //     for(var i=0; i<uiBtn.length; i++) {
  //       uiBtn[i].classList.add('btn-disabled')
  //     }
  //   //  console.log(arr);
  //     // this.setState({
  //     //   dataUserBalance: balance +'.00',   //修改余额
  //     // });
  //     var dices =  glass.getElementsByTagName('i');
  //     //console.log(typeof dices);
  //     for(let i=0; i<dices.length; i++) {
  //       console.log('i');
  //       dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
  //       dices[i].style.left = (i*52)+'px';
  //       setTimeout(function() {
  //         dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
  //         setTimeout(function() {
  //           dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
  //           setTimeout(function() {
  //             dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
  //             setTimeout(function() {
  //               dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
  //               dices[i].style.top = 80+'px';
  //               setTimeout(function() {
  //                 dices[i].setAttribute('class','dice dice-' + arr[i]);
  //                 resArr.push(dices[i].getAttribute('class').match(RegExp)[0]); //将结果存储到resArr中
  //               })
  //             },10)
  //           },150)
  //         },150)
  //       },200)
  //     }
  //
  //     setTimeout(function() {
  //         var winIndex =prizeWinning(resArr);
  //         //中奖索引变亮
  //         var betType = document.getElementsByClassName('dice-sheet')[0];
  //         for(var i=0; i< winIndex.length; i++) {
  //           betType.getElementsByClassName('dice-sheet-' + winIndex[i])[0].style.visibility='visible';
  //         }
  //         self.saveHistory(resArr,winIndex);
  //         setTimeout(function(){
  //           for(var i=0; i< winIndex.length; i++) {
  //             betType.getElementsByClassName('dice-sheet-' + winIndex[i])[0].style.visibility='hidden';
  //           }
  //         //  重置桌面计算奖金
  //           self.settleAccount(winIndex);
  //           document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='auto';
  //           document.getElementsByClassName('bet-info')[0].style.visibility='hidden';
  //         },2000)
  //
  //     },1000)
  // }

/**
 * [conformCss 确认订单后进行筹码收回]
 * @return {[type]} [description]
 */
   conformCss() {
     this.updateUserInfo((window.USER_INFO || {}))
     var self = this;
      var uiBtn = document.getElementsByClassName('ui-button');
      for(var i=0; i<uiBtn.length; i++) {
        uiBtn[i].classList.add('btn-disabled')
      }

      setTimeout(function(){
        //  重置桌面清除投注额
          var tipMoney = 0, sumMoney = 0, priceMoney = 0;
          var winWidth = document.body.clientWidth/2;
          var diceSheet = document.getElementsByClassName('dice-sheet')[0];
          var chips = diceSheet.getElementsByClassName('chip');
          for(var i=chips.length - 1; i>=0; i--) {
            chips[i].remove();
          }
          //清除每块中记录的筹码钱数
          var tips = document.getElementsByClassName('dice-sheet')[0].getElementsByClassName('tip');
          for(var i=0; i<tips.length; i++){
            tips[i].getElementsByClassName('text')[0].innerHTML='0.00'
          }
          self.setState({
            dataCountAmount : '0.00',
          });
          for(var i=0;  i<chipRecordArr.length; i++) {
            var chip = self.createChip(chipRecordArr[i]);
            chip.className = "chip chip-add";
            document.body.appendChild(chip);
            var styleSheet=document.styleSheets[2];
            styleSheet.deleteRule(153);
            styleSheet.insertRule(`@keyframes chipAnimationTop { 100%{left:${winWidth}px;top:${0}px}}`,153);
            chip.setAttribute('class', 'chip chip-add chipMoveTop');
            var chip = document.getElementsByClassName('chipMoveTop');
            setTimeout(function(){
              for(var i=chip.length-1; i>=0; i--) {
              chip[i].remove();
              }
            },200);
          }
          chipRecordArr.length = 0;
          //清空各个区块筹码个数
          for(let i = 0; i < chipArr.length; i++) {
            chipArr[i].length = 0;
          }
          document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='auto';
      },300)

  }
  // componentWillReceiveProps(nextProps) {
  //   // if()
  //   console.log(nextProps.transactionStatus);
  // }
// /**
//  * [confirmBets 确认下注]
//  * @return {[type]} [description]
//  */
//   confirmBets(){
//     var self =this;
//     const {transactionList, selectedIssue, orderActions} = this.props;
//     if(transactionList.length > 0) { //存在投注记录
//       // var conform = confirm("确认投注？");
//       // if(conform == true) {
//         // this.props.orderActions.ensureOrder(this.props.transactionList);    //下注
//         orderActions.ensureOrder({
//           txList: transactionList, selectedAps: {}, selectedLotType: this.selectedLotType, selectedIssue, callback: this.onOrderRes
//         });
//       // }
//     }
//   }
  // /**
  //  * [onOrderRes 投注成功回调函数]
  //  * @param  {[type]} res [description]
  //  * @return {[type]}     [description]
  //  */
  // onOrderRes = (res) => {
  //   if(res.Header.ErrCode.Code == 0) {
  //     console.log('**************下注成功props***********');
  //     console.log(self.props);
  //     this.conformCss();
  //   }
  // }
/**
 * [saveHistory 将开奖号码，中奖索引保存]
 * @param  {[type]} resArr   [开奖号码]
 * @param  {[type]} winIndex [中奖索引]
 * @return {[type]}          [description]
 */
  saveHistory(resArr,winIndex) {
    var history = this.state.history;
    var index = 0;
    if(history.length <= 0) {
      index = 1;
    }else {
      index = history[0].index;
      index++;
    }

    var newRecord = {restArr: resArr, winIndex: winIndex, index: index};
    history.unshift(newRecord);
    this.setState({
      history: history,
    })

    var history = this.state.history;
  }
// /**
//  * [prizewinning 判断是否中奖]
//  * @param  {[type]} arr [开奖号码]
//  * @return {[type]} winIndex [中奖索引]
//  */
//   prizeWinning(arr) {
//     var self = this;
//     var three=0; //出现三次
//     var two=0;    //出现两次
//     var winIndex = []; //记录中奖索引
//     //和值
//     var sum = parseInt(arr[0])+parseInt(arr[1])+parseInt(arr[2]);
//     if(arr[0] == arr[1] && arr[0] == arr[2]){
//       winIndex.push(16);         //豹子
//       three = arr[0] + arr[1] + arr[2];
//     }
//     //对子
//     if(arr[0] == arr[1]){
//       two = arr[0] + arr[1];
//     } else if(arr[0] == arr[2]){
//       two = arr[0] + arr[2];
//     } else if(arr[1] == arr[2]){
//       two = arr[1] + arr[2];
//     }
//   //  console.log(two);
//     //组合
//     var pair1 = arr[0] < arr[1] ? arr[0] + arr[1] : arr[1] + arr[0];
//     var pair2 = arr[0] < arr[2] ? arr[0] + arr[2] : arr[2] + arr[0];
//     var pair3 = arr[1] < arr[2] ? arr[1] + arr[2] : arr[2] + arr[1];
//
//    //单双
//    winIndex.push(sum%2 ? 2 : 3);
//    //大小
//    if( sum>=4 && sum <= 10) {
//      winIndex.push(1);
//    }else if(sum >=11 && sum<=17) {
//      winIndex.push(0);
//    }
// //   console.log(arr);
//    for(var i=0; i<Data.length; i++) {
//     if( Data[i].property.name == 'two' + two || Data[i].property.name == "three" + three || Data[i].property.name == 'sum' + sum ||
//         Data[i].property.name == 'pair' + pair1 || Data[i].property.name == 'pair' + pair2 ||  Data[i].property.name == 'pair' + pair3 ||
//         Data[i].property.name == 'one' + arr[0] || Data[i].property.name == 'one' + arr[1] || Data[i].property.name == 'one' + arr[2] ||
//         Data[i].property.name == 'one' + two || Data[i].property.name == 'one' + three) {
//         winIndex.push(i)
//     }
//    }
//    var sortWinIndex = self.sortWInIndex(winIndex);
//    //console.log(sortWinIndex);
//    return sortWinIndex;
//   }

// /**
//  * [sortWInIndex 对获奖索引进行排序]
//  * @param  {[type]} winIndex [索引数组]
//  * @return {[type]}          [description]
//  */
//  sortWInIndex(array) {
//    var length = array.length;
//    var i, j, minIndex, minValue, temp;
//    for(i=0; i <length -1; i++) {
//      minIndex = i;
//      minValue = array[minIndex];
//      for(j = i + 1; j < length; j++) {
//        if(array[j] < minValue) {
//          minIndex = j;
//          minValue = array[minIndex];
//        }
//      }
//
//      //交换位置
//      temp = array[i];
//      array[i] = minValue;
//      array[minIndex] = temp;
//    }
//    return array;
//  }
// /**
//  * [settleAccount 中奖后奖金分配，筹码重置]
//  * @param  {[type]} winIndex [中奖索引]
//  * @return {[type]}          [description]
//  */
//   settleAccount(winIndex){
//     var tipMoney = 0, sumMoney = 0, priceMoney = 0;
//     var winWidth = document.body.clientWidth/2;
//     var diceSheet = document.getElementsByClassName('dice-sheet')[0];
//     var chips = diceSheet.getElementsByClassName('chip');
//
//     for(var i=chips.length - 1; i>=0; i--) {
//       chips[i].remove();
//     }
//
//     var tips = document.getElementsByClassName('dice-sheet')[0].getElementsByClassName('tip');
//     for(var i=0; i<tips.length; i++){
//       tips[i].getElementsByClassName('text')[0].innerHTML='0.00'
//     }
//     this.setState({
//       dataCountAmount : '0.00',
//     });
//     //console.log(this.state.dataCountAmount);
//     for(var i=0; i<chipRecordArr.length; i++){
//       var chip = this.createChip(chipRecordArr[i]);
//       for(var j=0; j<winIndex.length; j++) {
//         if(winIndex[j] == chipRecordArr[i].index){ //中奖号码index 与投注信息符合(赢)
//           chip.className = "chip chip-add win";
//           tipMoney = Number(chipRecordArr[i].chipMoney);
//           priceMoney = calculate.accMul(tipMoney, Data[winIndex[j]].property.odds);
//           sumMoney += calculate.accAdd(tipMoney, Number(priceMoney)); //当次可收回筹码
//           break; // 当前投注记录与中奖数组中某一数据相匹配
//         }else {
//           chip.className = "chip chip-add lose";
//         }
//       }
//
//       //跳出循环到这里
//       document.body.appendChild(chip);
//       var chipGroup = document.getElementById('bottom').getElementsByTagName('i');
//       var targetChip = this.getDomByAttr(chipGroup,'data-money',chipRecordArr[i].chipMoney)[0];
//       var targetLeft =  targetChip.getBoundingClientRect().left;
//       var targetTop = targetChip.getBoundingClientRect().top;
//       if(chip.className == 'chip chip-add win') {
//         var styleSheet=document.styleSheets[2];
//         styleSheet.deleteRule(151);
//         styleSheet.insertRule(`@keyframes chipAnimation { 100%{left:${targetLeft}px;top:${targetTop}px}}`,151);
//         chip.setAttribute('class', 'chip chip-add chipMove');
//         var chips = document.getElementsByClassName('chipMove');
//         setTimeout(function(){
//           for(var i=chips.length-1; i>=0; i--) {
//             chips[i].remove();
//           }
//         },200);
//       }else if(chip.className == 'chip chip-add lose'){
//         var styleSheet=document.styleSheets[2];
//         styleSheet.deleteRule(153);
//         styleSheet.insertRule(`@keyframes chipAnimationTop { 100%{left:${winWidth}px;top:${0}px}}`,153);
//         chip.setAttribute('class', 'chip chip-add chipMoveTop');
//         var chipLose = document.getElementsByClassName('chipMoveTop');
//         setTimeout(function(){
//           for(var i=chipLose.length-1; i>=0; i--) {
//           chipLose[i].remove();
//           }
//         },200);
//       }
//     }
//
//     var {dataUserBalance} = this.state;
//     var balanceMoney = calculate.accAdd(G_F_MoneyFormat(dataUserBalance), sumMoney);
//     this.setState ({
//       dataUserBalance: balanceMoney+'.00',
//     })
//     chipRecordArr.length = 0;
//     //清空各个区块筹码个数
//     for(let i = 0; i < chipArr.length; i++) {
//       chipArr[i].length = 0;
//     }
//   }
/**
 * [betInfo 下注时状态提示]
 * @param  {[type]} betInfo [description]
 * @return {[type]}         [description]
 */
  // betInfo(betInfo){
  //   var info;
  //   switch(betInfo) {
  //     case 'ORDERING':
  //     info = "投注中…"; break;
  //     case "SUCCESS":
  //     info = "投注成功!"; break;
  //     case "FAIL":
  //     info = "投注失败!"; break;
  //     case "NO_ORDER_LIST":
  //     info = "请先添加号码!"; break;
  //     default:
  //     info='';
  //    }
  //    return info;
  //    //console.log(pickerActions.changeRetRate(0));
  // }
  componentDidMount() {
    var styleSheet=document.styleSheets[2];
    console.log('********gameLogic.js: styleSheet********');
    console.log(styleSheet);
  //  取消右键菜单
    oncontextmenu=function(){return false}
    const self = this;

    this.buttonClick();
    this.buttonHover();
    // TODO 以后需要改造
    // G_O_EventEmitter.subscript('LOGIN_SUCCESS', () => {
    //   // pickerActions.
    //   // const {gameplayData, pickerActions} = self.props;
    //   //
    //   // pickerActions.changeGameplay(
    //   //   gameplayData.gameplayGroups[4].groups[0].actions[1],
    //   //   'K3_HZDXDS'
    //   // )
    // });

    // self.init();
    //self.getCountDownTime();
    //this.getHistory();
    // let postData = {
    //   method: 'order',
    //   data: {
    //     ClientOrders: [
    //
    //     ]
    //   }
    // }
    //
    // onRequest.gameGate(postData, (res) => {
    //
    // })

    // this.syncGameData();
  }

	render() {
    const {
      pickerActions, timerActions, orderActions,
      sectionId, gameplayData,
      lotTimerInfo, selectedNumbers,
      combinationInfo,
      transactionList,
      txHistoryList, transactionStatus,
      selectedIssue,
      LRYLInfo, openCodesInfo,
      onAppResponse,
    } = this.props;
    var {dataCountAmount, dataUserBalance, history, activeChip, times, newList, chipRecordArrState,  chipArrState} = this.state;
		return (
      <div className="container-main">
        <div className="dice-top">
          <DicePanel selectedLotType={this.selectedLotType}  timerActions = {this.props.timerActions} lotTimerInfo={this.props.lotTimerInfo} selectedIssue={selectedIssue}
            openCodesInfo={this.props.openCodesInfo} chipRecordArr={chipRecordArrState}  chipArr={ chipArrState}  pickerActions={pickerActions}/>
          {/* <DicePanelConnect clientOrders={clientOrders}   chipRecordArr={chipRecordArrState}  chipArr={ chipArrState}/> */}
        </div>
        <div className="dice-table">
          <ChipTable onBet={val => this.bet(val)}/>
        </div>
        <div className="layout-bottom">
         <ChipGroup
           onChangeChip={this.changeChip.bind(this)}
           chipArr={this.ChipArr}
           activeChip={activeChip}
           dataCountAmount={dataCountAmount}
           dataUserBalance={'10000'}
           times={times}
           onAddTimes={this.addTimes.bind(this)}
           onMinusTimes={this.minusTimes.bind(this)}
           transactionList={transactionList}
           />
        </div>
        <ConfirmWindow transactionList={transactionList} selectedIssue={selectedIssue} orderActions={orderActions} conformCss={this.conformCss} dataCountAmount={dataCountAmount} transactionStatus={transactionStatus} pickerActions={pickerActions}/>
        <OrderList pickerActions={pickerActions} txHistoryList={txHistoryList} clientOrders={clientOrders}></OrderList>
      </div>
		)
	}
}
