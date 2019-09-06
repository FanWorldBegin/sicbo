import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';

import CountdownBg from './countDown.svg.js';

const timeTitleMapper = {
  hour: '时',
  min: '分',
  sec: '秒'
}

export default class Countdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isTimerStart: false,
      countdown: 0
    };
  }
  startCountdown() {
    const {start} = this.props;  //传入时间
    if (this.state.isTimerStart || start === 0) return;
    this.interval = this.startTimer();
  }
  // getSameJumpElem() {
  //   const {jumpClass = ''} = this.props;
  //   if(!jumpClass) return;
  //   this.jumpElem = document.querySelector('.' + jumpClass) || null;
  // }
  setJumpElemCount(timeObj) {
    if(!this.jumpElem) return;

    this.jumpElem.innerHTML = `${timeObj.hour}:${timeObj.min}:${timeObj.sec}` || 0;
  }
  //组件接收到新的props时调用，并将其作为参数nextProps使用，此时可以更改组件props及state。
  componentWillReceiveProps(nextProps) {
    if(nextProps.start !== this.props.start) {
      this.clearTimer();
    }
  }
  shouldComponentUpdate(nextProps, nextState) {
    const isReceiveNewStart = this.props.start !== nextProps.start;
    const isNewCount = this.state.countdown !== nextState.countdown;
    return isNewCount ||
           !nextState.isTimeout ||
           !nextState.isTimerStart ||
           isReceiveNewStart;
  }
  componentDidMount() {
    this.startCountdown();
  }
  componentDidUpdate() {
    this.startCountdown();
  }
  clearTimer() {
    clearInterval(this.interval);
    this.setState({
      isTimerStart: false
    });
  }
  componentWillUnmount() {
    this.clearTimer();
  }
  startTimer() {
    if (this.state.isTimerStart) return;
    const {start, freq = 10, onTimeout} = this.props;
    let self = this;
    let countdown = start - 1;
    self.setState({
      isTimerStart: true,
      // isTimeout: false,
      countdown: countdown
    });
    let oneRound = setInterval(() => {
      countdown--;
      self.setState({
        countdown: (countdown < 0) ? 0 : countdown
      });
      if(countdown === -1) {
        countdown = freq - 1;
        onTimeout();
        // clearInterval(oneRound);
        // self.setState({
        //   isTimerStart: false,
        //   isTimeout: true
        // });
      }
    }, 1000);
    return oneRound;
  }
  // getPercentage(time) {
  //   const {freq} = this.props;
  //   let _freq = freq > 60 ? 60 : freq;
  //   let result = 0;
  //   result = time == 0 ? 0 : (_freq - time) / _freq * 100;
  //   return result;
  // }
  getBgDOM(timeObj, time, idx) {
    const {needBg = true, freq} = this.props;

    if(!needBg) return '';
    let currTime = timeObj[time];

    let currCycle = freq > 60 ? 60 : freq;
    let hourCycle = freq / 3600;
    switch (time) {
      case 'hour':
        currCycle = hourCycle;
        break;
      case 'min':
        currCycle = hourCycle > 1 ? 60 : freq / 60;
        break;
    }
    let currPercent = +(currTime / currCycle * 100);
    let percent = currPercent == 0 ? 0 : window.G_F_ToFixed(100 - currPercent, 0);
    // if(time == 'sec') console.log(percent);
    return (
      <CountdownBg
        percent={percent}
        text={currTime}/>
    )
  }

  render () {
    const {needBg = true, freq, needProgress = false} = this.props;
    const {countdown} = this.state;
    const timeObj = window.G_F_TimeFormat(countdown);
    //{hour: "00", min: "01", sec: 41}
    //const {hour, min, sec} = timeObj;
    const {hour, min, sec} = timeObj;
    const percent = +(countdown / freq * 100);
    const progressDOM = needProgress ? (
      <span className="progress" style={{right: percent + '%'}}></span>
    ) : '';

    this.setJumpElemCount(timeObj);

    return(
      <section className="countdown">
        {
          Object.keys(timeObj).map((time, idx) => {
            if(time != 'hour') {
              let currTime = timeObj[time];
              var unit = currTime % 10;
              var second = (parseInt(currTime) - parseInt(unit))/10;
              let countBg = this.getBgDOM(timeObj, time, idx);
              return (
                <span className={"item " + time} key={idx}>
                  <span className={`times times-${second}`}>{}</span>
                  <span className={`times times-${unit}`}>{}</span>
                  {countBg}
                  <span className="foot">{}</span>
                </span>
              )
            }
          })
        }
        {progressDOM}
      </section>
    )
  }
}

Countdown.propTypes = {
  start: PropTypes.number.isRequired,
  freq: PropTypes.number.isRequired,
  needBg: PropTypes.bool,
  needProgress: PropTypes.bool,
  jumpClass: PropTypes.string,
  onTimeout: PropTypes.func.isRequired
};
