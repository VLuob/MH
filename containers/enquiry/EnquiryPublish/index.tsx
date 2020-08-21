import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { message, Modal } from 'antd'

import EnquiryForm from '../EnquiryForm'
import EnquiryAuthors from '../EnquiryAuthors'
import EnquiryResult from '../EnquiryResult'

import CustomIcon from '@components/widget/common/Icon'
import VerifyCodeModal from '../VerifyCodeModal'

import enquirySys from '@base/system/enquiry'
import { LetterSenderTypes } from '@base/enums'
import { config, storage } from '@utils'

import './index.less'

const EnquiryStep = {
  FORM_SUBMIT: 1,
  AUTHOR_SUBMIT: 2,
  COMPLETED: 3,
}

const Div = (props) => {
  const childrenProps = { ...props };
  delete childrenProps.show;
  return <div {...childrenProps} />;
};

@inject(stores => {
  const { accountStore, letterStore, enquiryStore, compositionStore, globalStore } = stores.store
  const { referrerSource } = globalStore
  const { enquiryUi, enquiryData } = letterStore
  const { currentUser } = accountStore
  const { enquiryEdit } = enquiryStore

  return {
    accountStore,
    letterStore,
    enquiryStore,
    compositionStore,

    referrerSource,
    currentUser,
    enquiryEdit,
  }
})
@observer
class EnquiryPublishContainer extends Component {
  state = {
    enquiryStep: EnquiryStep.FORM_SUBMIT,
    enquiryId: 0,
    formId: 0,
    enquiryValues: {},

    formVisible: false,

    phoneVerifyVisible: false,
  }

  componentDidMount() {
    this.handleCheckVisitor()
  }

  handleCheckVisitor() {
    const { enquiryEdit, currentUser, query } = this.props
    const enquiryId = query.id
    const isLogin = !!currentUser.id
    const isEdit = !!enquiryId

    // console.log('sdfds', enquirySys.checkVisitorPhoneVerify(enquiryId))

    if (isEdit) {
      if (!isLogin && !enquirySys.checkVisitorPhoneVerify(enquiryId)) {
        this.handlePhoneVerifyVisible(true)
      } else {
        this.fiestRequestEnquiry()
      }
    } else {
      this.handleFormVisible(true)
    }
  }

  fiestRequestEnquiry() {
    const { enquiryStore, currentUser, query } = this.props
    const enquiryId = query.id
    const isLogin = !!currentUser.id
    const isEdit = !!enquiryId
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!isEdit) {
      return
    }
    const param = {
      enquiryId,
    }
    if (isLogin) {
      param.token = token
    } else {
      const phoneVerify = enquirySys.getVisitorPhoneVerify(enquiryId)
      param.verifyPhone = phoneVerify.phone
      param.verifyToken = phoneVerify.token
    }

