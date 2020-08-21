import { PureComponent } from 'react'
import { toJS } from 'mobx'
import { Avatar, Icon } from 'antd'
import CommentForm from '@components/comment/CommentForm'
import CommentContent from './CommentContent'

export default class CommentItem extends PureComponent {

  render() {
    const { item, subComment, onSubmit, onReplies, ...props } = this.props
    const replies = subComment || []
    const showReplies = replies.length > 0
    const currParentId = item.parentId || item.id


    return (
      <li className="comment-item">
        <div className="comment-avatar">
          <Avatar icon="user" size={50} src={item.avatar} />
        </div>
        
        <div className="comment-content-wrapper">
          <CommentContent
            {...props}
            item={item}
            onSubmit={content => onSubmit(content, currParentId, item.id, item.relationId, item)}
          />

          {showReplies &&
          <div className="comment-reply-box">
            {replies.map((replyItem, index) => {

              return (
                <CommentContent
                  key={index}
                  {...props}
                  hideActions
                  item={replyItem}
                  onSubmit={content => onSubmit(content, item.id, replyItem.id)}
                />
              )
            })}
          </div>}
        </div>

      </li>
    )
  }
}