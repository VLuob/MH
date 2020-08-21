import { PureComponent } from 'react'
import { toJS } from 'mobx'
import moment from 'moment'
import { Avatar, Icon } from 'antd'

import { MessageType } from '@base/enums'

export default class MessageItem extends PureComponent {

  render() {
    const { item, subComment, onSubmit, ...props } = this.props
    const isFollowType = item.type === MessageType.FOLLOW

    const compositionTypeLabel = item.compositionType === 2 ? '作品' : '文章'
    const compositionPath = item.compositionType === 2 ? `/shots/${item.compositionId}` : `/article/${item.compositionId}`
    // const isSelfNick = item.compositionAuthorName === '您'
    let messateTypeLabel = ''
    let messateIntro
    switch (item.type) {
      case MessageType.FAVOR:
        messateTypeLabel = '喜欢'
        messateIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a> {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle}》</a></span>
        break
      case MessageType.COLLECTION:
        messateTypeLabel = '收藏'
        messateIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a> {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle}》</a></span>
        break
      case MessageType.FOLLOW:
        messateTypeLabel = '关注'
        messateIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a></span>
        break
    }

    return (
      <li className="comment-item">
        <div className="comment-avatar">
          <Avatar icon="user" size={50} src={item.avatar} />
        </div>
        
        <div className="comment-content-wrapper">
          <div className="comment-content">
            <div className="comment-info-wrap">
              <span className="author-info">
                <span className="nick">
                  {item.nickname}
                </span>
                
                <span className="dot">·</span>
                <span className="time">
                  {moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}
                </span>
              </span>
              {
              <span className="comment-actions">
                {/* {isFollowType &&
                <a className="action btn-reply" href={`/author/${item.compositionAuthorId}`} target="_blank" >
                  查看粉丝
                </a>} */}
              </span>}
            </div>
            <div className="comment-message">
              <span className="reply-author-intro" style={{marginLeft: '0'}}>
                {messateIntro}
              </span>
            </div>
          </div>

        </div>

      </li>
    )
  }
}