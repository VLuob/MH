import { Modal, Button, Input, message } from 'antd'
import CustomIcon from '@components/widget/common/Icon'

import './index.less'

const EnquiryContactModal = (props) => {
  const { onVisible, visible, onOnline, contact={}, hideChatBtn } = props
  const copyContactStr = `姓名：${contact.realName}；手机：${contact.phone}；邮箱：${contact.email}；微信：${contact.wx}；职务：${contact.job}；公司：${contact.company}`
  
  const handleCopyContact = (e) => {
    e.target.select();
    document.execCommand("Copy");
    message.success("复制成功!");
  }

  const handleOnlineChat = (e) => {
    if (onOnline) {
      onOnline()
    }
  }

  return (
    <Modal
      visible={visible}
      onCancel={e => onVisible(false)}
      maskClosable={false}
      footer={null}
      width={452}
    >
      <div className="enquiry-confirm-modal-wrapper">
        <div className="title">联系信息</div>
        <div className="content">
          <div className="alert-warning">
            <CustomIcon name="info" /> 联系时请说明是在梅花网看到的，谢谢
            </div>
          <ul className="contact-list">
            <li>
              <span className="label">姓名：</span>
              <span className="value">{contact.realName}</span>
            </li>
            <li>
              <span className="label">电话：</span>
              <span className="value">{contact.phone}</span>
            </li>
            <li>
              <span className="label">邮箱：</span>
              <span className="value">{contact.email}</span>
            </li>
            <li>
              <span className="label">微信：</span>
              <span className="value">{contact.wx}</span>
            </li>
            <li>
              <span className="label">职务：</span>
              <span className="value">{contact.job}</span>
            </li>
            <li>
              <span className="label">公司：</span>
              <span className="value">{contact.company}</span>
            </li>
          </ul>
        </div>
        <div className="footer">
          <Button className="copy-btn">
            <span>复制联系人</span>
            <Input className="copy-input" onClick={handleCopyContact} value={copyContactStr} />
          </Button>
          {!hideChatBtn && <Button type="primary" onClick={handleOnlineChat}>在线联系</Button>}
        </div>
      </div>
    </Modal>
  )
}

export default EnquiryContactModal