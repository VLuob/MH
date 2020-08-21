import { PureComponent } from 'react'
import { toJS } from 'mobx'
import { Avatar, Icon } from 'antd'
import CommentForm from '@components/comment/CommentForm'
import CommentContent from './CommentContent'

export default class CommentItem extends PureComponent {

  render() {
    const { item, subComment, onSubmit, onReplies, ...props } = this.props
    const replies = subComment.list || []
    // console.log(toJS(subComment))
    const isReplyLoaded = !!subComment.isLoaded
    // const showReplies = isReplyLoaded && replies.length > 0 
    // const replies = subComment || []
    const showReplies = replies.length > 0 
    const showQuantity = !!item.subCommentQuantity
    const showReplyBox = !showReplies && showQuantity

    
    return (
      <li className="comment-item">
        <div className="comment-avatar">
          <Avatar icon="user" size={50} src={item.avatar} />
        </div>
        
        <div className="comment-content-wrapper">
          <CommentContent
            {...props}
            item={item}
            onSubmit={(content, callback) => onSubmit({
              content, 
              parentId: item.id, 
              replyId: item.id, 
              compositionId: item.relationId, 
              callback,
            })}
          />
          {showQuantity && !showReplies &&
          <div className="comment-reply-box">
            <a onClick={e => onReplies(item.id)}>共{item.subCommentQuantity || 0}条回复>></a>
          </div>}
          {showReplies && 
            <div className="comment-reply-box">
              
                {replies.map((replyItem, index) => {
                  return (
                    <CommentContent
                      key={index}
                      {...props}
                      item={replyItem}
                      onSubmit={(content, callback) => onSubmit({
                        content, 
                        parentId: item.id, 
                        replyId: replyItem.id, 
                        callback,
                      })}
                    />
                  )
                })}
            </div>}
        </div>

      </li>
    )
  }
}