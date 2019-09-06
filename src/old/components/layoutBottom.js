
import React, { Component } from 'react';
import propTypes from 'prop-types';
import ReactDOM from 'react-dom';

export default class Bottom extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    var { dataCountAmount, dataUserBalance } = this.props;
    return (
      <footer id="bottom">
        <span className='chip-group'>
          <i className='chip chip-1 chip-seleced' data-money='1.00'></i>
          <i className='chip chip-2' data-money='2.00'></i>
          <i className='chip chip-5' data-money='5.00'></i>
          <i className='chip chip-10' data-money='10.00'></i>
          <i className='chip chip-20' data-money='20.00'></i>
          <i className='chip chip-50' data-money='50.00'></i>
          <i className='chip chip-100' data-money='100.00'></i>
          <i className='chip chip-500' data-money='500.00'></i>
        </span>

        <div className="dice-balance">
          <div className="bet-amount">
            <label>下注额:</label>
            ￥<span className="data-count-amount">{dataCountAmount}</span>
          </div>
          <div className="bet-balance">
            <label>余额:</label>
            ￥<span className="data-user-balance">{dataUserBalance}</span>
          </div>
        </div>

        <div className="action-buttom">
          <div className="ui-button bet-button">下注</div>
          <div className="ui-button button-revocation">撤销</div>
          <div className="ui-button button-clear">清空</div>

        </div>
      </footer>
    )
  }
}