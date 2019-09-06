/**
 * [state 上侧面板，显示骰盅, 奖期倒计时，开奖记录，查询开奖号码，开奖动画]
 * @type {Object}
 */
import React, {Component} from 'react';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Countdown from './countDown.js';
import Data from './data.js';
import calculate from './calculate.js';
import {prizeWinning} from './priceWinning.js'
export default class dicePanel extends Component {
  constructor(props) {
    super(props);
    this.state = {
      issue: '*',
      countDown: 90000000,
      history:[],
      lastIssue: '',
      isTimeout: false,
    }
    this.getCountDownTime = this.getCountDownTime.bind(this);
    this.getNewNumber = this.getNewNumber.bind(this);
  }
  // 查询开奖数字回调函数
 codeQuery(){ }
  componentDidMount() {
    var self = this;
    this.getHistory();
    this.getCountDownTime();
  }

  /**
   * [第一次获取并显示历史记录]
   * @return {[type]} [description]
   */
    getHistory() {
      var self = this;
      var getHistoryInterval=setInterval(function(){
            self.props.timerActions.applySyncTime(self.props.selectedLotType, self.getHistoryCallBack(), true);
            self.props.pickerActions.queryOpenCode(self.props.selectedLotType, this.codeQuery,20);
            var openCodeList = self.props.openCodesInfo;  //历史记录列表
            var newList = [];
            openCodeList.map((item, index) => {
              var codeArr = item.Code.split('');
              var defineArr = self.defineCodeArr(codeArr);
              newList.push({code: codeArr, time: item.Issue, sum: defineArr.sum, bigSmall: defineArr.bigSmall, oddEven:defineArr.oddEven});
            })
            self.setState({
              history: newList,
              issue : self.props.lotTimerInfo.nextIssue,
              countDown : self.props.lotTimerInfo.leftSeconds,
            });
            //获取到则清除定时器
            if(openCodeList.length){
              //监听倒计时
              self.questNumber = setInterval(function(){
                self.getNewNumber();
                console.log('getNewNumber');
              }, 3000)
              window.clearInterval(getHistoryInterval);
            }
      },1000)
  }
/**
 * [countDownFinish 倒计时结束触发]
 * @return {[type]} [description]
 */
  countDownFinish(){
    var self =this;
    setTimeout(function(){
      self.props.timerActions.applySyncTime(self.props.selectedLotType, self.getHistoryCallBack(), true);
      self.props.pickerActions.queryOpenCode(self.props.selectedLotType, this.codeQuery,20);
      var countDownTime = self.props.lotTimerInfo.leftSeconds;
      var issue = self.props.lotTimerInfo.nextIssue;
      self.setState({
        countDown: countDownTime,
        issue
      });
    },1000)
    //每2秒查询一次是否已经开奖
    setTimeout(function(){
      self.questNumber = setInterval(function(){
        self.getNewNumber();
      }, 2000)
    },2000)
  }
  //返回历史记录
  getHistoryCallBack(){
  }

  /**
   * [判断大小单双值]
   * @param  {[type]} arr [description]
   * @return {[type]}     [description]
   */
   defineCodeArr(arr){
     var rest = {};
     var sum = 0;
     var bigSmall;
     var oddEven;
     for(var i=0; i<arr.length; i++){
       sum += parseInt(arr[i]);
     }

     if(sum%2 == 0) {
       oddEven = '双';
     }else if (sum%2 == 1) {
       oddEven = '单';
     }
     if(sum >= 11 && sum <= 17) {
       bigSmall = "大";
     } else if (sum>=4 && sum<=10) {
       bigSmall = "小";
     } else if (sum==3 || sum==18) {
        bigSmall = "豹";
        oddEven = '豹'
     }
     rest = {sum:sum, bigSmall:bigSmall, oddEven:oddEven};
     return rest;

   }
/**
 * [getNewNumber 获取新的开奖号码]
 * @return {[type]} [description]
 */
   getNewNumber(){
     var self = this;
     self.props.timerActions.applySyncTime(self.props.selectedLotType, 'callback', true);
     this.props.pickerActions.queryOpenCode(self.props.selectedLotType, this.codeQuery(),20);
     var openCodeList = self.props.openCodesInfo;  //历史记录列表
     self.setState({
       issue : self.props.lotTimerInfo.nextIssue,
     })
     var openingIssue = self.props.lotTimerInfo.openingIssue; //当前期号
     var lastIssue = self.props.openCodesInfo[0].Issue; //上一期期号
    // 发生发现已经开奖则清除定时器
     if(openingIssue == lastIssue){
       var openCodes = self.props.openCodesInfo[0].Code;
       var arr = openCodes.split('');
       // console.log('开奖号码');
       // console.log(arr);
       self.lotteryDrawCss(arr);
         //更新历史记录
         var newList = [];
         openCodeList.map((item, index) => {
           var codeArr = item.Code.split('');
           var defineArr = self.defineCodeArr(codeArr);
           newList.push({code: codeArr, time: item.Issue, sum: defineArr.sum, bigSmall: defineArr.bigSmall, oddEven:defineArr.oddEven});
         })
         self.setState({
           history: newList,
         },() => {});
         window.clearInterval(this.questNumber)
     }
   }
   /**
    * [getCountDownTime 倒计时]
    * @return {[type]} [description]
    */
  getCountDownTime() {
    var self =this;
    setInterval(function(){
      if(self.props){
        self.props.timerActions.applySyncTime(self.props.selectedLotType, self.getHistoryCallBack(), true);
        self.props.pickerActions.queryOpenCode(self.props.selectedLotType, this.codeQuery,20);
        var countDownTime = self.props.lotTimerInfo.leftSeconds;
        var issue = self.props.lotTimerInfo.nextIssue;
        self.setState({
          countDown: countDownTime,
          issue
        });
      }
    },30000);
  }

