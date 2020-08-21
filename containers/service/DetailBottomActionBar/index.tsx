import { Component } from 'react'
import classnames from 'classnames'
import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'

import './index.less'

class DetailBottomActionBar extends Component {

  render() {
    const { 
      title,
      cover,
      onEnquiry,
    } = this.props

    return (
      <div className="mb-service-bottom-action-bar" id="component-detail-bottom-action-bar">
        <div className="action-item">
          <ShareDropPanel
            getPopupContainer={() => document.querySelector('#component-detail-bottom-action-bar')}
            cover={cover}
            title={title}
            exclude={['card']}
          >
            <div className="action-btn">
              <CustomIcon name="share" />
            </div>
          </ShareDropPanel>
        </div>
        <div className="action-item action-item-contact">
          <div className="action-btn" onClick={onEnquiry}>寻个准价</div>
        </div>
      </div>
    )
  }
}

export default DetailBottomActionBar