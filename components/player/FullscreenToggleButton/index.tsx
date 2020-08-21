import React, { Component } from 'react';
import classNames from 'classnames';
import { Tooltip } from 'antd'

import CustomIcon from '@components/widget/common/Icon'

export default class FullscreenToggle extends Component {
  constructor(props, context) {
    super(props, context);

    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const { player, actions } = this.props;
    actions.toggleFullscreen(player);
  }

  render() {
    const { player, className } = this.props;
    return (
      <button
        className={classNames(
          className,
          // {
          //   'video-react-icon-fullscreen-exit': player.isFullscreen,
          //   'video-react-icon-fullscreen': !player.isFullscreen
          // },
          'video-react-fullscreen-control video-react-control video-react-button video-react-icon'
        )}
        ref={(c) => {
          this.button = c;
        }}
        type="button"
        tabIndex="0"
        onClick={this.handleClick}
      >
        <Tooltip title="全屏">
          <CustomIcon name={player.isFullscreen ? 'narrow-screen' : 'full-screen'} />
        </Tooltip>
          <span className="video-react-control-text">Non-Fullscreen</span>
      </button>
    );
  }
}