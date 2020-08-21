import React, { Component } from 'react'
import { Avatar, Tooltip, Tag } from 'antd'
import { utils } from '@utils/'
import { AuthorType, EditionType } from '@base/enums'
import { toJS } from 'mobx'
import classnames from 'classnames'

import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import AuthorPopupBox from '@containers/author/AuthorPopupBox'

export interface Props {
  avatar: string
  title: string
  type: number
  signature: string
  followed: boolean
  onFollow: Function
}

export default class AuthorItemSmall extends Component<Props> {
  isInPopup = false
  isPopupLoaded =false

  state = {
      showPopup: false,
  }

  handleAvatarMouseEnter = e => {
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
    const {
      item,
      avatar,
      title,
      type,
      signature,
      authorCode,
      followed,
      onFollow,
    } = this.props
    const { showPopup } = this.state

    // const strLength = utils.getStringLength(title || '') 
    const nextAction = followed ? 0 : 1 
    const editionType = item.editionType || EditionType.FREE

    // console.log('author recommended', toJS(item))
  
    return (
      <li>
          <div className='left mode-lbox'>
            <a 
              href={`/author/${authorCode}`} 
              target='blank'
              onMouseEnter={this.handleAvatarMouseEnter}
              onMouseLeave={this.handleAvatarMouseLeave}
            >
              {/* <Avatar icon='user' src={avatar} size={40} /> */}
              <AvatarComponent 
                  src={item.avatar}
                  name={item.authorName}
                  className={'author-img'} 
              />
            </a>
          </div>
          <div className='mode-rbox'>
              <h4>
                <span className='title'>
                    <a 
                      href={`/author/${authorCode}`} 
                      target='blank'
                      onMouseEnter={this.handleAvatarMouseEnter}
                      onMouseLeave={this.handleAvatarMouseLeave}
                    >{title}</a><AuthorAuthenticationIcon hide={editionType === EditionType.FREE} style={{marginLeft: '6px'}} />
                </span>
                <a className='follow' onClick={e => onFollow(nextAction)}>{followed ? '已关注' : '+ 关注'}</a>
                </h4>
              <div className='footer-bar'>
                  <UserIdentityComp currentType={type} editionType={editionType} />
                  {/* <AuthorEditionTag editionType={editionType} style={{marginLeft: '6px'}} /> */}
                  <a>{signature || ''}</a>
              </div>
          </div>
          <div 
              className={classnames('author-popup', {show: showPopup})}
              onMouseOver={this.handlePopupMouseOver}
              onMouseOut={this.handlePopupMouseOut}
          >
              {(showPopup || this.isPopupLoaded) &&
              <AuthorPopupBox
                  code={authorCode}
                  authorInfo={item}
                  onLoad={this.handlePopupLoad}
                  onFollow={onFollow}
              />}
          </div>
      </li>
    )
  }
}