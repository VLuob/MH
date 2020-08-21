import React, { Component } from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd'

import CustomIcon from '@components/widget/common/Icon'

export default class TheatreButton extends Component {
  constructor(props, context) {
    super(props, context);
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { onClick } = this.props
    if (onClick) onClick()
  }

  render() {
    const { player, className } = this.props;

    // console.log('player', player)

    return (
      <div
        ref={c => {
          this.button = c;
        }}
        className={classNames(className, {
          'video-react-control': true,
          'video-react-button': true
        })}
        tabIndex="0"
        onClick={this.handleClick}
      >
        <Tooltip title="剧场模式"><CustomIcon name="horizontal-screen" /></Tooltip>
      </div>
    );
  }
}
