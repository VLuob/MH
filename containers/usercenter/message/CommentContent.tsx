import { PureComponent } from 'react'

import { Icon } from 'antd'
import moment from 'moment'
import CommentForm from '@components/comment/CommentForm'
import { utils } from '@utils'
import { CommentTypes } from '@base/enums'

const commentTypeLabelMap = {
  [CommentTypes.ARTICLE]: '文章',
  [CommentTypes.SHOTS]: '作品',
  [CommentTypes.TOPIC]: '专题',
}

const commentTypeKeyMap = {
  [CommentTypes.ARTICLE]: 'article',
  [CommentTypes.SHOTS]: 'shots',
  [CommentTypes.TOPIC]: 'topics',
}

export default class CommentContent extends PureComponent {

  render() {
    const { 
      isLogin,
      item, 
      compositionTitle,
      showCommentInputId, 
      onToggleInput, 
      currAuthorId, 
      hideActions,
      noShowInput,
      onDelete,
      onSubmit,
    } = this.props


    // const isCurrentAuthor = currAuthorId === String(item.authorId)
    const isCurrentAuthor = currAuthorId === item.userId
    const showInput = !noShowInput && showCommentInputId === item.id
    const commentLabel = !item.parentId ? '评论' : '回复'
    const compositionLaterLabel = !item.parentId ? '' : '中的评论'
    // const compositionTypeLabel = item.type === 2 ? '作品' : '文章'
    const compositionTypeLabel = commentTypeLabelMap[item.compositionType]
    // const compositionPath = item.type === 2 ? `/shots/${item.relationId}` : `/article/${item.relationId}`
    const compositionPath = `/${commentTypeKeyMap[item.compositionType]}/${item.relationId}`
    // const isSelfNick = item.replyAuthorNickname === '您'
    const compositionAuthorLabel = item.compositionType === CommentTypes.TOPIC ? item.replyAuthorNickname : <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorNickname}</a>

    return (
        <div className="comment-content">
          <div className="comment-info-wrap">
            <span className="author-info">
              <span className="nick">
                {item.nickname}
              </span>
              <span className="reply-author-intro">
                {commentLabel}了 {compositionAuthorLabel} {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle || compositionTitle}》</a> {compositionLaterLabel}
              </span>
              <span className="dot">·</span>
              <span className="time">
                {moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}
              </span>
            </span>
            {!hideActions && 
            <span className="comment-actions">
              {isCurrentAuthor && <span className="action" onClick={e => onDelete(item.id, item.relationId)}>删除</span>}
              <span className="action btn-reply" onClick={e => onToggleInput(item.id)}>
                回复
              </span>
            </span>}
          </div>
          <div className="comment-message">
            {item.content}
          </div>
          {showInput &&
            <CommentForm
              isLogin={isLogin}
              placeholder=""
              btnText="回复评论"
              onSubmit={onSubmit}
            />}
        </div>
    )
  }
}