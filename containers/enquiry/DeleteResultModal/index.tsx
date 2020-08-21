import { Component } from 'react'
import { Modal, Row, Col, Input, message, Button, Spin } from 'antd'
import { toJS } from 'mobx'

import { utils, config } from '@utils'

import './index.less'
import CustomIcon from '@components/widget/common/Icon'


class DeleteResultModal extends Component {

  handleCancel = () => {
    const { onCancel, accountStore } = this.props
    if (onCancel) onCancel()
  }

  handleResend = () => {
    location.href = '/enquiry/new'
  }
  handleComplete = () => {
    location.href = '/enquiry'
  }

  render() {
    const { visible, } = this.props

    return (
      <Modal
        visible={visible}
        style={{ padding: '0 50px' }}
        maskClosable={false}
        onCancel={this.handleComplete}
        footer={null}
      >
        <div className="enquiry-confirm-modal-wrapper enquiry-delete-modal">
            <div className="title">删除询价</div>
            <div className="content">
              <div className="result-info">
                <CustomIcon name="check-circle" /><span>询价删除成功！</span>
              </div>
            </div>
            <div className="footer">
              {/* <Button onClick={this.handleResend}>再发一条</Button> */}
              <Button onClick={this.handleComplete}>关闭</Button>
            </div>
          </div>
      </Modal>
    )
  }
}

export default DeleteResultModal