    this.requestEnquiryEdit(param)
  }

  async requestEnquiryEdit(option) {
    const { enquiryStore, query } = this.props
    const enquiryId = query.id
    const response = await enquiryStore.fetchEnquiryEdit(option)
    if (response.success) {
      const resData = response.data || {}
      const verifyToken = resData.verifyToken
      const create = moment().valueOf()
      const expire = moment().add(7, 'days').valueOf()
      const storeParam = {id: enquiryId, verify: true, create, expire, token: verifyToken, phone: option.verifyPhone, code: option.verifyCode}
      enquirySys.saveVisitorPhoneVerify(storeParam)
      this.handleFormVisible(true)

    } else {
      if (response.data.msg === 'PERMISSION DENIED') {
        message.destroy()
        message.error('您无权进行操作')
      } else {
        message.destroy()
        message.error(response.data.msg)
      }
    }
  }

  handleFormVisible = (flag) => {
    setTimeout(() => {
      this.setState({formVisible: !!flag})
    }, 800)
  }

  handlePhoneVerifyVisible = (flag) => {
    this.setState({phoneVerifyVisible: !!flag})
  }

  handlePhoneVerifyCancel = () => {
    Modal.confirm({
      title: '此询价是游客身份发布，编辑此询价需要验证手机号，您确认取消验证？',
      cancelText: '仍然取消',
      okText: '继续验证',
      onCancel: () => {
        const { query } = this.props
        location.href = `/enquiry/${query.id}`
      }
    })
  }

  handlePhoneVerifyConfirm = async (option={}) => {
    // const { query } = this.props
    // const enquiryId = query.id
    // const create = moment().valueOf()
    // const param = {id: enquiryId, varify: true, create, ...option}
    // enquirySys.saveVisitorPhoneVerify(param)
    // this.handlePhoneVerifyVisible(false)

    const { query, enquiryStore } = this.props
    const enquiryId = query.id
    const param = {
      enquiryId, 
      verifyPhone: option.phone,
      verifyCode: option.code,
    }
    const response = await enquiryStore.fetchEnquiryEdit(param)

    if (response.success) {
      const resData = response.data || {}
      const verifyToken = resData.verifyToken
      const create = moment().valueOf()
      const expire = moment().add(7, 'days').valueOf()
      const storeParam = {id: enquiryId, verify: true, create, expire, token: verifyToken, ...option}
      // storage.set(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS, storeParam)
      enquirySys.saveVisitorPhoneVerify(storeParam)
      this.handlePhoneVerifyVisible(false)
      this.handleFormVisible(true)
    } else {
      if (response.data.msg === 'PERMISSION DENIED') {
        message.destroy()
        message.error('您无权进行操作')
      } else {
        message.destroy()
        message.error(response.data.msg)
      }
    }
  }

  handleEnquiryPublishSuccess = ({values, formId, enquiryId}) => {
    this.setState({
      enquiryId,
      formId,
      enquiryValues: values,
      enquiryStep: EnquiryStep.AUTHOR_SUBMIT,
    })
  }

  handleEnquiryPublishError = (res) => {
    const { query } = this.props
    if (!res.success) {
      if (res.data.msg === '验证码错误') {
        const enquiryId = query.id
        enquirySys.removeVisitorPhoneVerify(enquiryId)
        this.handlePhoneVerifyVisible(true)
      }
    }
  }

  handleEnquiryBetchSuccess = (ids) => {
    this.setState({
      enquiryStep: EnquiryStep.COMPLETED,
    })
  }

  handleBetchCancel = () => {
    location.href = '/enquiry'
  }

  handleResultCancel = () => {
    location.href = '/enquiry'
  }

  handleResultOk = async () => {
    const { enquiryStore } = this.props
    const { enquiryId } = this.state
    const response = await enquiryStore.fetchEnquiryPreviewCode({enquiryId})
    if (response.success) {
      const code = response.data
      // location.href = `/enquiry/preview/${code}`
      window.open(`/enquiry/preview/${code}`)
    } else {
      message.destroy()
      message.error(response.data.msg || '生成预览码失败')
    }
  }

  render() {
    const {
      enquiryStep,
      formId,
      enquiryValues,
      phoneVerifyVisible,
      formVisible,
    } = this.state
    const { currentUser, query } = this.props
    const user = currentUser || {}
    const isLogin = !!user.id
    const isEdit = !!query.id
    
    const isFormStep = enquiryStep === EnquiryStep.FORM_SUBMIT
    const isAuthorStep = enquiryStep === EnquiryStep.AUTHOR_SUBMIT
    const isCompletedStep = enquiryStep === EnquiryStep.COMPLETED

    return (
      <>
        <div className="enquiry-container">
          <div className="enquiry-publish-container">
            {isFormStep && <div className="enquiry-publish-section form-section">
              <div className="enquiry-form-title">
                {isEdit ? '修改询价' : '发布询价'}
              </div>
              { <EnquiryForm 
                isPublicEnquiry
                enquiryId={query.id}
                onSuccess={this.handleEnquiryPublishSuccess}
                onError={this.handleEnquiryPublishError}
              />}
            </div>}
            {isAuthorStep && <div className="enquiry-publish-section author-section">
              <EnquiryResult hideBtns showDesc />
              <EnquiryAuthors
                isPublicEnquiry
                formId={formId}
                enquiryValues={enquiryValues}
                onSuccess={this.handleEnquiryBetchSuccess}
                onCancel={this.handleBetchCancel}
              />
            </div>}
            {isCompletedStep && <div className="enquiry-publish-section completed-section">
              <EnquiryResult
                cancelText="返回列表"
                onCancel={this.handleResultCancel}
                onOk={this.handleResultOk}
              />
            </div>}
          </div>
        </div>
        {phoneVerifyVisible && <VerifyCodeModal
          title="编辑询价"
          visible={phoneVerifyVisible}
          onCancel={this.handlePhoneVerifyCancel}
          onConfirm={this.handlePhoneVerifyConfirm}
        />}
      </>
    )
  }
}

export default EnquiryPublishContainer