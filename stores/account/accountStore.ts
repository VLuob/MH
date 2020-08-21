import { observable, action, runInAction } from 'mobx'
import nookies, { parseCookies, setCookie, destroyCookie } from 'nookies'
import { utils, cookie, config } from '@utils'
import { ActionType, ApplyType } from '@base/enums'
import { Base64 } from 'js-base64'
import { accountApi } from '@api'
import { Router } from '@routes'
import { message } from 'antd'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'

import basic from '@base/system/basic'
import { PhoneType } from '@base/enums'
import globalStore from '@stores/global/globalStore'
import { compositionApi } from '@api/'

const token = basic.token

export class AccountStore {
  @observable isRegister: boolean
  @observable isEmailNextStep: boolean
  @observable isPhoneNextStep: boolean
  @observable isActive: boolean
  @observable GTVInfo: any
  @observable GTVNewInfo: any
  @observable phoneData: any
  @observable currentUser: any
  @observable userClientInfo: any
  @observable phoneInfo: any
  @observable showSetPwdForm: boolean
  @observable showCreatorClaim: boolean
  @observable registerData: any
  @observable oauthBindData: any
  @observable oauthBinds: any
  @observable hotShots: Array<any>
  @observable activeResultData: any

  constructor(initialData: any = {}) {
    this.isRegister = initialData.isRegister || false
    this.isEmailNextStep = initialData.isEmailNextStep || false
    this.isPhoneNextStep = initialData.isPhoneNextStep || false
    this.isActive = initialData.isActive || false
    this.GTVInfo = initialData.GTVInfo || {}
    this.GTVNewInfo = initialData.GTVNewInfo || {}
    this.phoneData = initialData.phoneData || {}
    this.currentUser = initialData.currentUser || {}
    this.userClientInfo = initialData.userClientInfo || {}
    this.phoneInfo = initialData.phoneInfo || {}
    this.showSetPwdForm = initialData.showSetPwdForm || false
    this.showCreatorClaim = initialData.showCreatorClaim || false
    this.registerData = initialData.registerData || {}
    this.oauthBindData = initialData.oauthBindData || { isLoading: true, success: false, data: {} }
    this.oauthBinds = initialData.oauthBinds || {}
    this.hotShots = initialData.hotShots || []
    this.activeResultData = initialData.activeResultData || { success: false, data: {} }
  }

  @action.bound
  updateUserInfo(data) {
    if (typeof data === 'object') {
      this.currentUser = data
    } else {
      this.currentUser = {}
    }
  }

  @action.bound
  updateCreatorClaim(data) {
    this.showCreatorClaim = data
  }

  @action.bound
  resetGTVInfo(info) {
    this.GTVInfo = info || {}
  }

  @action.bound
  updateHotShots(shots) {
    this.hotShots = shots || []
  }

  @action.bound
  saveActiveResult(result) {
    this.activeResultData = result
  }

  setSigninSuccess({ result, remindPwd }) {
    const expires = remindPwd ? 30 : 7
    const domain = config.COOKIE_MEIHUA_DOMAIN
    const token = result.data.token.toString()
    const user = encodeURIComponent(JSON.stringify(result.data.user))
    let url = decodeURIComponent(utils.getQueryString(`c`))
    let bf = ''
    let p = ''


    if (utils.getQueryString(`bf`)) {
      bf = utils.getQueryString(`bf`)

      url = `${url}?bf=${bf}`
    }

    if (utils.getQueryString(`bf`) && utils.getQueryString(`p`)) {
      p = utils.getQueryString(`p`)

      url = `${url}&p=${p}`
    }

    const ls = window.localStorage
    let tokenOptions = {}

    //TODO: 修复
    const hosts = window.location.host && (window.location.host).split('.')[0]

    tokenOptions = {
      expires,
      domain,
      path: '/'
    }

    jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
    jsCookie.set('mhauthorization', token, tokenOptions)
    ls.setItem('user', JSON.stringify(result.data.user))
    // jsCookie.set('user', JSON.stringify(result.data.user), tokenOptions)

    if (url !== 'null' && url !== 'undefined' && !!url && url.indexOf('signin') <= -1) {
      window.location.href = url
    } else {
      window.location.href = `/`
    }
  }

