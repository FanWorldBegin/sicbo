import React, {Component, PureComponent} from 'react';
import PropTypes from 'prop-types';
import {Provider} from 'react-redux';

import {PickerStores} from 'matrix-web-game-actions';

import {GameLogic} from './gameLogic.js';

const {GetAllPickerStores} = PickerStores;

export default class LotGameApp extends Component {
  constructor(props) {
		super(props);
  }
  componentDidMount() {
    this.storeCollections = PickerStores.GetAllPickerStores();
  }
  render() {
    const {
      onAppResponse,
      gameplayData,
      sectionId
    } = this.props;

    // const {collections} = PickerStores;
    const store = (PickerStores.GetAllPickerStores())[sectionId]; //获取对应store
    console.log(sectionId, store);
    return (
      <Provider store={store}>
        <GameLogic
          sectionId={sectionId}
          gameplayData={gameplayData}
          onAppResponse={onAppResponse}/>
      </Provider>
    );
  }
}
LotGameApp.propTypes = {
  gameplayData: PropTypes.object.isRequired,
  sectionId: PropTypes.string,
  onAppResponse: PropTypes.func
}
//在app.js中引用
//<Provider store> 使组件层级中的 connect() 方法都能够获得 Redux store。
//正常情况下，你的根组件应该嵌套在 <Provider> 中才能使用 connect() 方法。
