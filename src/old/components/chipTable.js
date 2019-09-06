import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactDOM from 'react-dom';
import Data from './data';
const style = {
  width: '100%',
  height: '100%'
}
export default class ChipTable extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {

  }

  render() {
    const { onBet } = this.props;
    return (
      <div className="dice-sheet">
        {
          Data.map((value, index) => {
            if (value.style) {
              return (
                <div className={`bet-container bet-container-${index}`} key={index} style={value.style} onMouseDown={e => { onBet(e) }}>
                  <span className="tip hove-show">
                    <span className="text">0.00</span>
                  </span>
                  <div className={` bet-type dice-sheet-${index}`} style={style} name={value.property.name} key={index}></div>
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