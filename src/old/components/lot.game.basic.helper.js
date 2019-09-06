import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';

export class PickerGameAppClass extends Component {
  constructor(props) {
    super(props);
    this.selectedLotType = props.gameplayData.code;
    this.lastOrders = [];
  }
  init() {
    const self = this;
    const {selectedLotType} = this;
    const {pickerActions, timerActions} = this.props;
    pickerActions.initPickerGame(this.props.gameplayData);

    this.syncGameData();

    const {LOT_OPEN_REF_PREF, LOT_AWARD_REF_PREF} = window;

    /**
     * 注册游戏的开奖接口, 由外部 websocket 的推送机制或者轮询机制来触发,
     */
    window[`${LOT_OPEN_REF_PREF}${selectedLotType}`] = function(lotOpenInfo) {
      /**
       * lotOpenInfo: [
       *   Code: LotCode,
       *   Issue: String
       * ]
       */
      self.onOpenCode(lotOpenInfo, true);
    }
    window[`${LOT_AWARD_REF_PREF}${selectedLotType}`] = function(lotOpenInfo) {
      // console.log(lotOpenInfo);
      self.onAward(lotOpenInfo.LottType);
    }

    this._syncTime = this.syncTime.bind(this);
    this._syncGameData = function(res) {
      if(res.state == 'ok') self.syncGameData();
    }

    window.G_O_EventEmitter.subscript('UN_LOCK_SCREEN_SUCCESS', this._syncTime);
    window.G_O_EventEmitter.subscript('CHANGE_NETWORK_STATUS', this._syncGameData);
  }
  componentWillUnmount() {
    // this.setPollLotInfo({
    //   isOpening: false,
    //   isActive: false
    // });

    window.G_O_EventEmitter.deSubscript('UN_LOCK_SCREEN_SUCCESS', this._syncTime);
    window.G_O_EventEmitter.deSubscript('CHANGE_NETWORK_STATUS', this._syncGameData);
    this.props.pickerActions.appUnmount(this.props.sectionId);
  }
  syncGameData() {
    const self = this;
    const {selectedLotType} = this;
    const {pickerActions, timerActions, gameplayData} = this.props;
    const {lottery = {}} = gameplayData;
    this.syncTime((lotTimers, resData) => {

      pickerActions.changeIssue(lotTimers.NextIssue, selectedLotType);

      pickerActions.queryOpenCode(selectedLotType, (openCodeResult) => {
        let currSellIssue = lotTimers.NextIssue;
        let opendIssue = openCodeResult[0].Issue;

        let nextIssueList = window.G_F_GenerateIssuesList({
          issue: opendIssue, limit: 2, includeCurrIssue: true, maxIssue: lottery.maxIssue || 0
        });

        let [currIssue, shouldOpenedIssue] = nextIssueList;

        let isCurrLotOpened = currSellIssue == shouldOpenedIssue;
        let nextIssue = isCurrLotOpened ? currIssue : shouldOpenedIssue;

        this.setPollLotInfo({
          isOpening: !isCurrLotOpened,
          isActive: true,
          nextIssue
        });

        timerActions.receiveTime(lotTimers, resData, selectedLotType, !isCurrLotOpened, nextIssue);
        if(isCurrLotOpened) pickerActions.lotOpen();
      });
    }, false);
    pickerActions.queryOrderReacords(selectedLotType);
  }
  // componentDidMount() {
  //   this.init();
  // }
  getAllCost(txList = []) {
    let allCost = 0;
    txList.forEach(item => allCost += item.priceReal);
    return allCost;
  }
  onAddTransaction(_numVerificationInfo) {
  //  console.log(_numVerificationInfo, 'onAddTransaction');
    const {combinationInfo, pickerActions, orderActions} = this.props;
    const numVerificationInfo = _numVerificationInfo || this.props.numVerificationInfo;
    if(!numVerificationInfo.orderable) return orderActions.changeOrderStatus('NO_PICK');
    pickerActions.addTransaction(combinationInfo, numVerificationInfo);
  }
  onRandomOrder() {
    const {combinationInfo, gameplayData, optionalLocator = {}} = this.props;
    const {selectedGameplay} = combinationInfo;
    const {structure, rule, numberRange} = selectedGameplay;
    const _numberRange = numberRange || gameplayData.numberRange;

    if(structure === 'input') return;
    let orderArr = window.G_F_RandomNumberGenerator({
      generaterLocatorCount: structure.length,
      numberRange: _numberRange,
      optionalLocator,
      rule
    });

    this.onAddTransaction(window.G_F_BetsCalculator({
      selectedNumbers: orderArr, rule, optionalLocator, numberRange
    }));
  }
  onEnsureOrder(selectedAps = {}, options) {
    const {transactionList, callback} = options || this.props;
    const {selectedIssue, orderActions} = this.props;
    const {selectedLotType} = this;
    const self = this;

    if(!transactionList) return orderActions.changeOrderStatus('NO_PICK');
    if(this.getAllCost(transactionList) > window.USER_INFO.Balance) {
      return orderActions.orderFail({
        title: '余额不足',
        details: [{
          LottType: selectedLotType,
          Issue: selectedIssue,
          ErrCode: {
            Desc: '余额不足',
            Code: '30010'
          }
        }]
      });
    }

    function _callback(...args) {
      /**
       * 处理上一次下单成功的订单打印事件
       */
      const orderRes = args[0];
      self.lastOrders = transactionList;
      if(orderRes.Header.ErrCode.Code != '0') return;
      window.G_F_CallFunc(callback)(...args);
    }

    var times = document.getElementsByClassName('times-input')[0].value;
    // console.log('times');
    // console.log(times);
    transactionList.map( val => {
      val.multiple = (val.multiple * times).toString();
    })
    console.log('transactionList');
    console.log(transactionList);
    //ensureOrder 下单
    this.props.orderActions.ensureOrder({
      txList: transactionList, selectedAps, selectedLotType, selectedIssue, callback: _callback
    });
  }
  onOrderDirectly(options) {
    const _options = options || this.props;
    const {
      combinationInfo, selectedNumbers = {}, selectedIssue, callback
    } = _options;
    const {selectedLotType} = this;
    const {orderActions} = this.props;
    const numVerificationInfo = selectedNumbers.verifyInfo || {};
    if(!numVerificationInfo.orderable) {
      return orderActions.changeOrderStatus('DIR_ORDER_TIP');
    }

    let transactionList = [window.G_F_WrapTxItem({
      combinationInfo,
      numVerificationInfo,
      selectedIssue
    })];
    this.onEnsureOrder({}, {
      transactionList, callback
    });
  }
  onShowHand() {
    const {combinationInfo, selectedNumbers, selectedIssue, orderActions} = this.props;
    const {USER_INFO} = window;
    const {Balance} = USER_INFO;

    const {verifyInfo = {}} = selectedNumbers;
    const {betOrderCount} = verifyInfo;
    if(!betOrderCount) {
      return orderActions.changeOrderStatus('SHOWHAND_TIP');
    }

    let SHComInfo = Object.assign({}, combinationInfo, {
      unit: 'li',
      multiple: window.G_F_ToFixed(Balance / betOrderCount / 10, 0)
    })
    this.onOrderDirectly({
      combinationInfo: SHComInfo, selectedNumbers, selectedIssue
    });
  }
  syncTime(callback, needDispatch = true) {
    const {gameplayData} = this.props;
    this.props.timerActions.applySyncTime(gameplayData.code, callback, needDispatch);
  }
  timeout() {
    const {lotTimerInfo, maxIssue, selectedLotType} = this.props;

    const timeoutIssue = lotTimerInfo.nextIssue;
    let nextIssueList = window.G_F_GenerateIssuesList({
      issue: timeoutIssue, limit: 2, includeCurrIssue: true, maxIssue
    });

    this.setPollLotInfo({
      isOpening: true,
      nextIssue: timeoutIssue
    });
    this.props.timerActions.timeout(selectedLotType, timeoutIssue);
  }
  setPollLotInfo(nextInfo) {
    const {gameplayData} = this.props;
    const {isOpening, nextIssue, isActive = true} = nextInfo
    // window.SetActiveLotData({
    //   lotCode: gameplayData.code,
    //   isOpening,
    //   nextIssue,
    //   isActive
    // });
  }
  onAward(lotCode) {
    const {pickerActions} = this.props;
    setTimeout(() => {
      pickerActions.queryOrderReacords(lotCode);
    }, 300);
  }
  onOpenCode(openCodeInfo, isPush) {
    const {pickerActions} = this.props;
    openCodeInfo = Array.isArray(openCodeInfo) ? openCodeInfo : [openCodeInfo];
    pickerActions.receiveOpenCode(openCodeInfo);
    pickerActions.lotOpen();
  }
  onReceiveTeamOrder(teamOrder) {
    const {pickerActions} = this.props;
    pickerActions.receiveTeamOrder(teamOrder);
  }
  toggleLocator() {
   window.G_F_CallFunc(this.refs.LocatorSelector.onToggleLocator.bind(this.refs.LocatorSelector))();
  }
}

PickerGameAppClass.propTypes = {
  // 外层容器的接口
  onAppResponse: PropTypes.func,
  sectionId: PropTypes.string.isRequired,
  gameplayData: PropTypes.object.isRequired,
  // APP 内部数据
  combinationInfo: PropTypes.object.isRequired,
  selectedNumbers: PropTypes.any.isRequired,
  transactionList: PropTypes.array.isRequired,
  txHistoryList: PropTypes.array.isRequired,
  transactionStatus: PropTypes.object.isRequired,
  lotTimerInfo: PropTypes.object.isRequired,
  LRYLInfo: PropTypes.object.isRequired,
  openCodesInfo: PropTypes.array.isRequired,
  selectedIssue: PropTypes.string.isRequired,
};
