import React, {Component} from 'react';
import propTypes from 'prop-types';

export default class LoginSelector extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLogin: process.env.NODE_ENV == 'development' ? true : !!window.USER_INFO,
      number: 3,
    }
  }

  componentDidMount() {
    var self = this;
    if(!this.state.isLogin) {
        var countDown = setInterval(function(){
          self.setState((prevState, props) => ({
            number: --prevState.number ,
          }))
          console.log(self.state.number);
          if (self.state.number==1) {
              window.clearInterval(countDown);
            //  window.location.href= "https://gbak.01ssc.net";
          }
        },1000)
    }
  }

	render() {
    const {children} = this.props;
    const {isLogin, number} = this.state;
		return isLogin ? children : (
      <div className="log-jump">
        <div className="jump-window">
          <img src="images/logo.png" alt=""  className='log-logo'/>
        <div className="jump-text">您还未登陆, {`${number}`}秒后跳转登陆页面！</div>
        </div>
      </div>
    );
	}
}

//在app.js中调用里面包含了游戏主逻辑作为 this.propss.children
