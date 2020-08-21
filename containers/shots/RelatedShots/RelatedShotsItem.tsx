import { Component } from 'react'
import classnames from 'classnames'
import { toJS } from 'mobx'
import { Avatar, Tooltip } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import AuthorPopupBox from '@containers/author/AuthorPopupBox'

export default class RelatedShotsItem extends Component {
  isInPopup = false
  isPopupLoaded =false

  state = {
      showPopup: false,
  }

  handleAvatarMouseEnter = e => {
    // const avatarImg = this.avatarRef.refs.img
    // const avatarRect = avatarImg.getBoundingClientRect()
    if (this.avatarTimer) clearTimeout(this.avatarTimer)
    this.setState({showPopup: true})
  }

  handleAvatarMouseLeave = e => {
      this.closePopup()
  }

  closePopup() {
      if (this.avatarTimer) clearTimeout(this.avatarTimer)

      this.avatarTimer = setTimeout(() => {
          if (!this.isInPopup) {
              this.setState({showPopup: false})
          }
      }, 200)
  }

  handlePopupMouseOver = e => {
      this.isInPopup = true
  }

  handlePopupMouseOut = e => {
      this.isInPopup = false
      this.closePopup()
  }
  
  handlePopupLoad = (state) => {
    this.isPopupLoaded = state
  }

  render() {
    const { item={}, isVideoType, is4K, durationFormat } = this.props
    const {showPopup} = this.state

    return (
      <div className="related-shots-item" key={item.compositionId}>
        <div className="cover">
          <a href={`/shots/${item.compositionId}`} title={item.title}>
            <img src={`${item.cover}?imageMogr2/thumbnail/!504x360r/size-limit/50k/gravity/center/crop/504x360`} alt={item.title} title={item.title} />
            {isVideoType && <span className="video-play"><CustomIcon name="play" /></span>}
          </a>
          {isVideoType && is4K && <span className="video-4k"><CustomIcon name="4k" /></span>}
          {isVideoType && <span className="video-duration">{durationFormat}</span>}
        </div>
        <div className="content">
          <div className="title"><Tooltip title={item.title}><a href={`/shots/${item.compositionId}`} title={item.title}>{item.title}</a></Tooltip></div>
          <div className="intro">
            <a 
              href={`/author/${item.authorCode}`} 
              target="_blank"
              onMouseEnter={this.handleAvatarMouseEnter}
              onMouseLeave={this.handleAvatarMouseLeave}
            ><Avatar src={item.authorAvatar} size={16} /><span className="nickname">{item.authorName}</span></a>
            <div 
                className={classnames('author-popup', {show: showPopup})}
                onMouseOver={this.handlePopupMouseOver}
                onMouseOut={this.handlePopupMouseOut}
            >
              {(showPopup || this.isPopupLoaded) &&
              <AuthorPopupBox
                compositionId={item.compositionId}
                code={item.authorCode}
                onLoad={this.handlePopupLoad}
              />}
            </div>
          </div>
        </div>
      </div>
    )
  }
}