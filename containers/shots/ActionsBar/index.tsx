import { Component, createRef } from 'react'
import classnames from 'classnames'
import { Input } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'
import CommentInput from '../DetailBottomActionBar/CommentInput'

import './index.less'

class ActionsBar extends Component {

  barRef = createRef(null)

  render() {
    const { 
      isLogin,
      detail={},
      commentType,
      cardType,
      sharePlacement,
      favors,
      collections,
      comments,
      favored, 
      collected, 
      onFavor, 
      onCollection,
      renderAuthor,
    } = this.props

    const currentUrl = typeof window === 'undefined' ? '' : location.href

    return (
      <div className="detail-actions-bar" ref={this.barRef}>
        <div className="action-item action-item-comment">
          {renderAuthor || <div className="comment-input-wrapper">
            <CommentInput 
              inputType="search"
              compositionId={detail.compositionId}
              type={commentType}
              placeholder={!isLogin ? ' ' : '来说两句吧…'}
              inputProps={{
                enterButton: '发表评论',
                // disabled: !isLogin,
              }}
            />
            {/* {!isLogin && <div className="login-tip">
              <a href={`/signin?c=${encodeURIComponent(currentUrl)}`}>登录</a> 后可发表评论
            </div>} */}
          </div>}
        </div>
        <div className="action-item">
          <div 
            className={classnames('action-btn favor', {action: favored})}
            onClick={onFavor}
          >
            <CustomIcon name="heart" /><span className="text">喜欢 {favors || 0}</span>
          </div>
        </div>
        <div className="action-item">
          <div
            className={classnames('action-btn collection', {action: collected})}
            onClick={onCollection}
          >
            <CustomIcon name="star" /><span className="text">收藏 {collections || 0}</span>
          </div>
        </div>
        <div className="action-item">
          <a className="action-btn" href="#comment"><CustomIcon name="comment-o" /><span className="text">评论 {comments}</span></a>
        </div>
        <div className="action-item">
          <ShareDropPanel
            getPopupContainer={() => this.barRef.current}
            cardType={cardType || 'compositionDetail'}
            cardName={detail.compositionId}
            cardTitle={detail.title}
            cardItem={detail}
            cover={detail.cover}
            title={detail.title}
            placement={sharePlacement || 'bottomRight'}
          >
            <div className="action-btn">
              <CustomIcon name="share" /><span className="text">分享</span>
            </div>
          </ShareDropPanel>
        </div>
      </div>
    )
  }
}

export default ActionsBar