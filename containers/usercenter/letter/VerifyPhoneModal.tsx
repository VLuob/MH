import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Modal, Row, Col, Input, message, Button } from 'antd'
import { toJS } from 'mobx'
import Geetest from '@components/features/Geetest'

import { utils } from '@utils'

@inject(stores => {
  const { accountStore, userCenterStore } = stores.store
  const { currentUser, GTVInfo, phoneInfo } = accountStore
  return {
    accountStore,
    userCenterStore,
    currentUser,
    GTVInfo,
    phoneInfo,
  }
})
@observer
class VerifyPhoneModal extends Component {
  constructor(props) {
    super(props)

    this.state = {
      phone: props.phone,
      verifyCode: '',
      countdown: 60,
      gtResult: null,
    }
  }

  // static getDerivedStateFromProps(props, state) {
  //   if (props.phone !== state.phone) {
  //     return {
  //       phone: props.phone
  //     }
  //   }
  //   return {}
  // }

  componentDidMount() {
    const { accountStore, phone } = this.props
    accountStore.fetchGTVerifyCode()
  }

  changePhone = (e) => {
    this.setState({phone: e.target.value})
  }

  changeVerifyCode = (e) => {
    this.setState({verifyCode: e.target.value})
  }

  handleGeetest = gtResult => this.setState({ gtResult })

  // 发送验证码
  handleDownCount = () => {
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
        accountStore.fetchPhoneBind({ type: 5, phone: encodeURIComponent(phone), ...gtResult })
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

  handlePhoneOk = e => {
    const { gtResult, phone, verifyCode } = this.state
    const { phoneInfo, userCenterStore, form, onConfirm } = this.props
    const token = localStorage.getItem('phoneData')

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
      const param = { 
        phone: encodeURIComponent(phone), 
        code: verifyCode, 
        type: 5, 
        verify_token: token || phoneInfo.token 
      }
      // 进行验证
      userCenterStore.fetchCreatorPhoneVerify(param, resData => {
          this.setState({
              phoneVisible: false,
              newPhoneNum: false,
              isPhoneVerified: true,
              verifyCode: ''
          })
          if (onConfirm) onConfirm(phone)
      })
      // Geetest.reset()
    } else {
        message.destroy()
        message.error(`请先完成验证`)
    }
  }

  handlePhoneCancel = () => {
    const { onCancel, accountStore } = this.props
    accountStore.resetGTVInfo()
    if (onCancel) onCancel()
  }

    render() {
    const { visible, GTVInfo, phone: sourcePhone } = this.props
    const { phone, verifyCode, countdown, isCountdown, gtResult } = this.state
  

    return (
      <Modal
          className='safe-container-modal creator-VerCode-modal'
          title={sourcePhone ? `验证手机号` : `修改手机号`}
          visible={visible}
          okText={`确定`}
          cancelText={`取消`}
          zIndex={99999}
          //forceRender={true}
          style={{ padding: '0 50px' }}
          maskClosable={false}
          onOk={this.handlePhoneOk}
          onCancel={this.handlePhoneCancel}
        >
          <Row>
              <Col>
                  <Input type='text' value={phone}
                      placeholder={`请输入新手机号`} className='new-border-input'
                      onChange={this.changePhone} style={{ width: `100%`, height: 38 }} />
              </Col>
              <Col>
                  {
                  // !gtResult &&
                      <>
                          {!GTVInfo.success &&
                              <div className='gt-loading'>
                                  <i className='m1-loading'><i></i></i> 正在加载验证码...
                              </div>}
                          {GTVInfo.success &&
                              <Geetest
                                  {...GTVInfo}
                                  onSuccess={this.handleGeetest}
                                  width='100%' />}
                      </>
                  }
                  {
                  // gtResult &&
                      <div className='zhanwei'></div>}
              </Col>
              <Col>
                  <Input 
                    type='text' 
                    className='new-verify-input' 
                    style={{ width: 250, height: 38, marginRight: 0 }} 
                    placeholder={`请输入验证码`} 
                    value={verifyCode} 
                    onChange={this.changeVerifyCode} 
                  />
                  {!isCountdown ? <Button className='send-verify' onClick={this.handleDownCount} style={{ height: 38 }}>获取验证码</Button> :
                  <Button className='send-verify' style={{ height: 38 }} disabled>重新发送({countdown})S</Button>}
              </Col>
          </Row>
      </Modal>
    )
  }
}

export default VerifyPhoneModal