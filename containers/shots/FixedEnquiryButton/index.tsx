import { useState, useEffect } from 'react'

import { Popover, Button, Avatar } from 'antd'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import CIcon from '@components/widget/common/Icon'

import './index.less'

const FixedEnquiryButton = (props) => {
  const { onEnquiry, authorName, authorCode, authorType, editionType, authorAvatar, visible, onVisible } = props
  const [show, setShow] = useState(false)

  useEffect(() => {
    setShow(visible)
  }, [visible])

  const handleEnquiry = () => {
    if (onEnquiry) onEnquiry()
  }

  const onClick = () => {
    setShow((v) => {
      if (onVisible) onVisible(!v)
      return !v
    })
  }
  const onClose = () => {
    setShow(false)
    if (onVisible) onVisible(false)
  }

  return (
    <div className='fixed-action-button'>
      <Popover
        getPopupContainer={() => document.querySelector('#fixed-enquiry-action-button')}
        visible={show}
        content={
          <div className="fixed-enquiry-box">
            <div className="author-info-box">
              <div className="avatar"><a href={`/author/${authorCode}`} target="_blank"><Avatar size={40} src={authorAvatar} /></a></div>
              <div className="info">
                <div className="nick"><a href={`/author/${authorCode}`} target="_blank">{authorName}</a></div>
                <div className="intro"><UserIdentityComp currentType={authorType} editionType={editionType} /></div>
              </div>
            </div>
            <div className="fixed-enquiry-desc">有相关业务需求？点此询价吧！</div>
            <div className="fixed-enquiry-btn">
              <Button type="primary" onClick={handleEnquiry}>询价</Button>
            </div>
            <div className="btn-close" onClick={onClose}>×</div>
          </div>
        }
        placement="left"
        trigger="click"
      >
        <a>
          <span className="fixed-action-icon" id="fixed-enquiry-action-button" onClick={onClick}>
            <CIcon name="enquiry" />
          </span>
        </a>
      </Popover>
    </div>
  )
}

export default FixedEnquiryButton