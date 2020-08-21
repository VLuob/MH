import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Modal, Form, Input, message  } from 'antd'

import './EnquiryModal.less'

import { LetterSendType } from '@base/enums'

const TextArea = Input.TextArea


@inject((stores: any) => {
  const { accountStore, letterStore } = stores.store
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore

  return {
    accountStore,
    currentUser,

    letterStore,
    enquiryUi,
    enquiryData,
  }
})
@observer
@Form.create()
class EnquiryModal extends Component {

  handleSubmit = () => {
    const { form } = this.props
    form.validateFieldsAndScroll((err, values) => {
      if (err) return

      this.handleSend(values)
    })
  }

  handleSend = async (fields: any) => {
    const { letterStore, enquiryData, form } = this.props
    const param = {
      ...fields,
      type: enquiryData.type || LetterSendType.SEND,
      receiverType: enquiryData.receiverType,
      receiverId: enquiryData.receiverId,
      senderId: enquiryData.senderId,
      senderType: enquiryData.senderType,
      source: enquiryData.source,
      parentId: enquiryData.parentId,
    }
    const response = await letterStore.sendEnquiry(param)
    if (response.success) {
      form.resetFields()
    }
  }

  handleCancel = (e) => {
    const { letterStore } = this.props
    letterStore.closeEnquiry()
  }

  render() {
    const { enquiryUi, currentUser, form } = this.props
    const { getFieldDecorator } = form
    const user = currentUser || {}

    return (
      <Modal
        className="enquiry-modal"
        title="询价"
        visible={enquiryUi.visible}
        onCancel={this.handleCancel}
        width={550}
        footer={null}
      >
        <Form>
          <Form.Item label="需求描述">
            {getFieldDecorator('content', {
              rules: [{required: true, message: '请简单描述您需要的服务内容！'}],
            })(<TextArea placeholder="请简单描述您需要的服务内容！" />)}
          </Form.Item>
          <Form.Item label="姓名">
            {getFieldDecorator('realName', {
              rules: [{required: true, message: '请输入您的姓名'}],
              initialValue: user.realName
            })(<Input placeholder="请输入您的姓名" />)}
          </Form.Item>
          <Form.Item label="手机号码">
            {getFieldDecorator('phone', {
              rules: [{required: true, message: '请输入您的手机号码'}],
              initialValue: user.mobilePhone
            })(<Input placeholder="请输入您的手机号码" />)}
          </Form.Item>
          <Form.Item label="邮箱">
            {getFieldDecorator('email', {
              rules: [{required: true, message: '请输入您的邮箱'}],
              initialValue: user.email
            })(<Input placeholder="请输入您的邮箱" />)}
          </Form.Item>
          <Form.Item label="公司">
            {getFieldDecorator('company', {
              rules: [{required: true, message: '请输入您的公司'}],
              initialValue: user.company
            })(<Input placeholder="请输入您的公司" />)}
          </Form.Item>
          <Form.Item label="职位">
            {getFieldDecorator('job', {
              rules: [{required: true, message: '请输入您的职位'}],
              initialValue: user.jobTitle
            })(<Input placeholder="请输入您的职位" />)}
          </Form.Item>
          <Form.Item>
            <div className="form-bottom">
              <Button onClick={this.handleCancel}>取消</Button>
              <Button className="themes" onClick={this.handleSubmit} loading={enquiryUi.loading}>发送</Button>
            </div>
          </Form.Item>
        </Form>
  
      </Modal>
    )
  }
} 

export default EnquiryModal