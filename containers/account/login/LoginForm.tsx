import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import { Form, Input, Row, Col, Checkbox, Button, message } from 'antd'
import jsCookie from 'js-cookie'

import OAuthIcons from './OAuthIcons'
import SendEmailComp from '@components/account/SendEmailComp'
import ResendActiveEmail from '../oauth/ResendActiveEmail'
import Geetest from '@components/features/Geetest'

import { PhoneVerifyCodeType } from '@base/enums'
import { config, storage } from '@utils'

import './index.less'

const LoginType = {
  // 密码登录
  EMAIL: 1,
  // 短信登录
  PHONE: 2,
}


@inject(stores => {
  const { accountStore, globalStore } = stores.store
  const { ip } = globalStore
  const { loginFailInfo, fetchApinLogin, fetchUserSignIn, fetchSignin, fetchGTVerifyCode, resetGTVInfo, GTVInfo, fetchPhoneBind } = accountStore

  return {
    accountStore,
    ip,
    loginFailInfo,
    fetchApinLogin,
    fetchUserSignIn,
    fetchSignin,
    fetchGTVerifyCode,
    resetGTVInfo,
    fetchPhoneBind,
    GTVInfo,
  }
})
@observer
class LoginForm extends Component {
  state = {
    remindPwd: false,
    confirmDirty: false,
    loginLoading: false,
    showType: 'form',
    seconds: 30,
    loginType: LoginType.EMAIL,

    gtResult: null,
    phoneDowncount: 0,
    phoneVerifyCodeLoading: false,
  }

  componentDidMount() {
    const { resetGTVInfo } = this.props
    resetGTVInfo()
  }

  requestGTVerifyCode() {
    const { fetchGTVerifyCode } = this.props
    fetchGTVerifyCode()
  }

  handleSubmit = (e) => {
    e.preventDefault()

    const { remindPwd, loginType } = this.state
    const { ip, fetchApinLogin, fetchUserSignIn, fetchSignin, query, form } = this.props

    form.validateFieldsAndScroll((err, values) => {
      const { username, password, phone, code } = values
      if (err) {
        return
      }

      const isPhone = loginType === LoginType.PHONE
      let p = query.p || config.SOURCE_MEIHUA
      const apinParam = {
        username: isPhone ? phone : username,
        password: isPhone ? code : password,
      }
      const param: any = {
        ip,
        source: p,
        remember_password: remindPwd,
      }
      if (isPhone) {
        param.username = phone
        param.code = code
      } else {
        param.username = username
        param.password = password
      }
      this.setState({ loginLoading: true })
      fetchApinLogin(apinParam)
      fetchSignin(param).then(res => {
        this.setState({ loginLoading: false })
        if (res.success) {
          const resData = res.data || {}
          const expires = remindPwd ? 30 : 7
          const domain = config.COOKIE_MEIHUA_DOMAIN
          const token = resData.token.toString()
          let tokenOptions = {
            expires,
            domain,
            path: '/'
          }
          jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
          jsCookie.set('mhauthorization', token, tokenOptions)
          storage.set('user', resData.user)
        }

        this.handleSigninResult(res)
      })
    })
  }

  handleSigninResult = (res) => {
    const { query, form } = this.props
    const { setFields, getFieldValue } = form
    const resData = res.data || {}
    if (resData.code === 'E100007') {
      const data = resData.data || {}
      const verifyData = {
        ...data,
        verifyToken: data.activeToken,
      }
      this.setState({ verifyData, showType: 'active' })
    }

    if (res.success) {
      let url = decodeURIComponent(query.c)
      let bf = query.bf
      let p = query.p

      if (bf) {
        url = `${url}?bf=${bf}`
      }
      if (bf && p) {
        url = `${url}&p=${p}`
      }
      if (url !== 'null' && url !== 'undefined' && !!url && url.indexOf('signin') <= -1) {
        window.location.href = url
      } else {
        window.location.href = `/`
      }

    } else {
      switch (resData.msg) {
        case '用户名不存在':
          setFields({
            username: {
              value: getFieldValue('username'),
              errors: [new Error(resData.msg)]
            }
          })

          break
        case '密码输入不正确':
          setFields({
            password: {
              value: getFieldValue('password'),
              errors: [new Error(resData.msg)]
            }
          })

          break
        default:
          message.destroy()
          message.error(resData.msg)
      }
    }
  }

