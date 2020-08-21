
import { Component, useState } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'
import { Button, Modal, Form, Input, InputNumber, Select, message, Popover, DatePicker } from 'antd'
import Animate from 'rc-animate'
import moment from 'moment'

import { LetterSendType, LetterSenderTypes } from '@base/enums'
import VerifyPhoneModal from '@containers/enquiry/VerifyPhoneModal'
import CustomIcon from '@components/widget/common/Icon'

import enquirySys from '@base/system/enquiry'
import filters from '@base/system/filters'
import { config } from '@utils'

import './index.less'
import { toJS } from 'mobx'

const TextArea = Input.TextArea
const SelectOption = Select.Option

const Div = (props) => {
  const childrenProps = { ...props };
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

const FormLabelPopover = (props) => {
  const { label, title, titleIcon, content, placement, ...rest } = props
  return (
    <span className="form-label-text">
      {label}{' '}
      <Popover
        {...rest}
        placement={placement || 'right'}
        title={<div className="form-popover-title">
          <CustomIcon name="lamp-light" />
          <span>{title || '详细描述'}</span>
        </div>}
        content={
          <div className="form-popover-content">
            {content}
          </div>
        }
      >
        <CustomIcon name="question-circle" />
      </Popover>
    </span>
  )
}

const RenderPopover = (props) => {
  const { content, title } = props
  const [visible, setVisible] = useState(false)

  const onEnter = () => {
    setVisible(true)
  }
  const onLeave = () => {
    setVisible(false)
  }

  const onClick = () => {
    setVisible(false)
  }

  return (
    <Popover
      arrowPointAtCenter
      placement={'right'}
      visible={visible}
      title={<div className="form-popover-title">
        <CustomIcon name="lamp-light" />
        <span>{title || '详细描述'}</span>
      </div>}
      content={
        <div className="form-popover-content">
          {content}
        </div>
      }
    >
      <div onClick={onClick}>
        {props.render(onEnter, onLeave)}
      </div>
    </Popover>
  )
}

@inject(stores => {
  const { accountStore, letterStore, enquiryStore, compositionStore, globalStore } = stores.store
  const { referrerSource } = globalStore
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore
  const { categories, forms } = compositionStore
  const { enquiryEdit } = enquiryStore

  return {
    accountStore,
    letterStore,
    enquiryStore,
    compositionStore,

    enquiryUi,
    enquiryData,
    enquiryEdit,
    referrerSource,
    currentUser,
    forms,

    showPopover1: false,
  }
})
@observer
@Form.create()
class EnquiryFormContainer extends Component {
  state = {
    currentStep: 1,

    // budgets: ['0-20000元', '20000-50000元', '50000-200000元', '200000-500000元', '500000元以上', '按质议价'],
    budgets: filters.enquiryBudgets,
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
    const { compositionStore, forms } = this.props
    if (forms.length === 0) {
      compositionStore.fetchClassifications({})
    }
  }

  handlePrev = () => {
    this.setState({ currentStep: this.state.currentStep - 1 })
  }

  handleNext = () => {
    this.setState({ currentStep: this.state.currentStep + 1 })
  }

  setDropdownOpen = (dropdown_open) => {
    this.setState({ dropdown_open })
  }

  setOnBlurDisable = (onBlur_disable) => {
    this.setState({ onBlur_disable })
  }

  handleCustomBedgetStart = (value) => {
    this.setState({ customBudgetStart: value })
  }
  handleCustomBedgetEnd = (value) => {
    this.setState({ customBudgetEnd: value })
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

  handleInputEnter = (key) => {
    const focusKey = `inputFocus${key}`
    if (!this.state[focusKey]) {
      const popoverKey = `showPopover${key}`
      this.setState({ [popoverKey]: true })
    }
  }
  handleInputLeave = (key) => {
    const popoverKey = `showPopover${key}`
    this.setState({ [popoverKey]: false })
  }
  handleInputFocus = (key) => {
    const popoverKey = `showPopover${key}`
    const focusKey = `inputFocus${key}`
    this.setState({ [popoverKey]: false, [focusKey]: true })
  }
  handleInputBlur = (key) => {
    // const popoverKey = `showPopover${key}`
    const focusKey = `inputFocus${key}`
    this.setState({ [focusKey]: false })
  }

  handlePhoneModify = () => {
    const { form } = this.props
    const fields = form.getFieldsValue(['phone'])
    this.setState({ verifyPhone: fields.phone })
    this.handleVerifyPhoneVisible(true)
  }
  handleVerifyPhoneConfirm = phone => {
    const { form } = this.props
    this.setState({ isPhoneVerify: true })
    form.setFieldsValue({ phone })
    this.handleVerifyPhoneVisible(false)
  }
  handleVerifyPhoneVisible = (flag) => {
    this.setState({ verifyPhoneVisible: !!flag })
  }

  handleVerifyNext = () => {
    const { form } = this.props
    form.validateFieldsAndScroll((err, fieldsValue) => {
      // console.log(fieldsValue)
      if (err) return
      this.handleNext()
    })
  }

  handleSubmit = () => {
    const { form, currentUser, isPublicEnquiry, enquiryId } = this.props
    const { isPhoneVerify } = this.state
    form.validateFields(['realName', 'phone', 'email'], { force: true });
    form.validateFieldsAndScroll((err, values) => {
      if (err) return
      const isEdit = !!enquiryId
      if (!currentUser.id && !isPhoneVerify && !isEdit) {
        message.destroy()
        message.warn('请先验证手机')
        return
      }

      if (isPublicEnquiry) {
        this.handleSaveEnquiry(values)
      } else {
        this.handleSend(values)
      }
    })
  }

  handleSend = async ({ service, categoryId, formId, description, target, ...fields }: any) => {
    const { letterStore, enquiryData, currentUser, referrerSource, form, forms, onSuccess } = this.props
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
      relationExtend: enquiryData.relationExtend,
    }
    const response = await letterStore.sendEnquiry(param)
    if (response.success) {
      this.setState({ currentStep: 1 })
      form.resetFields()
      onSuccess({ values: param, formId })
    } else {
      message.destroy()
      message.error(response.data.msg ? `提交失败：${response.data.msg}` : '提交失败')
    }
  }

  handleSaveEnquiry = async ({ service, categoryId, formId, description, target, expireTime, ...fields }: any) => {
    const { enquiryStore, enquiryData, enquiryEdit, currentUser, referrerSource, form, forms, onSuccess, onError, enquiryId } = this.props
    const isEdit = !!enquiryId
    const isLogin = !!currentUser.id
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const selectFormItem = forms.find(item => item.id === formId) || {}
    const isVisitor = enquiryEdit.senderType === LetterSenderTypes.VISTOR
    const param = {
      ...fields,
      content: JSON.stringify({ service, formId, creativeForm: selectFormItem.name, target }),
      sourceVisit: referrerSource || 'meihua',
      expireTime: expireTime.valueOf(),
    }
    if (isLogin && !isVisitor) {
      param.token = token
    }
    // onSuccess({values: param, formId})
    let response
    if (enquiryId) {
      param.enquiryId = enquiryId
      
      if (isVisitor) {
        const phoneVerify = enquirySys.getVisitorPhoneVerify(enquiryId)
        param.verifyPhone = phoneVerify.phone
        // 如果该验证码已提交过，无需重复传
        if (phoneVerify.token) {
          param.verifyToken = phoneVerify.token
        } else {
          param.verifyCode = phoneVerify.code
        }
      }

      response = await enquiryStore.editEnquiry(param)
    } else {
      response = await enquiryStore.addEnquiry(param)
    }
    if (response.success) {
      const resData = response.data
      const newEnquiryId = enquiryId || response.data
      this.setState({ currentStep: 1 })
      form.resetFields()
      if (isVisitor && isEdit) {
        const verifyToken = resData
        // enquirySys.removeVisitorPhoneVerify(enquiryId)
        const expire = moment().add(7, 'day').valueOf()
        enquirySys.updateVisitorPhoneVerify({id: enquiryId, token: verifyToken, expire})
      }
      if (onSuccess) {
        onSuccess({ values: param, formId, enquiryId: newEnquiryId })
      }
    } else {
      if (response.data.msg === 'PERMISSION DENIED') {
        message.destroy()
        message.error('您不是此询价的发布者，无权进行操作')
      } else {
        message.destroy()
        message.error(response.data.msg ? `提交失败：${response.data.msg}` : '提交失败')
      }
      if (onError) onError(response)
    }
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

      showPopover1,
    } = this.state
    const { 
      enquiryUi, 
      currentUser, 
      form, 
      categories, 
      forms = [], 
      enquiryEdit = {}, 
      isPublicEnquiry, 
      enquiryId,
      enquiryData,
    } = this.props
    const { getFieldDecorator } = form
    const user = currentUser || {}
    const isLogin = !!user.id
    const isEdit = !!enquiryId
    const phoneDisabled = isLogin || isPhoneVerify || isEdit
    const phoneBtnText = phoneDisabled ? '修改' : '验证'

    const isFirstStep = currentStep === 1
    const isSecondStep = currentStep === 2

    const contactInfo = JSON.parse(enquiryEdit.contactInfo || '{}')
    const contact = {
      realName: contactInfo.realName || user.realName,
      phone: contactInfo.phone || user.mobilePhone,
      email: contactInfo.email || user.email,
      wx: contactInfo.wx || user.weiXin,
      company: contactInfo.company || user.company,
      job: contactInfo.job || user.jobTitle,
    }

    const hasRelationExtend = !!enquiryData.relationExtend
    const relationExtend = hasRelationExtend ?  JSON.parse(enquiryData.relationExtend) : {}

    return (
      <>
        <Form
          colon={false}
          className="enquiry-form"
        >
          <Animate
            showProp="show"
            transitionAppear
            transitionName="fade"
          >
            <Div key={'firstStep'} className="enquiry-form-container" show={isFirstStep} style={{ display: isFirstStep ? '' : 'none' }}>
              {hasRelationExtend && <Form.Item>
                <div className="enquiry-service-extend">
                  <div className="name">咨询服务</div>
                  <div className="content">{enquiryData.serviceName}（{relationExtend.name}/中位价{relationExtend.price}元）</div>
                </div>
              </Form.Item>}
              <RenderPopover
                content={<>
                  <p>包含您咨询的品牌、产品、服务信息</p>
                  <p>例如：<br />您的公司或服务的品牌是梅花网，您可以填写：梅花网</p>
                </>}
                render={(onEnter, onLeave) => (
                  <Form.Item
                    label={
                      <span className="form-label-text">
                        我想为{' '}
                        <CustomIcon name="question-circle"
                          onMouseEnter={onEnter}
                          onMouseLeave={onLeave}
                        />
                      </span>
                    }
                  >
                    {getFieldDecorator('service', {
                      rules: [{ required: true, message: '品牌/产品/服务' }],
                      initialValue: enquiryEdit.product,
                    })(<Input
                      placeholder="品牌/产品/服务"
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
                    />)}
                  </Form.Item>
                )} />
              <RenderPopover
                content={<>
                  <p>包含您需要的服务创意形式</p>
                  <p>例如：<br />您寻找能做短视频的服务商，就选择：短视频</p>
                </>}
                render={(onEnter, onLeave) => (
                  <Form.Item label={
                    <span className="form-label-text">
                      寻找能做{' '}
                      <CustomIcon name="question-circle"
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                      />
                    </span>
                  }>
                    <div className="enquiry-category-wrap">
                      <div className="enquiry-category-item">
                        {getFieldDecorator('formId', {
                          rules: [{
                            required: true, message: '请输入或选择创意形式',
                          }],
                          initialValue: enquiryEdit.formId,
                        })(
                          <Select
                            placeholder="请选择创意形式"
                            onMouseEnter={onEnter}
                            onMouseLeave={onLeave}
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
                )} />
              <RenderPopover
                content={<>
                  <p>包含您期望达成的效果和目标</p>
                  <p>例如：<br />您期望的达成的目标是企业品牌曝光，那您可以填写：企业品牌曝光</p>
                </>}
                render={(onEnter, onLeave) => (
                  <Form.Item label={
                    <span className="form-label-text">
                      我期望达成的目标{' '}
                      <CustomIcon name="question-circle"
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                      />
                    </span>
                  }
                  >
                    {getFieldDecorator('target', {
                      rules: [{
                        required: true, message: '请输入您期望达成的目标',
                      }],
                      initialValue: enquiryEdit.target,
                    })(<TextArea
                      placeholder="请输入您期望达成的目标"
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
                    />)}
                  </Form.Item>
                )} />
              <RenderPopover
                content={<>
                  <p>请选择您预估的预算区间，准确的预算可以更精准的匹配服务商</p>
                </>}
                render={(onEnter, onLeave) => (
                  <Form.Item label={
                    <span className="form-label-text">
                      我为此服务能提供的大概预算是{' '}
                      <CustomIcon name="question-circle"
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                      />
                    </span>
                  }
                  >
                    {getFieldDecorator('budget', {
                      rules: [{
                        required: true, message: '请请选择您预估的预算',
                      }],
                      initialValue: enquiryEdit.budget,
                    })(<Select
                      placeholder="￥"
                      open={dropdown_open}
                      onMouseEnter={onEnter}
                      onMouseLeave={onLeave}
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
                      {budgets.map(item => (
                        <SelectOption key={item.value} value={item.value}>{item.value}</SelectOption>
                      ))}
                    </Select>)}
                  </Form.Item>
                )} />
              {isPublicEnquiry &&
                <RenderPopover
                  content={<>
                    <p>请选择该询价截止时间，到了该时间，该询价将下架不再显示</p>
                  </>}
                  render={(onEnter, onLeave) => (
                    <Form.Item label={
                      <span className="form-label-text">
                        该询价截止时间{' '}
                        <CustomIcon name="question-circle"
                          onMouseEnter={onEnter}
                          onMouseLeave={onLeave}
                        />
                      </span>
                    }
                    >
                      {getFieldDecorator('expireTime', {
                        rules: [{ required: true, message: '请选择该询价截止时间' }],
                        initialValue: enquiryEdit.gmtExpire ? moment(enquiryEdit.gmtExpire) : moment().add(30, 'days')
                      })(<DatePicker
                        placeholder="请选择该询价截止时间"
                        suffixIcon={<CustomIcon name="calendar" />}
                        onMouseEnter={onEnter}
                        onMouseLeave={onLeave}
                      />)}
                    </Form.Item>
                  )} />}
            </Div>
            <Div key={'secondStep'} className="enquiry-form-container" show={isSecondStep} style={{ display: isSecondStep ? '' : 'none' }}>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                  <Form.Item label="姓名">
                    {getFieldDecorator('realName', {
                      rules: [{ required: isSecondStep, message: '请输入您的姓名' }],
                      initialValue: contact.realName
                    })(<Input placeholder="请输入您的姓名" />)}
                  </Form.Item>
                </div>
                <div className="enquiry-form-item">
                  <Form.Item label="手机">
                    <div className="enquiry-form-phone-wrap">
                      <div className="phone-input-wrap">
                        {getFieldDecorator('phone', {
                          rules: [
                            { required: isSecondStep, message: '请输入您的手机' },
                            { pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!' },
                          ],
                          initialValue: contact.phone
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
                        { required: isSecondStep, message: '请输入您的邮箱' },
                        { type: 'email', message: '邮箱格式不正确!' },
                      ],
                      initialValue: contact.email
                    })(<Input placeholder="请输入您的邮箱" />)}
                  </Form.Item>
                </div>
                <div className="enquiry-form-item">
                  <Form.Item label="微信">
                    {getFieldDecorator('wx', {
                      // rules: [{required: true, message: '请输入您的微信'}],
                      initialValue: contact.wx
                    })(<Input placeholder="请输入您的微信" />)}
                  </Form.Item>
                </div>
              </div>
              <div className="enquiry-form-user-row">
                <div className="enquiry-form-item">
                  <Form.Item label="机构">
                    {getFieldDecorator('company', {
                      rules: [{ required: isSecondStep, message: '请输入您的机构' }],
                      initialValue: contact.company
                    })(<Input placeholder="请输入您的机构" />)}
                  </Form.Item>
                </div>
                <div className="enquiry-form-item">
                  <Form.Item label="职务">
                    {getFieldDecorator('job', {
                      rules: [{ required: isSecondStep, message: '请输入您的职务' }],
                      initialValue: contact.job
                    })(<Input placeholder="请输入您的职务" />)}
                  </Form.Item>
                </div>
              </div>
            </Div>
          </Animate>
          <Form.Item>
            <div className="form-bottom">
              {isFirstStep && <Button type="primary" onClick={this.handleVerifyNext}>下一步</Button>}
              {isSecondStep && <Button onClick={this.handlePrev}>上一步</Button>}
              {isSecondStep && <Button type="primary" onClick={this.handleSubmit} >发送</Button>}
            </div>
          </Form.Item>
        </Form>
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

export default EnquiryFormContainer