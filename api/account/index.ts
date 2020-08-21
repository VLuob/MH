import { config, http } from '@utils'
import basic from '@base/system/basic'

const api = config.API_MEIHUA
const userApi = config.API_MEIHUA_UCENTER
const token = basic.token

export default {
    /**
     * 获取微信认证URL
     * @return {[type]} [description]
     */
    getWechatAuth() {
        return http.get(api + '/wx/auth2', {})
    },
    /**
     * 获取当前账户
     * @return {[type]} [description]
     */
    getClientCurrent: option => {
        return http.get(`${api}/user/current`, { token, ...option })
    },
    /**
     * 检查邮箱或者手机号是否已经存在
     * @return {[type]} [description]
     */
    userVerification: option => {
        return http.get(`${api}/user/verification`, { ...option })
    },
    /**
     * 用户注册
     * @return {[type]} [description]
     */
    userSignUp: option => {
        return http.post(`${api}/user/signup`, { ...option })
    },
    /**
     * 用户登录
     * @return {[type]} [description]
     */
    userSignIn: option => {
        return http.post(`${api}/user/signin`, { ...option })
    },
    /**
     * 用户登录附操作
     */
    apinLogin: option => {
        return http.post(`https://apin.meihua.info/u/login`, { ...option })
    },
    /**
     * 用户登出
     * @return {[type]} [description]
     */
    userLogout: token => {
        return http.get(`${api}/user/logout`, { token })
    },
    /**
     * 获取gt验证码
     * @return {[type]} [description]
     */
    getGTVerifyCode: () => { 
        return http.get(`${userApi}/gt?t=${+new Date()}`)
    },
    /**
     * 找回密码
     * @return {[type]} [description]
     */
    retrievePwd: option => {
        return http.post(`${api}/user/password-recovery`, option)
    },
    /**
     * 激活操作
     * @return {[type]} [description]
     */
    activateUser: (option) => {
        return http.get(`${api}/user/activation`, option)
    },
    /**
     * 忘记密码手机验证
     * @return {[type]} [description]
     */
    phoneVerification: option => {
        return http.post(`${api}/user/password-recovery/phone-verification`, option)
    },
    /**
     * 重置密码
     * @return {[type]} [description]
     */
    passwordReset: option => {
        return http.post(`${api}/user/password-reset`, option)
    },
    /**
     * 发送绑定邮箱邮件
     * @return {[type]} [description]
     */
    emailBind: option => {
        return http.post(`${api}/user/email-bind`, option)
    },

    /**
     * 绑定邮箱后修改用户的邮箱
     * @return {[type]} [description]
     */
    changeEmailBind: option => {
        return http.get(`${api}/user/email-bind`, option)
    },

    /**
     * 已登录账户修改密码
     * @return {[type]} [description]
     */
    changePassword: option => {
        return http.post(`${api}/user/password`, option)
    },
    /**
    * 发送手机验证码
    * @return {[type]} [description]
    */
    phoneBind: option => {
        return http.post(`${api}/user/phone-bind`, option)
    },  
    phoneVeriBind: option => {
        return http.get(`${api}/user/phone-bind`, { token, ...option  })
    },
    /**
     * 获取当前登录账户
     * @return {[type]} [description]
     */
    sendEmail: option => {
        return http.post(`${api}/user/register/email-resend`, option)
    },
    /**
     * 获取当前登录账户
     * @return {[type]} [description]
     */
    getCurrent: ({host, ...option}) => {
        return http.get(`${api}/user/current`, {token: option.token})
    },
    setUserInfo: option => {
        return http.post(`${api}/user/${option.id}`, option)
    },

    // 获取第三方登录url
    queryOauthUrls({host}) {
        return http.get(`${api}/user/oauth/urls`)
    },

    // 第三方账号绑定验证
    queryOauthAuthorize({host, ...option}) {
        return http.get(`${api}/user/oauth/authorize`, option)
    },

    // 获取账号绑定情况
    queryOauthBinds() {
        return http.get(`${api}/user/oauth/list/binds`, {token})
    },

    loginAndBind(option) {
        return http.post(`${api}/user/oauth/login/bind`, option)
    },
    
    registerAndBind(option) {
        return http.post(`${api}/user/oauth/signup/bind`, option)
    },

    deleteOauth(option) {
        return http.post(`${api}/user/oauth/delete`, {token, ...option})
    },

}