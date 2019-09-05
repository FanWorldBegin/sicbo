/**
 * [id 下侧筹码投注面板]
 * @type {String}
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class ChipGroup extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
  }

  render() {
    var { dataCountAmount, dataUserBalance, activeChip, chipArr, onChangeChip,times, onAddTimes, onMinusTimes} = this.props;
		return (
      <footer id="bottom">
        <div className="dice-balance">
          <div className="bet-amount">
            <label>投注额:</label>
            ￥<span className="data-count-amount">{dataCountAmount}</span>
          </div>
          <div className="bet-balance">
            <label>余额:</label>
            ￥<span className="data-user-balance">{dataUserBalance}</span>
          </div>
        </div>
        <span className='chip-group'>
          {
            chipArr.map((chipVal, idx) => {
              const isActive = activeChip == chipVal; //判断是否为激活状态
              return (
                <i  key={idx} className={`chip chip-${chipVal}` + (isActive ? ' chip-seleced' : '')} data-money={chipVal} onClick={e => onChangeChip(chipVal)}></i>
              )
            })
          }
        </span>


        <div className="dice-times">
          <div className='times-text'>
            <span>倍投</span>
            {/* <span className='times-question'>？</span> */}
          </div>
          <div className="times-number">
            <span className="times-minus" onClick={onMinusTimes}>-</span> <input className='times-input' type="tel" readOnly="true" value={times}/> <span className="times-add" onClick={onAddTimes}>+</span>
          </div>
        </div>

        <div className="action-buttom">
          <div className="ui-button bet-button btn-disabled btn-1">下注</div>
          <div className="bet-tip">请先选择筹码并投注</div>
          <div className="ui-button button-revocation btn-disabled btn-2">撤销</div>
          <div className="ui-button button-clear btn-disabled btn-3">清空</div>
          <div className=" button-view  btn-4">订单</div>
        </div>
      </footer>
		)
	}
}

ChipGroup.propTypes = {
  chipArr: PropTypes.array.isRequired,
  activeChip: PropTypes.number.isRequired,
  onChangeChip: PropTypes.func.isRequired,
}
