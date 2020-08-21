import { PureComponent } from 'react'
import { toJS } from 'mobx'
import moment from 'moment'
import { Avatar, Icon, Dropdown, Menu } from 'antd'

import { LetterSources, LetterStatus } from '@base/enums'

const noticeAvatar = '/static/images/common/notice_avatar.svg'

export default class LetterItem extends PureComponent {

  handleMenuClick = (e) => {
    const { onDelete, onShield, onAccusation, item } = this.props
    switch(e.key) {
      case 'delete':
        if (onDelete) onDelete(item.id)
        break;
      case 'shield':
        if (onShield) onShield(item)
        break;
      case 'accusation':
        if (onAccusation) onAccusation(item)
        break;
    }
  }

  handleOpenChat = () => {
    const { item, onChat } = this.props
    if (onChat) onChat(item)
  }

  render() {
    const { item, subComment, onSubmit, ...props } = this.props

    const isSystemSource = item.source === LetterSources.SYSTEM_NOTICE
    const isSender = item.sender
    const nickName = !isSender ? (item.senderNickName || item.senderName) : (item.receiverNickName || item.receiverName)
    const avatar = !isSender ? item.senderAvatar : item.receiverAvatar
    const showNoRead = !item.read && !isSender && item.status === LetterStatus.SENT

    const menu = (
      <Menu onClick={this.handleMenuClick}>
        <Menu.Item key="delete">
          <a rel="删除对话" >
            删除对话
          </a>
        </Menu.Item>
        {!isSystemSource && 
        <Menu.Item key="shield">
          <a rel="屏蔽TA" >
            屏蔽TA
          </a>
        </Menu.Item>}
        {!isSystemSource && 
        <Menu.Item key="accusation">
          <a rel="举报" >
            举报
          </a>
        </Menu.Item>}
      </Menu>
    )

    return (
      <li className="comment-item">
        <div className="comment-avatar">
          <Avatar icon="user" size={50} src={avatar || (isSystemSource ? noticeAvatar : '')} />
        </div>
        
        <div className="comment-content-wrapper">
          <div className="comment-content">
            <div className="comment-info-wrap">
              <span className="author-info">
                <span className="nick">
                  {nickName}
                </span>
                {/* {!isSystemSource && !isSender && <span> 给您的询价信息</span>} */}
                <span className="dot">·</span>
                <span className="time">
                  {moment(item.gmtModified).format('YYYY-MM-DD HH:mm')}
                </span>
              </span>
              {
              <span className="comment-actions">
                <Dropdown overlay={menu} placement="bottomRight">
                  <span className="action warning">
                    {/* <Icon type="warning" theme="filled" /> */}
                    <Icon type="more" />
                  </span>
                </Dropdown>
                <a className="action btn-reply" onClick={this.handleOpenChat} >
                  查看询价
                </a>
              </span>}
            </div>
            <div className="comment-message">
              <span className="reply-author-intro" style={{marginLeft: '0'}}>
                {showNoRead && <span style={{color: 'red'}}>[未读]</span>} {item.content}
              </span>
            </div>
          </div>

        </div>

      </li>
    )
  }
}