import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Button, Modal, Form, Input, InputNumber, Select, message, AutoComplete  } from 'antd'
import Animate from 'rc-animate'

import './EnquiryModal.less'

import { LetterSendType, LetterSenderTypes } from '@base/enums'
import VerifyPhoneModal from './VerifyPhoneModal'

const TextArea = Input.TextArea
const SelectOption = Select.Option

const Div = (props) => {
  const childrenProps = { ...props };
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

@inject((stores: any) => {
  const { accountStore, letterStore, compositionStore, globalStore } = stores.store
  const { referrerSource } = globalStore
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore
  const { categories, forms } = compositionStore

  return {
    accountStore,
    letterStore,
    compositionStore,
    
    referrerSource,
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

    budgets: ['0-20000元','20000-50000元','50000-200000元','200000-500000元','500000元以上','按质议价'],
    customBudgetStart: null,
    customBudgetEnd: null,

    dropdown_open: false,
    onBlur_disable: false,

    verifyPhoneVisible: false,
    verifyPhone: '',
    isPhoneVerify: false,
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
      // console.log(fieldsValue)
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
    const { form, currentUser } = this.props
    const { isPhoneVerify } = this.state
    form.validateFields(['realName', 'phone', 'email'], { force: true });
    form.validateFieldsAndScroll((err, values) => {
      if (err) return

      if (!currentUser.id && !isPhoneVerify) {
        message.destroy()
        message.warn('请先验证手机')
        return
      }

      this.handleSend(values)
    })
  }

  handleSend = async ({service, categoryId, formId, creativeForm, description, target, ...fields}: any) => {
    const { letterStore, enquiryData, currentUser, referrerSource, form, forms } = this.props
    const isLogin = !!currentUser.id
    const selectFormItem = forms.find(item => item.id === formId) || {}
    const param = {
      ...fields,
      content: JSON.stringify({ service, formId, creativeForm: selectFormItem.name, target }),
      type: enquiryData.type || LetterSendType.SEND,
      receiverType: enquiryData.receiverType,
      receiverId: enquiryData.receiverId,
      senderId: enquiryData.senderId,
      senderType: isLogin ? enquiryData.senderType : LetterSenderTypes.VISTOR,
      source: enquiryData.source,
      parentId: enquiryData.parentId,
      relationId: enquiryData.relationId,
      sourceVisit: referrerSource || 'meihua',
    }
    const response = await letterStore.sendEnquiry(param)
    if (response.success) {
      this.setState({currentStep: 1})
      form.resetFields()
    }
  }

  handleCancel = (e) => {
    const { letterStore } = this.props
    this.setState({currentStep: 1})
    letterStore.closeEnquiry()
  }

  setDropdownOpen = (dropdown_open) => {
    this.setState({dropdown_open})
  }

  setOnBlurDisable = (onBlur_disable) => {
    this.setState({onBlur_disable})
  }

  handleCustomBedgetStart = (value) => {
    this.setState({customBudgetStart: value})
  }
  handleCustomBedgetEnd = (value) => {
    this.setState({customBudgetEnd: value})
  }
  handleCustomBedgetConfirm = e => {
    const { customBudgetStart, customBudgetEnd } = this.state
    if (!customBudgetStart || !customBudgetEnd) {
      message.info('请输入自定义预算')
      return
    }
    this.props.form.setFieldsValue({
      budget: `${customBudgetStart}-${customBudgetEnd}元`
    })
    this.setDropdownOpen(false)
  }

  handlePhoneModify = () => {
    const { form } = this.props
    const fields = form.getFieldsValue(['phone'])
    this.setState({verifyPhone: fields.phone})
    this.handleVerifyPhoneVisible(true)
  }
  handleVerifyPhoneConfirm = phone => {
    const { form } = this.props
    this.setState({isPhoneVerify: true})
    form.setFieldsValue({phone})
    this.handleVerifyPhoneVisible(false)
  }
  handleVerifyPhoneVisible = (flag) => {
    this.setState({verifyPhoneVisible: !!flag})
  }

  render() {
    const { 
      currentStep, 
      budgets, 
      dropdown_open, 
      onBlur_disable, 
      customBudgetStart, 
      customBudgetEnd, 
      verifyPhoneVisible, 
      verifyPhone,
      isPhoneVerify,
    } = this.state
    const { enquiryUi, currentUser, form, categories, forms } = this.props
    const { getFieldDecorator } = form
    const user = currentUser || {}
    const isLogin = !!user.id
    const phoneDisabled = isLogin || isPhoneVerify
    const phoneBtnText = phoneDisabled ? '修改' : '验证'

    const isFirstStep = currentStep === 1
    const isSecondStep = currentStep === 2

    // const formOptions = forms.map(item => item.name)

    return (
      <>
      <Modal
        className="enquiry-modal"
        title="询价"
        maskClosable={false}
        visible={enquiryUi.visible}
        onCancel={this.handleCancel}
        width={600}
        footer={null}
      >
        <Form className="enquiry-form">
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
              <Form.Item label={<span>寻找能做</span>}>
                <div className="enquiry-category-wrap">
                  <div className="enquiry-category-item">
                    {getFieldDecorator('formId', {
                      rules: [{
                        required: true, message: '请输入或选择创意形式',
                      }],
                    })(
                    // <AutoComplete
                    //     placeholder="请输入或选择创意形式"
                    //     dataSource={formOptions}
                    // />
                    <Select
                      placeholder="请选择创意形式"
                    >
                      {forms.map(item => (
                        <SelectOption key={item.id} value={item.id}>{item.name}</SelectOption>
                      ))}
                    </Select>
                    )}
                  </div>
                  <div className="enquiry-category-item text-label">
                    <span>服务商</span>
                  </div>
                </div>
              </Form.Item>
              <Form.Item label="我期望达成的目标">
                {getFieldDecorator('target', {
                  rules: [{
                    required: true, message: '请输入您期望达成的目标',
                  }],
                })(<TextArea placeholder="请输入您期望达成的目标" />)}
              </Form.Item>
              <Form.Item label="我为此服务能提供的大概预算是">
                  {getFieldDecorator('budget', {
                    // rules: [{
                    //   // required: true, message: '请简单描述您需要的服务内容！'
                    // }],
                  })(<Select
                    placeholder="￥"
                    open={dropdown_open}
                    onDropdownVisibleChange={open => {
                      if (!onBlur_disable) {
                        this.setDropdownOpen(open)
                      }
                    }}
                    dropdownRender={menu => (
                      <div>
                        <div 
                          className="enquiry-custom-budget"
                          onMouseEnter={e => this.setOnBlurDisable(true)}
                          onMouseLeave={e => this.setOnBlurDisable(false)}
                        >
                          <InputNumber 
                            placeholder="￥" 
                            value={customBudgetStart}
                            onChange={this.handleCustomBedgetStart}
                            />
                          <InputNumber 
                            placeholder="￥" 
                            value={customBudgetEnd}
                            onChange={this.handleCustomBedgetEnd}
                          />
                          <Button type="primary" onClick={this.handleCustomBedgetConfirm}>确定</Button>
                        </div>
                        {menu}
                      </div>
                    )}
                  >
                    {budgets.map(value => (
                      <SelectOption key={value} value={value}>{value}</SelectOption>
                    ))}
                  </Select>)}
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
                    <div className="enquiry-form-phone-wrap">
                      <div className="phone-input-wrap">
                        {getFieldDecorator('phone', {
                          rules: [
                            {required: isSecondStep, message: '请输入您的手机'},
                            {pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'},
                          ],
                          initialValue: user.mobilePhone
                        })(<Input placeholder="请输入您的手机" disabled={phoneDisabled} />)}

                      </div>
                      <div className="phone-modify-btn">
                        <Button onClick={this.handlePhoneModify}>{phoneBtnText}</Button>
                      </div>
                    </div>
                  </Form.Item>
                </div>
              </div>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                <Form.Item label="邮箱">
                  {getFieldDecorator('email', {
                    rules: [
                      {required: isSecondStep, message: '请输入您的邮箱'},
                      {type: 'email', message: '邮箱格式不正确!'},
                    ],
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
                <Form.Item label="机构">
                  {getFieldDecorator('company', {
                    rules: [{required: isSecondStep, message: '请输入您的机构'}],
                    initialValue: user.company
                  })(<Input placeholder="请输入您的机构" />)}
                </Form.Item>
                </div>
                <div className="enquiry-form-item">
                <Form.Item label="职务">
                  {getFieldDecorator('job', {
                    rules: [{required: isSecondStep, message: '请输入您的职务'}],
                    initialValue: user.jobTitle
                  })(<Input placeholder="请输入您的职务" />)}
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
      {verifyPhoneVisible && <VerifyPhoneModal
        visible={verifyPhoneVisible}
        phone={verifyPhone}
        onConfirm={this.handleVerifyPhoneConfirm}
        onCancel={e => this.handleVerifyPhoneVisible(false)}
      />}
      </>
    )
  }
} 

export default EnquiryModal