import { Component } from 'react'
import classnames from 'classnames'
import { Button } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import ShareDropPanel from '@containers/common/ShareDropPanel'

import './index.less'

class DetailBottomActionBar extends Component {

  render() {
    const { 
      title,
      cover,
      onShowContact,
    } = this.props

    return (
      <div className="mb-enquiry-bottom-action-bar" id="component-detail-bottom-action-bar">
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
          <div className="action-btn" onClick={onShowContact}>查看联系人信息</div>
        </div>
      </div>
    )
  }
}

export default DetailBottomActionBar