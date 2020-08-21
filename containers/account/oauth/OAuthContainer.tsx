import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'
import classnames from 'classnames'
import { message, Icon } from 'antd'

import { config } from '@utils'

import LoginBind from './LoginBind'
import RegisterBind from './RegisterBind'
import SendEmailComp from '@components/account/SendEmailComp'
import ResendActiveEmail from './ResendActiveEmail'

import PartLoading from '@components/features/PartLoading'

const typeKeyMap = {
  'weibocallback': 1,
  'qqcallback': 2,
  'mingdaocallback': 3,
  'weixincallback': 5,
}

@inject(stores => {
  const { accountStore } = stores.store
  const { loginFailInfo, fetchApinLogin, oauthBindData } = accountStore

  return {
    accountStore,
    loginFailInfo,
    fetchApinLogin,
    oauthBindData,
  }
})
@observer
export default class OAuthIcons extends Component {
  state = {
    toggleSign: true, // true signin, false signup

    seconds: 30,
    verifyData: {},
    showVerifyEmail: false
  }

  componentDidMount() {
    this.verifyBind()
  }

  handleToggleSign = (e) => {
    const { toggleSign } = this.state
    this.setState({toggleSign: !toggleSign})
  }

  verifyBind() {
    const { query, accountStore } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const type = typeKeyMap[query.type]
    const code = query.code
    const state = query.state || ''
    if (type && code) {
      const param = {
        type,
        code,
        state,
      }
      if (token) {
        param.token = token
      }
      accountStore.fetchVerifyBind(param) 
    } else {

    }
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

  handleSendSubmit = (option) => {
    this.setState({verifyData: option, showVerifyEmail: true, seconds: 30})
    this.handleCountDown()
  }

  handleResendEmail = (e) => {
    const { verifyData, seconds } = this.state
    const { accountStore } = this.props
    
    if(seconds > 0) {
      message.destroy()
      message.info(`${seconds}秒后可以再次点击重发, 请${seconds}秒后继续操作`)
    } else {
      accountStore.fetchSendEmail({email: verifyData.email, verify_token: verifyData.verifyToken}).then(res => {
        this.setState({ seconds: 30 }, () => {
            this.handleCountDown()
        })
        message.destroy()
        message.success('发送成功')
      })
    }
  }

  render() {
    const { query, oauthBindData } = this.props
    const { toggleSign, showVerifyEmail, verifyData } = this.state
    const isLoading = oauthBindData.isLoading
    let activeEmailData = {}
    let isError = false
    let isSuccess = false
    let isTips = false
    let tipsLabel = ''
    let showContentType = 'sign'
    if (showVerifyEmail) {
      showContentType = 'verify'
    } else if (!oauthBindData.success) {
      if (oauthBindData.data && oauthBindData.data.code === 'E100007') {
        showContentType = 'active'
        activeEmailData = oauthBindData.data.data || {}
      } else {
        showContentType = 'error'
        isTips = true
        isError = true
        tipsLabel = (oauthBindData.data || {}).message
      }
    } else if (!!(oauthBindData.data || {}).error) {
      showContentType = 'error'
      isTips = true
      isError = true
      tipsLabel = (oauthBindData.data || {}).error
    } else if ((oauthBindData.data || {}).token) {
      showContentType = 'error'
      isTips = true
      isSuccess = true
      tipsLabel = '授权登录成功，正在跳转...'
    } else if (((oauthBindData.data || {}).data || {}).bind) {
      showContentType = 'error'
      isTips = true
      isSuccess = true
      tipsLabel = '授权绑定成功，正在跳转...'
    }
    return (
      <>
      {isLoading ?
      <PartLoading />
      :
      <>
        {showContentType === 'verify' && <div className='other-box'>
          <SendEmailComp
            value={verifyData.email}
            onSendEmail={this.handleResendEmail}
          />
        </div>}
        {showContentType === 'active' && <div className='other-box'>
          <ResendActiveEmail 
              email={activeEmailData.email}
              verifyToken={activeEmailData.activeToken}
              handleSendSubmit={this.handleSendSubmit}
          />
        </div>}
        {showContentType === 'error' && <div className={classnames('oauth-tips-container', {error: isError}, {success: isSuccess})}>
            {isError && <div className="icon"><Icon type="close-circle" /></div>}
            {isSuccess && <div className="icon"><Icon type="check-circle" /></div>}
            <div className="title">{tipsLabel}</div>
          </div>}
        {showContentType === 'sign' && <div className="oauth-container">
          {toggleSign 
            ? <LoginBind 
                query={query}
                onToRegister={this.handleToggleSign} 
              />
            : <RegisterBind 
                query={query}
                onToLogin={this.handleToggleSign} 
              />}
        </div>}
      </>}
    </>
    )
  }
}