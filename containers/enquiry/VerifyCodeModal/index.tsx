import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Modal, Row, Col, Input, message, Button, Spin } from 'antd'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import Geetest from '@components/features/Geetest'

import { utils, config } from '@utils'

import './index.less'
// import CustomIcon from '@components/widget/common/Icon'

@inject(stores => {
  const { accountStore, userCenterStore, enquiryStore } = stores.store
  const { currentUser, GTVInfo, phoneInfo } = accountStore
  return {
    enquiryStore,
    accountStore,
    userCenterStore,
    currentUser,
    GTVInfo,
    phoneInfo,
  }
})
@observer
class VerifyCodeModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      phone: props.phone,
      verifyCode: '',
      countdown: 60,
      gtResult: null,

      isDeleteSuccess: false,
    }
  }

  componentDidMount() {
    const { accountStore } = this.props
    accountStore.fetchGTVerifyCode()
  }

  componentWillUnmount() {
    const { accountStore } = this.props
    accountStore.resetGTVInfo()
  }

  changePhone = (e) => {
    this.setState({ phone: e.target.value })
  }

  changeVerifyCode = (e) => {
    this.setState({ verifyCode: e.target.value })
  }

  handleGeetest = gtResult => this.setState({ gtResult })

  // 发送验证码
  handleSendCode = () => {
    const { accountStore } = this.props
    const { gtResult, phone } = this.state

    if (!utils.isMobile(phone)) {
      message.destroy()
      message.error(`请输入正确的手机号`)
      return
    }
    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      this.setState(prevState => ({ isCountdown: !prevState.isCountdown }))
      this.calculateDownCount()
      accountStore.fetchPhoneBind({ type: 6, phone: encodeURIComponent(phone), ...gtResult })
    } else {
      message.destroy()
      message.error(`请先完成验证`)
      return
    }
  }

  calculateDownCount = () => {
    const timer = setInterval(() => {
      const { countdown } = this.state
      const countdowns = countdown - 1
      if (countdowns >= 0) {
        this.setState({ countdown: countdowns })
      } else {
        this.setState(prevState => ({ isCountdown: !prevState.isCountdown, countdown: 60 }))
        clearInterval(timer)
      }
    }, 1000)
  }

  handleConfirm = e => {
    const { gtResult, phone, verifyCode } = this.state
    const { phoneInfo, userCenterStore, form, onConfirm, enquiryStore, enquiryId } = this.props
    // const token = localStorage.getItem('phoneData')
    // const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    if (!phone) {
      message.destroy()
      message.error(`请输入手机号`)
      return
    }

    if (!verifyCode) {
      message.destroy()
      message.error(`请输入验证码`)
      return
    }

    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      if (onConfirm) onConfirm({phone, code: verifyCode})

    } else {
      message.destroy()
      message.error(`请先完成验证`)
    }
  }

  handleDeleteSuccess = () => {
    this.setState({ isDeleteSuccess: true })
  }

  handleCancel = () => {
    const { onCancel } = this.props
    if (onCancel) onCancel()
  }

  render() {
    const { visible, GTVInfo, phone: sourcePhone, title } = this.props
    const { phone, verifyCode, countdown, isCountdown, gtResult, isDeleteSuccess } = this.state

    return (
      <Modal
        visible={visible}
        style={{ padding: '0 50px' }}
        maskClosable={false}
        onCancel={this.handleCancel}
        footer={null}
      >
        <div className="enquiry-confirm-modal-wrapper enquiry-delete-modal">
          <div className="title">{title || '手机验证'}</div>
          <div className="content">
            <div className="verify-phone-form">
              <div className="verify-label">
                手机验证
              </div>
              <div className="form-content">
                <div className="form-item">
                  <Input
                    value={phone}
                    placeholder={`请输入手机号`}
                    className='phone-input'
                    onChange={this.changePhone}
                  />
                </div>
                <div className="form-item">
                  {!GTVInfo.success &&
                    <div className='gt-loading'>
                      <Spin size="small" /> 正在加载验证码...
                    </div>}
                  {GTVInfo.success &&
                    <Geetest
                      {...GTVInfo}
                      onSuccess={this.handleGeetest}
                      width='100%'
                    />}
                </div>
                <div className="form-item form-item-verify">
                  <Input
                    className='verify-input'
                    placeholder={`请输入验证码`}
                    value={verifyCode}
                    onChange={this.changeVerifyCode}
                  />
                  <Button
                    className='btn-send-verify'
                    onClick={this.handleSendCode}
                  >
                    {!isCountdown ? '获取验证码' : `重新发送(${countdown})S`}
                  </Button>
                </div>
              </div>
            </div>

          </div>
          <div className="footer">
            <Button onClick={this.handleCancel}>取消</Button>
            <Button type="primary" onClick={this.handleConfirm}>确定</Button>
          </div>
        </div>
      </Modal>
    )
  }
}

export default VerifyCodeModal