  handleConfirmBlur = (e) => {
    const value = e.target.value
    this.setState({ confirmDirty: this.state.confirmDirty || !!value })
  }

  handleChange = e => {
    this.setState({ remindPwd: e.target.checked })
  }

  compareToFirstPassword = (rule, value, callback) => {
    const form = this.props.form

    if (value && value !== form.getFieldValue('password')) {
      callback('Two passwords that you enter is inconsistent!')
    } else {
      callback()
    }
  }

  validateToNextPassword = (rule, value, callback) => {
    const form = this.props.form

    if (value && this.state.confirmDirty) {
      form.validateFields(['confirm'], { force: true })
    }

    callback()
  }

  validateToNextUser = (rule, value, callback) => {
    const form = this.props.form

    // if(value && this.state.confirmDirty) {
    //     form.validateFields(['confirm'], { force: true })
    // }

    callback()
  }

  handleCountDown = () => {
    this.timer = setInterval(() => {
      const { seconds } = this.state

      if (seconds <= 0) {
        clearInterval(this.timer)

        return
      }

      this.setState({ seconds: seconds - 1 })
    }, 1000)
  }

  handlePhoneDowncount = () => {
    this.setState({ phoneDowncount: 60 })
    this.phoneTimer = setInterval(() => {
      const { phoneDowncount } = this.state
      if (phoneDowncount <= 0) {
        clearInterval(this.phoneTimer)
      }
      this.setState({ phoneDowncount: phoneDowncount - 1 })
    }, 1000)
  }

  handleSendSubmit = (option) => {
    const { verifyData } = this.state
    this.setState({ verifyData: { ...verifyData, ...option }, showType: 'verify', seconds: 30 })
    this.handleCountDown()
  }

  handleResendEmail = (e) => {
    const { verifyData, seconds } = this.state
    const { accountStore } = this.props

    if (seconds > 0) {
      message.destroy()
      message.info(`${seconds}秒后可以再次点击重发, 请${seconds}秒后继续操作`)
    } else {
      accountStore.fetchSendEmail({ email: verifyData.email, verify_token: verifyData.verifyToken }).then(res => {
        this.setState({ seconds: 30 }, () => {
          this.handleCountDown()
        })
        message.destroy()
        message.success('发送成功')
      })
    }
  }

  handleTabChange = (type) => {
    const { resetGTVInfo } = this.props
    if (type === LoginType.PHONE) {
      this.setState({ loginType: type })
      this.requestGTVerifyCode()
    } else {
      this.setState({ loginType: type, gtResult: null })
      resetGTVInfo({})
    }
  }

  handleGeetest = gtResult => this.setState({ gtResult })

