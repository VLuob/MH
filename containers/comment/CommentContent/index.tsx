import { PureComponent } from 'react'
import classnames from 'classnames'
import { Icon } from 'antd'
import CommentForm from '@components/comment/CommentForm'
import { CommentSourceType, CommentStatus } from '@base/enums'
import { utils } from '@utils'

import './index.less'

export default class CommentContent extends PureComponent {

  render() {
    const { 
      item, 
      showCommentInputId, 
      onToggleInput, 
      currAuthorId, 
      onDelete,
      onSubmit,
      onFavor,
      isLogin,
    } = this.props

    const showInput = showCommentInputId === item.id
    // const isCurrentAuthor = currAuthorId === String(item.authorId)
    const isCurrentAuthor = currAuthorId === item.userId
    const nextFavorStatus = item.favored ? 0 : 1
    const isAuditingStatus = item.status === CommentStatus.AUDITING

    return (
        <div className="comment-content">
          <div className="comment-info-wrap">
            <span className="author-info">
              <span className="nick">
                {item.nickname}
              </span>
              {item.replyAuthorNickname &&
              <span className="reply-author-nick">
                回复 {item.replyAuthorNickname}
              </span>}
              <span className="dot">·</span>
              <span className="time">
                {utils.timeago(item.gmtCreate)}
              </span>
              {isAuditingStatus && <span className="auditing">
                评论审核中
              </span>}
            </span>
            {!isAuditingStatus && <span className="comment-actions">
              {isCurrentAuthor && <span className="action" onClick={e => onDelete(item.id)}>删除</span>}
              <span className="action" onClick={e => onToggleInput(item.id)}>
                <Icon type="message" theme="filled" />
              </span>
              <span className={classnames('action favor', {active: item.favored})} onClick={e => onFavor(item.id, nextFavorStatus, item.favored)}>
                <Icon type="heart" theme="filled" />
              </span>
              <span className="favor-count">{item.favorQuantity || 0}</span>
            </span>}
          </div>
          <div className="comment-message">
            {item.content}
          </div>
          {showInput &&
            <CommentForm
              placeholder=""
              isLogin={isLogin}
              btnText="回复评论"
              onSubmit={onSubmit}
            />}
        </div>
    )
  }
}