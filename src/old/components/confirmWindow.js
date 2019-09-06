import React, {Component} from 'react';
import propTypes from 'prop-types';
import {PickerGameAppClass} from './lot.game.basic.helper.js';
import {PickerActions} from 'matrix-web-game-actions';
export default class ConfirmWindow extends Component {
  constructor(props){
    super(props);
    this.confirmBets = this.confirmBets.bind(this);
    this.state = {
      betList:[],
      betInfo:'',
    }
  }

  componentDidMount() {
    this.betClick();
  }
  betClick() {
    var self = this;
    var betbtn = document.getElementsByClassName('bet-button');
    //点击投注按钮
    betbtn[0].onclick = function() {
      if(!this.classList.contains('btn-disabled')){
        document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='none';
        self.confirmBets();
      }
    }
    //取消投注
    var cancel = document.getElementsByClassName('confirm-cancel')[0];
    cancel.onclick = function() {
      document.getElementsByClassName('dice-sheet')[0].style.pointerEvents='auto';
      document.getElementsByClassName('confirm-container')[0].style.visibility = 'hidden';
      document.getElementsByClassName('bet-btn')[0].classList.remove('btn-disabled');
      self.setState({
        betInfo: '等待投注状态⌛️',
      })
    }
    //确认投注
    var confirm = document.getElementsByClassName('bet-btn')[0];
    confirm.onclick = function() {
      this.classList.add('btn-disabled');
      const {transactionList, selectedIssue, orderActions, transactionStatus} = self.props;
      if(transactionList.length > 0) { //存在投注记录
          orderActions.ensureOrder({
            txList: transactionList, selectedAps: {}, selectedLotType: this.selectedLotType, selectedIssue, callback: self.onOrderRes
          });
      }
       self.searchState = setInterval(function(){
        var betInfoProp = self.props.transactionStatus;
        var betInfo = self.betInfo( betInfoProp.type );
        self.setState({
          betInfo
        })
        console.log(betInfoProp.type);
        if(betInfoProp.type !== 'ORDERING') {
            window.clearInterval(self.searchState);
        }
      },100);

    }
  }

  /**
   * [onOrderRes 投注成功回调函数]
   * @param  {[type]} res [description]
   * @return {[type]}     [description]
   */
  onOrderRes = (res) => {
    var self = this;
    if(res.Header.ErrCode.Code == 0) {
      self.setState({
        betInfo: '投注成功！',
      })
      setTimeout(function(){
        document.getElementsByClassName('confirm-container')[0].style.visibility = 'hidden';
        document.getElementsByClassName('bet-btn')[0].classList.remove('btn-disabled');
        self.setState({
          betInfo: '等待投注状态⌛️',
        })
        self.props.conformCss();
      },1000)
    }
  }

  /**
   * [confirmBets 确认下注]
   * @return {[type]} [description]
   */
    confirmBets(){
      var self =this;
      var issue = document.getElementsByClassName('dicePanel-issue')[0].innerHTML;
      document.getElementsByClassName('confirm-issue')[0].innerHTML = issue;
      console.log(issue);
      const {transactionList, selectedIssue, orderActions} = this.props;
      var betList = [];
      transactionList.map((val, idx) => {
        var listItem = {palyType:'', multiple:''};
        if(val.playType == 'K3_HZDXDS'){
          switch(val.orderEntity){
            case '0':
            listItem.palyType = '和值大'; break;
            case '1':
            listItem.palyType = '和值小'; break;
            case '2':
            listItem.palyType = '和值单'; break;
            case '3':
            listItem.palyType = '和值双'; break;
          }
        } else {
          listItem.palyType = val.playTypeText + ': ' + val.orderEntity;
        }
          listItem.multiple = val.multiple;
          betList.push(listItem);
      })
       this.setState({
         betList
       })
      document.getElementsByClassName('confirm-container')[0].style.visibility = 'visible';

    }

    /**
     * [betInfo 下注时状态提示]
     * @param  {[type]} betInfo [description]
     * @return {[type]}         [description]
     */
      betInfo(betInfo){
        var info;
        switch(betInfo) {
          case 'ORDERING':
          info = "投注中…"; break;
          case "SUCCESS":
          info = "投注成功!"; break;
          case "FAIL":
          info = "投注失败!"; break;
          case "NO_ORDER_LIST":
          info = "请先添加号码!"; break;
          default:
          info='';
         }
         return info;
         //console.log(pickerActions.changeRetRate(0));
      }

  render() {
    var {betList, betInfo} = this.state;
    var {dataCountAmount} = this.props;
    return(
      <div className="confirm-container">
        <div className="confirm-window">
            <div className="confirm-title">投注订单确认
              <span className="confirm-cancel">✖</span>
            </div>
            <div className="bet-info">
              <div className="bet-type">彩种：江苏骰宝</div>
              <div className="bet-issue">期号：<span className="confirm-issue"></span>期</div>
              <div className="bet-detail">详情：</div>
            </div>
            <div className="bet-list">
              {
                  betList.length ?
                  betList.map((val,idx) => {
                    return (
                      <div className="item-container" key={idx}>
                        <div className="item-idx orderitem">{idx*1 + 1}</div>
                        <div className="item-playType orderitem">
                          {val.palyType}
                        </div>
                        <div className="item-money orderitem">
                          {val.multiple} 倍
                        </div>
                      </div>
                    )
                  })
                 : '不存在投注记录'
              }
            </div>
            <div className="sumMoney"><span className="money-text">总金额:</span><span className="money-Number">{dataCountAmount}</span></div>
            <div className="bet-bottom">
              <div className="bet-btn">确认投注</div>
            <div className="bet-status">{betInfo? betInfo:'等待投注状态⌛️'}</div>
            </div>
        </div>
      </div>
    )
  }
}
