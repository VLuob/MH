import React, { Component } from 'react'
import jsCookie from 'js-cookie'
import { Modal, Button, Form, Radio, Input, message } from 'antd'

import { config } from '@utils'

import './currentFavoritesModal.less'

const TextArea = Input.TextArea

@Form.create()
class EditFavoritesModal extends Component {
  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.values !== prevState.values) {
      const values = nextProps.values || {}
      return {
        values,
        formVals: {
          id: values.id,
          name: values.name,
          description: values.description,
          published: values.published,
        }
      }
    }
    return null
  }

  constructor(props) {
    super(props)
    const values = props.values || {}

    this.state = {
      values,
      formVals: {
        id: values.id,
        name: values.name,
        description: values.description,
        published: values.published,
      }
    }
  }


  handleSubmit = () => {
    const { form, onSubmit } = this.props
    const { formVals: oldValue } = this.state
    form.validateFields((err, fieldsValue) => {
      if (err) return

      const formVals = { ...oldValue, ...fieldsValue }
      this.setState({ formVals }, () => {
        if (onSubmit) {
          onSubmit(formVals)
        }
      })
    })
  }

  render() {
    const { visible, onClose, form } = this.props
    const { formVals } = this.state
    const { getFieldDecorator } = form

    return (
      <Modal
        width={405}
        visible={visible}
        title={`${formVals.id ? '修改' : '创建'}收藏夹`}
        onCancel={onClose}
        footer={null}
      >
        <div className="edit-favorites-form">
          <Form.Item>
            {getFieldDecorator('name', {
              rules: [{
                required: true,
                message: '请填写文件夹名称'
              }],
              initialValue: formVals.name
            })(<Input placeholder="收藏夹名称（必填）" />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('description', {
              rules: [],
              initialValue: formVals.description,
            })(<TextArea placeholder="收藏夹描述" rows={4} />)}
          </Form.Item>
          <Form.Item>
            {getFieldDecorator('published', {
              rules: [],
              initialValue: formVals.published || false,
            })(
              <Radio.Group>
                <Radio value={true}>
                  公开 <span className="ingore">(所有人可见)</span>
                </Radio>
                <Radio value={false}>
                  私密 <span className="ingore">(仅自己可见)</span>
                </Radio>
              </Radio.Group>
            )}
          </Form.Item>
          <div className="form-field-submit">
            <Button onClick={onClose}>取消</Button>
            {' '}
            <Button type="primary" onClick={this.handleSubmit}>确认</Button>
          </div>
        </div>
      </Modal>
    )
  }
}

export default EditFavoritesModal
