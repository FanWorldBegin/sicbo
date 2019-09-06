/**
 * [state 订单查询展示]
 * @type {Object}
 */
import React, {Component} from 'react';
import propTypes from 'prop-types';
import {PickerGameAppClass} from './lot.game.basic.helper.js';
import {PickerActions} from 'matrix-web-game-actions';
export default class ConfirmWindow extends Component {
  constructor(props){
    super(props);
    this.state = {
      orderList:[],
    }
    this.checkOrderList = this.checkOrderList.bind(this);
  }

  componentDidMount() {
    this.betClick();
  }
  /**
   * [betClick 点击事件绑定]
   * @return {[type]} [description]
   */
  betClick() {
    var self = this;
    var betbtn = document.getElementsByClassName('button-view');
    //点击订单按钮
    betbtn[0].onclick = function() {
        self.checkOrderList();
    }
    //关闭订单
    var closeOrderBtn = document.getElementsByClassName('order-cancel');
    //点击订单按钮
    closeOrderBtn[0].onclick = function() {
      document.getElementsByClassName('order-container')[0].style.visibility = 'hidden';
    }

  }
  /**
   * [checkOrderList 查询历史订单]
   * @return {[type]} [description]
   */
  checkOrderList() {
    var self = this;
      document.getElementsByClassName('order-container')[0].style.visibility = 'visible';
      this.props.pickerActions.queryOrderReacords(this.props.clientOrders.LottType, ()=>{
        console.log(self.props.txHistoryList);
        var {txHistoryList} = self.props;
        var orderList = []
        txHistoryList.map((val, idx) => {
          var listItem ={Issue:'', PalyType: '', RealCost:'', Status:''}
          if(val.PlayType == 'K3_HZDXDS'){
            switch(val.OriginalRecord){
              case '0':
              listItem.PlayType = '和值: 大'; break;
              case '1':
              listItem.PlayType = '和值: 小'; break;
              case '2':
              listItem.PlayType = '和值: 单'; break;
              case '3':
              listItem.PlayType = '和值: 双'; break;
            }
          }   else if(val.PlayType == 'K2T_2TFX') {
              listItem.PlayType = '二同号复选: ' + val.OriginalRecord;
              } else if(val.PlayType == 'K3T_3T') {
                listItem.PlayType = '三同号单选: ' + val.OriginalRecord;
              } else if(val.PlayType == 'K3T_3TTX') {
                listItem.PlayType = '三同号通选: ' + val.OriginalRecord;
              } else if(val.PlayType == 'K3_HZ') {
                listItem.PlayType= '和值: ' + val.OriginalRecord;
              } else if (val.PlayType == 'K2BT_2BTDS'){
                listItem.PlayType = '二不同单式: ' + val.OriginalRecord;
              }
              switch(val.Status) {
                case 'wait' :
                listItem.Status = '未开奖'; break;
                case 'none' :
                listItem.Status = '未中奖'; break;
                case 'win' :
                listItem.Status = '已中奖'; break;

              }

              listItem.RealCost = G_F_MoneyFormat(val.RealCost);
              listItem.Issue = val.Issue;
              orderList.push(listItem)
        })

        self.setState({
          orderList: orderList,
        })
      })

  }
  render() {
    var {orderList} = this.state;
    return(
      <div className="order-container">
        <div className="order-window">
          <div className="order-title">查看订单
            <span className="order-cancel">✖</span>
          </div>
          <div className="order-info">
            <div className="order-type">彩种：江苏骰宝</div>
          <div className="order-detail">详情：</div>
          </div>
          <div className="order-list">
            {
                orderList.length ?
                orderList.map((val,idx) => {
                  return (
                    <div className="item-container" key={idx}>
                      <div className="item-idx orderitem">{idx*1 + 1}</div>
                      <div className="item-issue orderitem">
                        {val.Issue}
                      </div>
                      <div className="item-type orderitem">
                        {val.PlayType}
                      </div>
                      <div className="item-money orderitem">
                        {val.RealCost} 元
                      </div>
                      <div className="item-state orderitem">
                        {val.Status}
                      </div>
                    </div>
                  )
                })
               : '不存在投注记录'
            }
          </div>
        </div>
      </div>
    )
  }
}
