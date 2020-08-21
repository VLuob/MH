import { Component } from 'react'
import classnames from 'classnames'
import { Input } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'
import CommentInput from './CommentInput'

import './index.less'

class DetailBottomActionBar extends Component {

  render() {
    const { 
      detail,
      commentType,
      cardType,
      favored, 
      collected, 
      onFavor, 
      onCollection,
    } = this.props

    return (
      <div className="mb-composition-bottom-action-bar" id="component-detail-bottom-action-bar">
        <div className="action-item action-item-comment">
          <div className="comment-input-wrapper">
            <CommentInput 
              compositionId={detail.compositionId}
              type={commentType}
            />
          </div>
        </div>
        <div className="action-item">
          <div 
            className={classnames('action-btn favor', {action: favored})}
            onClick={onFavor}
          >
            <CustomIcon name="heart" />
          </div>
        </div>
        <div className="action-item">
          <div
            className={classnames('action-btn collection', {action: collected})}
            onClick={onCollection}
          >
            <CustomIcon name="star" />
          </div>
        </div>
        <div className="action-item">
          <div className="action-btn">
            <a href="#comment"><CustomIcon name="message" /></a>
          </div>
        </div>
        <div className="action-item">
          <ShareDropPanel
            getPopupContainer={() => document.querySelector('#component-detail-bottom-action-bar')}
            cardType={cardType || 'compositionDetail'}
            cardName={detail.compositionId}
            cardTitle={detail.title}
            cardItem={detail}
            cover={detail.cover}
            title={detail.title}
            exclude={['card','weibo','wechat']}
          >
            <div className="action-btn">
              <CustomIcon name="share" />
            </div>
          </ShareDropPanel>
        </div>
      </div>
    )
  }
}

export default DetailBottomActionBar