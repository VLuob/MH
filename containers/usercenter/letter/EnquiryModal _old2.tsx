import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Modal, Form, Input, InputNumber, Select, message  } from 'antd'
import Animate from 'rc-animate'

import './EnquiryModal.less'

import { LetterSendType } from '@base/enums'

const TextArea = Input.TextArea
const SelectOption = Select.Option

const Div = (props) => {
  const childrenProps = { ...props };
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

@inject((stores: any) => {
  const { accountStore, letterStore, compositionStore } = stores.store
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore
  const { categories, forms } = compositionStore

  return {
    accountStore,
    letterStore,
    compositionStore,

    currentUser,
    enquiryUi,
    enquiryData,
    categories,
    forms,
  }
})
@observer
@Form.create()
class EnquiryModal extends Component {
  state = {
    currentStep: 1,
  }

  componentDidMount() {
    this.requestClassifications()
  }

  requestClassifications() {
    const { compositionStore, categories, forms } = this.props
    if (categories.length === 0 || forms.length === 0) {
      compositionStore.fetchClassifications({})
    }
  }

  handlePrev = () => {
    this.setState({currentStep: this.state.currentStep - 1})
  }

  handleNext = () => {
    this.setState({currentStep: this.state.currentStep + 1})
  }

  handleVerifyNext = () => {
    const { form } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      console.log(fieldsValue)
      if (err) return
      this.handleNext()
    })
  }

  validatorIntro = (_, value, callback) => {
    const fields = this.props.form.getFieldsValue(['categoryId','formId','description'])
    if (!fields.categoryId && !fields.formId && !fields.description) {
      let errText = ''
      if (_.field === 'categoryId') {
        // errText = '请选择品类'
      } else if (_.field === 'formId') {
        // errText = '请选择品类'
      } else {
        errText = '请选择品类、形式或填写您的需求'
      }
      callback(errText)
    } else {
      callback()
    }
  }

  handleCategorySelect = (e) => {
    const { form } = this.props
    form.validateFields(['formId','description'], {force: true})
  }
  
  handleFormSelect = (e) => {
    const { form } = this.props
    form.validateFields(['categoryId','description'], {force: true})
  }

  handleDescChange = (e) => {
    const { form } = this.props
    setTimeout(() => {
      form.validateFields(['categoryId','formId'], {force: true})
    }, 100)
  }

  handleSubmit = () => {
    const { form } = this.props
    form.validateFieldsAndScroll((err, values) => {
      if (err) return

      this.handleSend(values)
    })
  }

  handleSend = async ({service, categoryId, formId, description, target, ...fields}: any) => {
    const { letterStore, enquiryData, form } = this.props
    const param = {
      ...fields,
      content: JSON.stringify({ service,categoryId,formId,description,target }),
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
      this.setState({currentStep: 1})
      form.resetFields()
    }
  }

  handleCancel = (e) => {
    const { letterStore } = this.props
    letterStore.closeEnquiry()
  }

  render() {
    const { currentStep } = this.state
    const { enquiryUi, currentUser, form, categories, forms } = this.props
    const { getFieldDecorator } = form
    const user = currentUser || {}

    const isFirstStep = currentStep === 1
    const isSecondStep = currentStep === 2

    return (
      <Modal
        className="enquiry-modal"
        title="询价"
        visible={enquiryUi.visible}
        onCancel={this.handleCancel}
        width={600}
        footer={null}
      >
        <Form>
          <Animate
            showProp="show"
            transitionAppear
            transitionName="fade"
          >
            <Div key={'firstStep'} className="enquiry-form-container" show={isFirstStep} style={{display: isFirstStep ? '' : 'none'}}>
              <Form.Item label="我想为">
                {getFieldDecorator('service', {
                  rules: [{required: true, message: '品牌/产品/服务'}],
                })(<Input placeholder="品牌/产品/服务" />)}
              </Form.Item>
              <Form.Item label={<span><span style={{color: '#ff0000'}}>*</span> 寻找能做</span>}>
                <div className="enquiry-category-wrap">
                  <div className="enquiry-category-item">
                    {getFieldDecorator('categoryId', {
                      rules: [{
                        // required: true, message: '请选择品类'，
                        validator: this.validatorIntro,
                      }],
                    })(<Select placeholder="创意品类" onSelect={this.handleCategorySelect}>
                      {categories.map(item => (<SelectOption key={item.id} value={item.id}>{item.name}</SelectOption>))}
                    </Select>)}
                  </div>
                  <div className="enquiry-category-item">
                    {getFieldDecorator('formId', {
                      rules: [{
                        // required: true, message: '请选择形式'，
                        validator: this.validatorIntro,
                      }],
                    })(<Select placeholder="创意形式" onSelect={this.handleFormSelect}>
                    {forms.map(item => (<SelectOption key={item.id} value={item.id}>{item.name}</SelectOption>))}
                  </Select>)}
                  </div>
                  <div className="enquiry-category-item text-label">
                    <span>服务商</span>
                  </div>
                </div>
              </Form.Item>
              <Form.Item label="或">
                {getFieldDecorator('description', {
                  rules: [{
                    // required: true, message: '请简单描述您需要的服务内容！',
                    validator: this.validatorIntro,
                  }],
                })(<Input placeholder="更详细描述您的需求" onChange={this.handleDescChange} />)}
              </Form.Item>
              <Form.Item label="我期望达成的目标">
                {getFieldDecorator('target', {
                  rules: [{
                    // required: true, message: '请简单描述您需要的服务内容！',
                  }],
                })(<TextArea placeholder="描述清楚您想要的目标，有利于服务商更好的提供产品服务" />)}
              </Form.Item>
              <Form.Item label="我为此服务能提供的大概预算是">
                {getFieldDecorator('budget', {
                  // rules: [{
                  //   // required: true, message: '请简单描述您需要的服务内容！'
                  // }],
                })(<Input placeholder="￥" />)}
              </Form.Item>
            </Div>
            <Div key={'secondStep'}  className="enquiry-form-container" show={isSecondStep} style={{display: isSecondStep ? '' : 'none'}}>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                  <Form.Item label="姓名">
                    {getFieldDecorator('realName', {
                      rules: [{required: isSecondStep, message: '请输入您的姓名'}],
                      initialValue: user.realName
                    })(<Input placeholder="请输入您的姓名" />)}
                  </Form.Item>
                </div>
                <div className="enquiry-form-item">
                  <Form.Item label="手机">
                    {getFieldDecorator('phone', {
                      rules: [{required: isSecondStep, message: '请输入您的手机'}],
                      initialValue: user.mobilePhone
                    })(<Input placeholder="请输入您的手机" />)}
                  </Form.Item>
                </div>
              </div>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                <Form.Item label="邮箱">
                  {getFieldDecorator('email', {
                    rules: [{required: isSecondStep, message: '请输入您的邮箱'}],
                    initialValue: user.email
                  })(<Input placeholder="请输入您的邮箱" />)}
                </Form.Item>
                </div>
                <div className="enquiry-form-item">
                <Form.Item label="微信">
                  {getFieldDecorator('wx', {
                    // rules: [{required: true, message: '请输入您的微信'}],
                    initialValue: user.weiXin
                  })(<Input placeholder="请输入您的微信" />)}
                </Form.Item>
                </div>
              </div>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                <Form.Item label="公司">
                  {getFieldDecorator('company', {
                    // rules: [{required: true, message: '请输入您的公司'}],
                    initialValue: user.company
                  })(<Input placeholder="请输入您的公司" />)}
                </Form.Item>
                </div>
                <div className="enquiry-form-item">
                <Form.Item label="职位">
                  {getFieldDecorator('job', {
                    // rules: [{required: true, message: '请输入您的职位'}],
                    initialValue: user.jobTitle
                  })(<Input placeholder="请输入您的职位" />)}
                </Form.Item>
                </div>
              </div>
            </Div>
          </Animate>
            <Form.Item>
              <div className="form-bottom">
                {isFirstStep && <Button className="themes" onClick={this.handleVerifyNext}>下一步</Button>}
                {isSecondStep && <Button onClick={this.handlePrev}>上一步</Button>}
                {/* <Button onClick={this.handleCancel}>取消</Button> */}
                {isSecondStep && <Button className="themes" onClick={this.handleSubmit} loading={enquiryUi.loading}>发送</Button>}
              </div>
            </Form.Item>
        </Form>
  
      </Modal>
    )
  }
} 

export default EnquiryModal