  setSigninFailled({ result, remindPwd, setFields, getFieldValue }) {
    switch (result.data.msg) {
      case '用户名不存在':
        setFields({
          username: {
            value: getFieldValue('username'),
            errors: [new Error(result.data.msg)]
          }
        })

        break
      case '密码输入不正确':
        setFields({
          password: {
            value: getFieldValue('password'),
            errors: [new Error(result.data.msg)]
          }
        })

        break
      default:
        message.destroy()
        message.error(result.data.msg)
    }
  }

  setSigninResult({ result, remindPwd, setFields, getFieldValue }) {
    if (result.success) {
      const expires = remindPwd ? 30 : 7
      const domain = config.COOKIE_MEIHUA_DOMAIN
      const token = result.data.token.toString()
      const user = encodeURIComponent(JSON.stringify(result.data.user))
      let url = decodeURIComponent(utils.getQueryString(`c`))
      let bf = ''
      let p = ''


      if (utils.getQueryString(`bf`)) {
        bf = utils.getQueryString(`bf`)

        url = `${url}?bf=${bf}`
      }

      if (utils.getQueryString(`bf`) && utils.getQueryString(`p`)) {
        p = utils.getQueryString(`p`)

        url = `${url}&p=${p}`
      }

      const ls = window.localStorage
      let tokenOptions = {}

      //TODO: 修复
      const hosts = window.location.host && (window.location.host).split('.')[0]

      tokenOptions = {
        expires,
        domain,
        path: '/'
      }

      jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
      jsCookie.set('mhauthorization', token, tokenOptions)
      ls.setItem('user', JSON.stringify(result.data.user))
      // jsCookie.set('user', JSON.stringify(result.data.user), tokenOptions)

      message.destroy()
      message.success('绑定成功')
      setTimeout(() => {
        if (url !== 'null' && url !== 'undefined' && !!url && url.indexOf('signin') <= -1) {
          window.location.href = url
        } else {
          window.location.href = `/`
        }
      }, 2000)
    } else {
      switch (result.data.msg) {
        case '用户名不存在':
          setFields({
            username: {
              value: getFieldValue('username'),
              errors: [new Error(result.data.msg)]
            }
          })

          break
        case '密码输入不正确':
          setFields({
            password: {
              value: getFieldValue('password'),
              errors: [new Error(result.data.msg)]
            }
          })

          break
        default:
          message.destroy()
          message.error(result.data.msg)
      }
    }
  }


  /**
   * 保存登录客户端信息
   * @param result 
   * @param remindPwd 
   */
  saveClientSigninInfo(data, remindPwd = false) {
    const expires = remindPwd ? 30 : 7
    const domain = config.COOKIE_MEIHUA_DOMAIN
    const token = data.token.toString()
    // const user = encodeURIComponent(JSON.stringify(data.user))

    const hosts = window.location.host && (window.location.host).split('.')[0]

    const tokenOptions = {
      expires,
      domain,
      path: '/'
    }

    // this.updateUserInfo(data.user)

    jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
    jsCookie.set('mhauthorization', token, tokenOptions)
    window.localStorage.setItem('user', JSON.stringify(data.user))

  }

