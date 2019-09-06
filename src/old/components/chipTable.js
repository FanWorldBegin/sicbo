/**
 * [style 根据Data 值 渲染桌面投注块]
 * @type {Object}
 */
import React, {Component} from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Data from './data.js';
const style = {
  width :'100%',
  height :'100%'
}
export default class ChipTable extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){

  }

	render() {
    const {onBet} = this.props;
		return (
      <div className="dice-sheet">
      {
        Data.map((value, index) =>{
          if(value.style && value.property.hint){
            var typename = value.orders.playType;
            return (
              <div className={`bet-container bet-container-${index}`} key={index}  style={value.style} onMouseDown={e=>{onBet(e)}}>
                <span className="hint">?
                  <div className="hint-box">{
                      window.GAMEPLAY_CONFIGS.LottPlayData[typename].Description? window.GAMEPLAY_CONFIGS.LottPlayData[typename].Description : '' }</div>
                </span>

                 <span className="tip hove-show">
                   <span className="text">0.00</span>
                   </span>
                   <div className={` bet-type dice-sheet-${index}`} style={value.styleDice} name={value.property.name} key={index}></div>
               </div>
            )
          } else if (value.style && !value.property.hint){
            return (
              <div className={`bet-container bet-container-${index}`} key={index}  style={value.style} onMouseDown={e=>{onBet(e)}}>
                 <span className="tip hove-show">
                   <span className="text">0.00</span>
                   </span>
                   <div className={`bet-type dice-sheet-${index}`} style={value.styleDice} name={value.property.name} key={index}></div>
               </div>
            )
          }
        })
      }
      </div>
		)
	}
}

ChipTable.propTypes = {
  onBet: PropTypes.func.isRequired,
}