  /**
   * 开奖动画
   */
  lotteryDrawCss(arr = [6,6,6]) {
    self = this;
    var glass = document.getElementsByClassName('dice-panel')[0].getElementsByClassName('glass')[0];
    document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='none';
    var RegExp =/[1-6]/;
    var resArr=[];  //记录开奖号码
    var arr = arr; //开奖号码
      // var uiBtn = document.getElementsByClassName('ui-button');
      // for(var i=0; i<uiBtn.length; i++) {
      //   uiBtn[i].classList.add('btn-disabled')
      // }
      var dices =  glass.getElementsByTagName('i');
      //console.log(typeof dices);
      for(let i=0; i<dices.length; i++) {
        dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
        dices[i].style.left = (i*52)+'px';
        setTimeout(function() {
          dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
          setTimeout(function() {
            dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
            setTimeout(function() {
              dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
              setTimeout(function() {
                dices[i].setAttribute('class','dice dice-' + Math.ceil(Math.random()*6) + ' dice-animation');
                dices[i].style.top = 80+'px';
                setTimeout(function() {
                  dices[i].setAttribute('class','dice dice-' + arr[i]);
                  resArr.push(dices[i].getAttribute('class').match(RegExp)[0]); //将结果存储到resArr中
                })
              },10)
            },150)
          },150)
        },200)
      }

      setTimeout(function() {
          var winIndex =prizeWinning(resArr);
          //中奖索引变亮
          var betType = document.getElementsByClassName('dice-sheet')[0];
          for(var i=0; i< winIndex.length; i++) {
            betType.getElementsByClassName('dice-sheet-' + winIndex[i])[0].style.visibility='visible';
          }
        //  self.saveHistory(resArr,winIndex);
          setTimeout(function(){
            for(var i=0; i< winIndex.length; i++) {
              betType.getElementsByClassName('dice-sheet-' + winIndex[i])[0].style.visibility='hidden';
            }
            document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='auto';
          },1000)

      },1000)
  }

  render() {
    var {issue, countDown, isTimeout} = this.state;
    var {history} = this.state;
    return (
      <div className="dice-panel">
        <div className="logo"><img src="images/logo.png" alt="" className="logo-img"/></div>
        <div className="dice-rule">规则鼠标悬浮 ？查看</div>
      <div className="time-continer"><span className="dicePanel-issue">{issue}</span>期截止</div>
         <div className="countDown">
           <Countdown start= {countDown} freq= {60} needBg= {false} needProgress= {false} onTimeout={e => this.countDownFinish()}/>
           <span className="colon times"></span>
         </div>
        <div className="glass">
          <i className='dice dice-1'></i>
          <i className='dice dice-2'></i>
          <i className='dice dice-3'></i>
        </div>
        <div className="lottery-record">
          <div className="record-title">
            <span className="title0">开奖记录</span>
            <span className="title1">大小</span>
            <span className="title2">单双</span>
            <span className="title3">和值</span>
            <span className="title4">查看更多 <span id='triangle-right'></span></span>
          </div>
            <ul className="record-container">
              {
                 history.map((hlist, index) => {
                  return (
                     <li key={index}>
                       <div className="recorder-group">
                         <div className="rec1">
                           {
                             hlist.code.map((number,index) => {
                               return (
                                 <span className={`dice-number dice-number-${number}`} key={index}></span>
                               )
                             })
                           }
                         </div>
                         <div className="rec2">{hlist.bigSmall}</div>
                         <div className="rec3">{hlist.oddEven}</div>
                         <div className="rec4">{hlist.sum}</div>
                         <div className="rec5">{hlist.time}</div>
                       </div>
                     </li>
                  )
                 })
              }
            </ul>
        </div>

      </div>
    )
  }
}