  // 验证手机/邮箱是否已存在
  @action.bound
  async fetchUserVerification(option) {
    globalStore.changeLoading(true)

    try {
      let result
      const { email, phone, setFields, getFieldValue } = option

      switch (option.type) {
        case ApplyType.EMAIL:
          result = await accountApi.userVerification({ email })

          break
        case ApplyType.PHONE:
          result = await accountApi.userVerification({ phone })

          break
      }

      //await之后更改状态
      runInAction(() => {
        if (result.success) {
          if (result.data) {
            switch (option.type) {
              case ApplyType.EMAIL:
                setFields({
                  email: {
                    value: getFieldValue('email'),
                    errors: [new Error(`该邮箱已被注册, 请重新输入`)]
                  }
                })

                break
              case ApplyType.PHONE:
                setFields({
                  phone: {
                    value: getFieldValue('phone'),
                    errors: [new Error(result.data)]
                  }
                })

                break
            }
          }
        }
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 注册
  @action.bound
  async fetchUserSignUp(option, callback) {
    try {
      const result = await accountApi.userSignUp({ ...option })

      if (result.success) {
        this.isRegister = true
        this.registerData = result.data
      } else {
        message.destroy()
        if (result.data.code === 'E100002') {
          message.error(result.data.msg)
        } else {
          message.error('注册失败')
        }
      }
      if (callback) callback(result)
    } catch (err) {
      if (callback) callback({ success: false, data: {}, err })
    }
  }

  // 登录 （新）
  @action.bound
  async fetchSignin(option) {
    try {
      const response = await accountApi.userSignIn(option)
      return response
    } catch (err) {
      return { success: false, data: {} }
    }
  }

  // 登录
  @action.bound
  async fetchUserSignIn(option, callback) {
    let p = config.SOURCE_MEIHUA

    if (utils.getQueryString(`p`)) {
      p = utils.getQueryString(`p`)
    }

    try {
      const { username, password, ip, remindPwd, setFields, getFieldValue } = option
      const result = await accountApi.userSignIn({ username, password, source: p, ip })

      if (result.success) {
        const expires = remindPwd ? 30 : 7
        const domain = config.COOKIE_MEIHUA_DOMAIN
        const token = result.data.token.toString()
        const user = encodeURIComponent(JSON.stringify(result.data.user))
        let url = decodeURIComponent(utils.getQueryString(`c`))
        let bf = ''


        if (utils.getQueryString(`bf`)) {
          bf = utils.getQueryString(`bf`)

          url = `${url}?bf=${bf}`
        }

        if (utils.getQueryString(`bf`) && utils.getQueryString(`p`)) {
          p = utils.getQueryString(`p`)

          url = `${url}&p=${p}`
        }

        const ls = window.localStorage
        let tokenOptions = {}

        //TODO: 修复
        // const hosts = window.location.host && (window.location.host).split('.')[0]

        tokenOptions = {
          expires,
          domain,
          path: '/'
        }

        jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
        jsCookie.set('mhauthorization', token, tokenOptions)
        ls.setItem('user', JSON.stringify(result.data.user))
        // jsCookie.set('user', JSON.stringify(result.data.user), tokenOptions)

        if (url !== 'null' && url !== 'undefined' && !!url && url.indexOf('signin') <= -1) {
          window.location.href = url
        } else {
          window.location.href = `/`
        }
      } else {
        switch (result.data.msg) {
          case '用户名不存在':
            setFields({
              username: {
                value: getFieldValue('username'),
                errors: [new Error(result.data.msg)]
              }
            })

            break
          case '密码输入不正确':
            setFields({
              password: {
                value: getFieldValue('password'),
                errors: [new Error(result.data.msg)]
              }
            })

            break
          default:
            message.destroy()
            message.error(result.data.msg)
        }
      }
      if (callback) callback(result)
    } catch (err) {
      message.destroy()
      message.error('登录失败')
      if (callback) callback({ success: false, data: {} })
    }
  }

  // 用户登录附操作
  @action.bound
  async fetchApinLogin(option) {
    try {
      const { username, password } = option
      const result = await accountApi.apinLogin({ username, password })

      if (result.success) {
        // console.log(result.data)
      } else {
        console.log(result.data.msg)
      }
    } catch (err) {
      console.log(err)
    }
  }

  // 用户登出
  @action.bound
  async fetchUserLogout(option) {
    globalStore.changeLoading(true)

    try {
      const result = await accountApi.userLogout(token)

      if (result.success) {
        // const hosts = window.location.host && (window.location.host).split('.')[0]
        const options = {
          domain: config.COOKIE_MEIHUA_DOMAIN,
          path: '/'
        }

        cookie.remove('user', options)
        cookie.remove(config.COOKIE_MEIHUA_TOKEN, options)
        // cookie.remove('popUpState', options)
        cookie.remove('mhauthorization', options)
        // cookie.remove('meihua_nav_tooltip', options)
        const pathname = location.pathname
        if (['/personal', '/teams/'].some(v => pathname.indexOf(v) === 0)) {
          window.location.href = '/'
        } else if (['/pricing'].some(v => pathname.indexOf(v) === 0)) {
          window.location.href = pathname
        } else {
          window.location.href = location.href
        }
      } else {
        message.destroy()
        message.error(result.data.msg)
      }
    } catch (err) {
      console.log(err)
    }

    globalStore.changeLoading(false)
  }

  // 找回密码
  @action.bound
  async fetchRetrievePwd(option) {
    globalStore.changeLoading(true)

    try {
      const result = await accountApi.retrievePwd(option)

      runInAction(() => {
        if (result.success) {
          switch (option.type) {
            case ApplyType.EMAIL:
              this.isEmailNextStep = true

              message.destroy()
              message.success(`邮件发送成功`)
              break

            case ApplyType.PHONE:
              this.isPhoneNextStep = true
              this.phoneData = result.data

              break
          }

        } else {
          message.destroy()
          message.error(result.data.msg)
        }
      })

    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 获取极验信息 
  @action.bound
  async fetchGTVerifyCode(option) {
    try {
      const result = await accountApi.getGTVerifyCode(option)
      runInAction(() => {
        this.GTVInfo = result
      })
      return result
    } catch (err) {
      return { success: true, data: { code: 'E100000' } }
      // runInAction(() => {
      //     console.log(err)
      // })
    }
  }

  // 获取新极验信息 
  @action.bound
  async fetchNewGTVerifyCode(option) {
    try {
      const result = await accountApi.getGTVerifyCode(option)

      runInAction(() => {
        this.GTVNewInfo = result
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }
  }

  // 激活账户
  @action.bound
  async fetchActivation(option) {
    globalStore.changeLoading(true)

    try {
      const result = await accountApi.getGTVerifyCode(option)

      runInAction(() => {
        if (result.success) {
          this.isActive = result.data
        }
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 忘记密码手机验证
  @action.bound
  async fetchPhoneVerification(option) {
    globalStore.changeLoading(true)

    try {
      const result = await accountApi.phoneVerification(option)

      runInAction(() => {
        if (result.success) {
          this.showSetPwdForm = true
          // Router.pushRoute(`/password/setpwd/${ApplyType.PHONE}`)
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 重置密码
  @action.bound
  async fetchPasswordReset(option) {
    globalStore.changeLoading(true)
    try {
      const result = await accountApi.passwordReset({ ...option })

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`重置密码成功`)

          setTimeout(() => Router.pushRoute(`/signin`), 2000)
        } else {
          message.destroy()
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 获取当前账户Client
  @action.bound
  async fetchGetClientCurrent(option, callback) {
    try {
      const param = { token, ...option }
      const result = await accountApi.getClientCurrent(param)

      runInAction(() => {
        if (result.success) {
          this.userClientInfo = result.data
          this.updateUserInfo(result.data)
        } else {
          if (result.data.code !== 'E100000' && result.data.msg !== 'Error Token') {
            message.destroy()
            message.error(result.data.msg)
          }
        }
        if (callback) callback(result)
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }
  }

  // 发送绑定邮箱邮件
  @action.bound
  async fetchEmailBind(option) {
    globalStore.changeLoading(true)

    try {
      const param = { token, ...option }
      const result = await accountApi.emailBind(param)

      runInAction(() => {
        if (result.success) {
          this.isEmailNextStep = result.data
        } else {
          message.error(result.data.msg)
        }
      })
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  @action.bound
  async fetchChangeEmailBind(option, callback) {
    globalStore.changeLoading(true)

    try {
      const result = await accountApi.changeEmailBind(option)

      runInAction(() => {
        message.destroy()
        if (result.success) {
          message.success('邮箱绑定成功')
        } else {
          message.error(result.data.msg)
        }
      })
      callback(result)
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }

    globalStore.changeLoading(false)
  }

  // 获取当前登录账户
  @action.bound
  async fetchChangePassword(option) {
    try {
      const param = { token, ...option }
      const result = await accountApi.changePassword(param)

      runInAction(() => {
        if (result.success) {
          message.destroy()
          message.success(`密码修改成功`)
        } else {
          message.destroy()
          message.error(result.data.msg || '密码修改失败')
        }
      })
      return result
    } catch (err) {
      runInAction(() => {
        console.log(err)
      })
    }
  }

  //发送验证码
  @action.bound
  async fetchPhoneBind(option) {
    try {
      const result = await accountApi.phoneBind(option)
      const ls = localStorage
      runInAction(() => {
        if (result.success) {
          this.phoneInfo = result.data
          ls.setItem('phoneData', result.data.token)
        } else {
          message.destroy()
          message.error(result.data.msg)
        }
      })
      return result
    } catch (err) {
      return { success: false, data: { code: 'E100000' } }
    }
  }

  // 验证修改手机号码
  @action.bound
  async fetchPhoneVeriBind(option) {
    try {
      const result = await accountApi.phoneVeriBind(option)
      if (result.success) {
        this.userClientInfo.phone = option.phone
        this.userClientInfo.mobilePhone = option.phone
      }
      return result

      // runInAction(() => {
      //     if(result.success) {
      //         if(option.type === PhoneType.OLDPHONE) {
      //             this.isPhoneNextStep = result.data
      //         } else if(option.type === PhoneType.NEWPHONE) {
      //             message.destroy()
      //             message.success(`手机修改成功`)
      //         }
      //     } else {
      //         message.destroy()
      //         message.error(result.data.msg)
      //     }
      // })
    } catch (err) {
      return { success: false, data: { code: 'E100000', msg: '' } }
    }
  }

  @action.bound
  async fetchActivateUser(option) {
    try {
      const result = await accountApi.activateUser(option)
      if (result.success) {
        // this.saveClientSigninInfo(result.data)
        this.saveActiveResult(result)

      }
      return result


      // if(option.host) {
      //     if(result.success) {
      //         return new Promise((resolve, reject) => {
      //             resolve(result.data)
      //         })
      //     } else {
      //         message.destroy()
      //         // message.error(result.data.msg)

      //         setTimeout(() => {
      //             window.location.href = '/signin'
      //         }, 500)
      //     }
      // } else {
      //     if(result.success) {
      //         message.success(`激活成功`)

      //         let tokenOptions = {}
      //         const hosts = window.location.host && (window.location.host).split('.')[0]

      //         tokenOptions = {
      //             expires: 30,
      //             domain: hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN,
      //             path: '/'
      //         }
      //         const token = result.data.token.toString()
      //         // const user = encodeURIComponent(JSON.stringify(result.data.user))

      //         const ls = window.localStorage

      //         this.updateUserInfo(result.data.user)
      //         jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions) 
      //         // jsCookie.set('user', JSON.stringify(result.data.user))
      //         cookie.set('mhauthorization', token, tokenOptions)
      //         ls.setItem('user', JSON.stringify(result.data.user))
      //     } else {
      //         message.destroy()
      //         message.error(result.data.msg)

      //         // setTimeout(() => {
      //         //     window.location.href = '/signin'
      //         // }, 500)
      //     }
      // }
    } catch (err) {
      return {}
    }
  }

  // server api
  // 获取当前登录账户
  @action.bound
  async fetchGetCurrent({ res, ctx, asPath, ...option }) {
    if (option.token) {
      try {
        const result = await accountApi.getCurrent(option)
        if (result.success) {
          this.userInfo = result.data
          this.updateUserInfo(result.data)
        }
        return result
      } catch (err) {
        return { success: false, data: {} }
      }
    }
  }

  @action.bound
  async fetchSetUserInfo(option) {
    try {
      const params = { token, ...option }
      const result = await accountApi.setUserInfo(params)
      message.destroy()
      if (result.success) {
        message.success(`资料修改成功`)
        // 刷新左侧数据
        this.fetchGetClientCurrent({}, null)
      } else {
        message.error(result.data.msg || '资料修改失败')
      }
      return result
    } catch (err) {
      message.destroy()
      message.error('资料修改失败')
      // console.log(err)
      return { success: false, data: { code: 'E100000' } }
    }
  }

  /* 注册邮件重发 */
  @action.bound
  async fetchSendEmail(option) {
    try {
      const params = { token, ...option }
      const result = await accountApi.sendEmail(params)

      if (result.success) {
        message.success(`邮件重新发送成功`)
      }
      return result
    } catch (err) {
      return { success: false, data: {} }
    }
  }

  /**
   * 发送激活邮件
   * @param option 
   */
  // @action.bound
  // async sendActiveEmail(option) {
  //     try {
  //         const param = { token, ...option }
  //         const response = await accountApi.sendEmail(param)
  //         return response
  //     } catch (error) {
  //         return {success: false, data: {}}
  //     }
  // }

  @action.bound
  async fetchOauthUrls(option) {
    try {
      const response = await accountApi.queryOauthUrls(option)

      return new Promise((resolve, reject) => {
        if (response.success) {
          resolve(response.data)
        } else {
          reject(response.data)
        }
      })
    } catch (error) {

    }
  }

  @action.bound
  async fetchVerifyBind({ isPromise, ...option }) {
    try {
      this.oauthBindData.isLoading = true
      let response = await accountApi.queryOauthAuthorize(option)

      this.oauthBindData.isLoading = false
      if (isPromise) {
        return new Promise((resolve, reject) => {
          if (response) {
            resolve(response)
          } else {
            reject(response)
          }
        })
      } else {
        this.oauthBindData = {
          ...this.oauthBindData,
          ...(response || {}),
        }
        // console.log('auth bind data', toJS(this.oauthBindData))
        if (response.success) {
          const data = response.data || {}
          if (data.token) {
            // 已绑定
            // message.error('登录成功')

            // this.oauthBindData = response || {}
            this.setSigninSuccess({ result: response, remindPwd: false })
          } else if ((data.data || {}).bind) {
            location.href = '/'
          } else if (data.error) {
            message.error(data.error)
            // this.oauthBindData = response || {}
          } else {
            // 未绑定
            //   this.oauthBindData = response || {}
          }
        } else {
          // this.oauthBindData = response || {}
          const data = response.data || {}
          if (data.code === 'E100007') {
            // 账号未激活

          } else {
            message.error(data.message)
          }
        }
      }
    } catch (error) {

    }

  }

  @action.bound
  async signinAndBind(option, callback) {
    let p = config.SOURCE_MEIHUA

    if (utils.getQueryString(`p`)) {
      p = utils.getQueryString(`p`)
    }

    globalStore.changeLoading(true)

    try {
      const { remindPwd, setFields, getFieldValue, ...rest } = option
      let result = await accountApi.loginAndBind({ ...rest, source: p })
      // result = {
      //     "success": false,
      //     "data": {
      //         "code": "E100007",
      //         "msg": "账号未激活",
      //         "data": {
      //             "email": "wwq1991email@163.com",
      //             "activeToken": "917056397284550f3e9ba7154c01afa1212b8574cba878cca212761f1679d97756264004b5bf6e1583b23b62f457accce885052cb68656bf6424ad89348cc898"
      //         }
      //     }
      // }
      if (result.success) {

        message.destroy()
        message.success('绑定成功')
        this.setSigninSuccess({ result, remindPwd })

      } else {
        const data = result.data || {}
        if (data.code === 'E100007') {
          this.oauthBindData = {
            ...this.oauthBindData,
            ...(result || {}),
          }
        }
        this.setSigninFailled({ result, remindPwd, setFields, getFieldValue })
      }
      if (callback) callback(result)
      // this.setSigninResult({result, remindPwd, setFields, getFieldValue})

      // if(result.success) {
      //     const expires = remindPwd ? 30 : 7
      //     const domain = config.COOKIE_MEIHUA_DOMAIN
      //     const token = result.data.token.toString()
      //     const user = encodeURIComponent(JSON.stringify(result.data.user))
      //     let url = decodeURIComponent(utils.getQueryString(`c`))
      //     let bf = ''


      //     if(utils.getQueryString(`bf`)) {
      //         bf = utils.getQueryString(`bf`)

      //         url = `${url}?bf=${bf}`
      //     }

      //     if(utils.getQueryString(`bf`) && utils.getQueryString(`p`)) {
      //         p = utils.getQueryString(`p`)

      //         url = `${url}&p=${p}`
      //     }

      //     const ls = window.localStorage 
      //     let tokenOptions = {}

      //     //TODO: 修复
      //     const hosts = window.location.host && (window.location.host).split('.')[0]

      //     tokenOptions = { 
      //         expires, 
      //         domain: hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN,
      //         path: '/' 
      //     }

      //     jsCookie.set(config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
      //     jsCookie.set('mhauthorization', token, tokenOptions)
      //     ls.setItem('user', JSON.stringify(result.data.user))
      //     jsCookie.set('user', JSON.stringify(result.data.user), tokenOptions)

      //     message.destroy()
      //     message.success('绑定成功')
      //     setTimeout(() => {
      //         if(url !== 'null' && url !== 'undefined' && !!url && url.indexOf('signin') <= -1) {
      //             window.location.href = url
      //         } else {
      //             window.location.href = `/`
      //         }
      //     }, 2000)
      // } else {
      //     switch(result.data.msg) {
      //         case '用户名不存在':
      //             setFields({
      //                 username: {
      //                     value: getFieldValue('username'),
      //                     errors: [new Error(result.data.msg)]
      //                 }
      //             })

      //             break
      //         case '密码输入不正确':
      //             setFields({
      //                 password: {
      //                     value: getFieldValue('password'),
      //                     errors: [new Error(result.data.msg)]
      //                 }
      //             })

      //             break
      //         default:
      //             message.destroy()
      //             message.error(result.data.msg)
      //     }
      // }  
    } catch (err) {
      if (callback) callback({ success: false, data: { code: 'E100002', msg: '绑定失败，请联系客服' }, err })
      // runInAction(() => {
      //     console.log(err)
      // })
    }

    globalStore.changeLoading(false)
  }


  // 注册绑定并登录
  @action.bound
  async signupAndBind(option, callback) {
    try {
      const result = await accountApi.registerAndBind({ ...option })

      if (result.success) {
        this.isRegister = true
        this.registerData = result.data
      } else {
        message.destroy()
        message.error(result.data.msg)
      }

      if (callback) callback(result)
    } catch (err) {
      if (callback) callback({ success: false, data: { code: 'E100002', msg: '绑定失败，请联系客服' }, err })
    }
  }

  @action.bound
  async fetchOauthBinds() {
    try {
      const response = await accountApi.queryOauthBinds()
      if (response.success) {
        this.oauthBinds = response.data || {}
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchDeleteOauth(option) {
    try {
      const response = await accountApi.deleteOauth(option)
      if (response.success) {
        this.oauthBinds = {
          ...this.oauthBinds,
          [option.type]: false,
        }
      } else {
        message.error(response.data.msg)
      }
    } catch (error) {

    }
  }

  @action.bound
  async fetchHotShots(option) {
    try {
      const response = await compositionApi.queryHotShots(option)
      if (option.host) {
        return new Promise((resolve, reject) => {
          if (response.success) {
            // this.hotShots = response.data || []
            this.updateHotShots(response.data || [])
            resolve(response.data)
          } else {
            this.updateHotShots([])
            resolve(response)
          }
        })
      } else {
        if (response.success) {
          // this.hotShots = response.data || []
          this.updateHotShots(response.data || [])
        } else {
          // this.hotShots = []
          this.updateHotShots([])
        }
      }
    } catch (error) {

    }
  }

}

export default new AccountStore()