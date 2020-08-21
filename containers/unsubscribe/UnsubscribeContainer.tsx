import { PureComponent } from 'react'
import { Icon, Button, Input, Form, Checkbox, message } from 'antd'

import { Router } from '@routes'
import { unsubscribeApi } from '@api'

const FormItem = Form.Item
const CheckboxGroup = Checkbox.Group

const options = [
  { label: '不需要此类信息', value: 0 },
  { label: '发送的频率太高', value: 1 },
  { label: '已关注微信微博', value: 2 },
  { label: '内容不够精彩', value: 3 },
];

export interface Props {
  query: object
}

@Form.create()
export default class UnsubscribeContainer extends PureComponent<Props> {
  constructor(props) {
    super(props)
    this.state = {
      loading: false
    }
    this.submitUnsubscribe = this.submitUnsubscribe.bind(this)
  }
  handleUnsubscribe = () => {
    const { query } = this.props
    const email = query.email
    if (email === '') {
      message.error('无退订邮箱')
      return
    }
    this.submitUnsubscribe()
  }

  async submitUnsubscribe() {
    const { form, query } = this.props
    const email = query.email
    const type = query.type
    const scope = query.scope || undefined
    const fields = form.getFieldsValue()
    const reason = fields.reason ? fields.reason.join(',') : ''
    const remark = fields.remark
    this.setState({loading: true})
    const response = await unsubscribeApi.unsubscribe({
      type,
      email,
      reason,
      remark,
      scope,
    });
    this.setState({loading: false})
    if (response.success) {
      Router.pushRoute('/unSubscribeSus')
    } else {

    }
  }

  render() {
    const { 
      query, 
      form: { getFieldDecorator }, 
    } = this.props
    const { loading } = this.state
    const email = query.email

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 5 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 15 },
        md: { span: 15 },
      },
    };

    const submitFormLayout = {
      wrapperCol: {
        xs: { span: 24, offset: 0 },
        sm: { span: 10, offset: 5 },
      },
    };

    return (
      <div className="display-container">
          <div className="display-content">
            <div className="unsubscribe-form">
              <FormItem {...formItemLayout} label="退订邮箱">
                {email}
              </FormItem>
              <FormItem {...formItemLayout} label="退订原因">
                {getFieldDecorator('reason', {
                  rules: [],
                })(<CheckboxGroup options={options} />)}
              </FormItem>
              <FormItem {...formItemLayout} label="退订原因">
                {getFieldDecorator('remark', {
                  rules: [],
                })(<Input placeholder="其他原因请详述" />)}
              </FormItem>
              <FormItem {...submitFormLayout}>
                <div>
                  <p>你确认要退订该内容吗？</p>
                  <p><Button type="primary" className="themes" loading={loading} onClick={this.handleUnsubscribe} >确认退订</Button></p>
                </div>
              </FormItem>
            </div>
          </div>
      </div>
    )
  }
}