import { Component } from 'react'
import classnames from 'classnames'
import { Input } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'

import './index.less'

class ActionsMobileFullscreen extends Component {

  render() {
    const { 
      detail,
      commentType,
      cardType,
      favored, 
      collected, 
      favors,
      collections,
      comments,
      onFavor, 
      onCollection,
      onComment,
    } = this.props

    return (
      <div className="mb-gallery-fullscreen-actions">
        <div className="action-item">
          <div 
            className={classnames('action-btn favor', {active: favored})}
            onClick={onFavor}
          >
            <CustomIcon name="heart" />
          </div>
          <div className="count">{favors || 0}</div>
        </div>
        <div className="action-item">
          <div
            className={classnames('action-btn collection', {active: collected})}
            onClick={onCollection}
          >
            <CustomIcon name="star" />
          </div>
          <div className="count">{collections || 0}</div>
        </div>
        <div className="action-item">
          <div className="action-btn">
            <a className="btn-comment" onClick={onComment}><CustomIcon name="message" /></a>
          </div>
          <div className="count">{comments || 0}</div>
        </div>
        <div className="action-item" id="mb-gallery-fullscreen-action-share">
          <ShareDropPanel
            getPopupContainer={() => document.querySelector('#mb-gallery-fullscreen-action-share')}
            placement="topRight"
            cardType={cardType || 'compositionDetail'}
            cardName={detail.compositionId}
            cardTitle={detail.title}
            cardItem={detail}
            cover={detail.cover}
            title={detail.title}
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

export default ActionsMobileFullscreen