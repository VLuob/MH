import { Component } from 'react'
import { Icon } from 'antd'
import classnames from 'classnames'

export interface Props {
  favors: number
  hideText: boolean
}

export default class FavorIcon extends Component<Props> {
  render() {
    const { favors, hideText, isActive, size, onClick } = this.props
    const iconStyle = {}
    if (size !== undefined || size !== null) {
      iconStyle.width === size + 'px'
      iconStyle.height === size + 'px'
    }
    
    return (
      <div className="favor-wrapper">
        <div 
          className={classnames('favor-icon', {active: isActive})} 
          style={iconStyle}
          onClick={onClick}
        >
          <Icon type="heart" theme="filled" />
        </div>
        {!hideText &&
          <div className="favor-text">
          {favors || 0} 人喜欢
          </div>}
      </div>
    )
  }
}