  handleSendCode = () => {
    const { fetchPhoneBind, form } = this.props
    const { gtResult } = this.state
    const values = form.getFieldsValue()
    const phone = values.phone

    if (!phone) {
      message.error('请输入手机号')
      return
    } else if (!/^1[3456789]\d{9}$/.test(phone)) {
      message.error('手机号格式不正确')
      return
    }

    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      const param = {
        type: PhoneVerifyCodeType.OTHER,
        phone,
        ...gtResult,
      }
      this.setState({ phoneVerifyCodeLoading: true })
      fetchPhoneBind(param).then(res => {
        this.setState({ phoneVerifyCodeLoading: false })
        if (res.success) {
          this.handlePhoneDowncount()
        } else {
          message.destroy()
          message.error(res.data.msg || '发送失败')
        }
      })
    } else {
      message.error('请先完成验证')
    }
  }

  render() {
    const { showType, verifyData, loginType, phoneDowncount, phoneVerifyCodeLoading } = this.state
    const { GTVInfo, form } = this.props
    const { getFieldDecorator } = form
    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 24 },
      },
      wrapperCol: {
        // xs: { span: 12, offset: 6 },
        // sm: { span: 12, offset: 6 },
      }
    }
    const tailFormItemLayout = {
      wrapperCol: {
        // xs: { span: 12, offset: 6 },
        // sm: { span: 12, offset: 6 },
      }
    }

    const isEmail = LoginType.EMAIL === loginType
    const isPhone = LoginType.PHONE === loginType
    const isDowncount = phoneDowncount > 0

    return (
      <>
        {showType === 'verify' && <div className='other-box'>
          <SendEmailComp
            value={verifyData.email}
            onSendEmail={this.handleResendEmail}
          />
        </div>}
        {showType === 'active' && <div className='other-box'>
          <ResendActiveEmail
            email={verifyData.email}
            verifyToken={verifyData.activeToken}
            handleSendSubmit={this.handleSendSubmit}
          />
        </div>}
        {showType === 'form' && <div>
          <Form {...formItemLayout} onSubmit={this.handleSubmit}>
            <div className="signin-form-box">
              <div className="signin-form-tabs">
                <div className={classnames('signin-form-tab', { active: isEmail })} onClick={e => this.handleTabChange(LoginType.EMAIL)}>密码登录</div>
                <div className={classnames('signin-form-tab', { active: isPhone })} onClick={e => this.handleTabChange(LoginType.PHONE)}>短信登录</div>
              </div>
              <div className="signin-form-content">
                {isEmail && <>
                  <Form.Item>
                    {getFieldDecorator('username', {
                      rules: [{
                        required: true, message: '请输入邮箱/用户名!'
                      }, {
                        validator: this.validateToNextUser
                      }]
                    })(
                      <div className='field'>
                        <Input id='username' size='large' placeholder='邮箱/用户名' />
                        <label className='field-label' htmlFor='username'>邮箱/用户名</label>
                      </div>
                    )}
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator('password', {
                      rules: [{
                        required: true, message: '请输入密码!'
                      }]
                    })(
                      <div className='field'>
                        <Input id='pwd' size='large' type='password' placeholder='密码' />
                        <label className='field-label' htmlFor='pwd'>密码</label>
                      </div>
                    )}
                  </Form.Item>
                </>}
                {isPhone && <>
                  <Form.Item>
                    {getFieldDecorator('phone', {
                      rules: [{
                        required: true, message: '请输入手机号码!'
                      }, {
                        pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                      }]
                    })(
                      <div className='field'>
                        <Input id='phone' size='large' placeholder='手机' />
                        <label className='field-label' htmlFor='phone'>手机</label>
                      </div>
                    )}
                  </Form.Item>
                  <Form.Item>
                    <div className='geetest-box'>
                      {!GTVInfo.success &&
                        <div className='gt-loading'>
                          <i className='m1-loading'><i></i></i> 正在加载验证码...
                        </div>}
                      {GTVInfo.success &&
                        <Geetest
                          {...GTVInfo}
                          onSuccess={this.handleGeetest}
                          width='100%'
                        />}
                    </div>
                  </Form.Item>
                  <Form.Item>
                    {getFieldDecorator('code', {
                      rules: [{
                        required: true, message: '请输入验证码!'
                      }]
                    })(
                      <div className='field field-phone-code'>
                        <Input id='code' size='large' placeholder='短信验证码' />
                        <Button className="btn-send-code" onClick={this.handleSendCode} disabled={isDowncount} loading={phoneVerifyCodeLoading}>{isDowncount ? `重新发送(${phoneDowncount})S` : '发送验证码'}</Button>
                        <label className='field-label' htmlFor='code'>短信验证码</label>
                      </div>
                    )}
                  </Form.Item>
                </>}
                <Form.Item>
                  <Row type='flex' align='middle' justify='start'>
                    <Col span={12}>
                      <Checkbox className='remind-pwd' onChange={this.handleChange}>记住密码</Checkbox>
                    </Col>
                    <Col span={12}>
                      <a href='/password' className='forget-pwd'>忘记密码？</a>
                    </Col>
                  </Row>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                  <Button size='large' type='primary' htmlType='submit' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>登录</Button>
                </Form.Item>
              </div>
            </div>
          </Form>
          <a className='direct' href='/signup'> 注册新账号 </a>
          <OAuthIcons />
        </div>}
      </>
    )
  }
}

const WrappedLoginForm = Form.create({ name: 'login' })(LoginForm)

export default WrappedLoginForm