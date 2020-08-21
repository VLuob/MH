import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import { Link } from '@routes'
import { ApplyType } from '@base/enums'
import { Form, Input, Button, message } from 'antd' 
import { filterEmail } from '@base/system/account'
import SendEmailComp from '@components/account/SendEmailComp'
import Geetest from '@components/features/Geetest'

import { cookie, config } from '@utils'
// const { cookie, config } = require('@utils')

interface Props {
    form: any,
    isRegister: boolean,
    signupAndBind: any,
    fetchUserVerification: any
}

interface State {

}

let email = ''
@inject(stores => {
    const { accountStore, globalStore } = stores.store
    const { referrerStore, ip } = globalStore
    const { isRegister, registerData, oauthBindData, fetchSendEmail, signupAndBind, fetchUserVerification, fetchGTVerifyCode, resetGTVInfo, GTVInfo } = accountStore

    return {
        ip,
        referrerStore,
        isRegister,
        registerData,
        fetchSendEmail,
        signupAndBind,
        fetchUserVerification,
        fetchGTVerifyCode,
        resetGTVInfo,
        GTVInfo,
        oauthBindData,
    }
})
@observer
class RegisterForm extends Component<Props, State> {
    state = {
        confirmDirty: false,
        seconds: 30,
        gtResult: null,
        bindLoading: false,
    }

    componentDidMount() {
        const { fetchGTVerifyCode, GTVInfo } = this.props
        if (!GTVInfo.success) {
            fetchGTVerifyCode()
        }
    }    

    componentWillUnmount() {
        const { resetGTVInfo } = this.props
        resetGTVInfo()
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

    handleRegisterReceiveEmail = e => {
        filterEmail(email, null)
    }

    handleRegisterSendEmail = e => {
        const { seconds } = this.state
        const { registerData, fetchSendEmail } = this.props

        if(seconds > 0) {
            message.destroy()
            message.info(`${seconds}秒后可以再次点击重发, 请${seconds}秒后继续操作`)
        } else {
            fetchSendEmail({ verify_token: registerData.verifyToken, email: email })
            this.setState({ seconds: 30 }, () => {
                this.handleCountDown()
            })
        }
    }

    getRefSource = () => cookie.get(config.COOKIE_MEIHUA_REF_SOURCE) || 'meihua'

    handleGeetest = gtResult => this.setState({ gtResult })

    handleSubmit = (e) => {
        e.preventDefault() 
        
        this.props.form.validateFieldsAndScroll((err, values) => {
            // const source = this.getRefSource()
            
            if(!err) {
                const { signupAndBind, oauthBindData, referrerStore, ip, query } = this.props
                const { gtResult } = this.state
                email = values.email
                if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
                    const vData = (oauthBindData.data || {}).data || {}
                    const expire = vData.expire
                    const openId = vData.openId
                    const oauthToken = vData.token
                    const passName = vData.passName
                    const type = vData.socialType

                    email = values.email
                    this.setState({bindLoading: true})
                    const param = { ...values, expire, openId, oauthToken, passName, type, ip, ...gtResult }
                    if (referrerStore) {
                        param.source = `meihua-${referrerStore}`
                    } else if (query.p) {
                        param.sourcde = query.p
                    } else {
                        param.source = config.SOURCE_MEIHUA
                    }
                    signupAndBind(param, (res) => {
                        this.setState({bindLoading: false})
                        if (!res.success) {
                            message.error(res.data.msg)
                        }
                    })
                    this.handleCountDown()
                } else {
                    message.destroy()
                    message.error(`请先完成验证`)
                }
                
            }
        }) 
    }

    handleEmailBlur = e => {
        const value = e.target.value    
        const { setFields, getFieldValue, getFieldError } = this.props.form
        const { fetchUserVerification } = this.props

        if(e.target.value && !Array.isArray(getFieldError(`email`))) {
            fetchUserVerification({ email: value, type: ApplyType.EMAIL, setFields, getFieldValue })
        }
    }

    // handlePhoneBlur = e => {
    //     const value = e.target.value
    //     const { getFieldError } = this.props.form
    //     const { fetchUserVerification } = this.props

    //     if(e.target.value && !Array.isArray(getFieldError(`phone`))) {
    //         fetchUserVerification({ phone: value, type: ApplyType.PHONE })
    //     }
    // }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form 

        if(value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!') 
        } else {
            callback() 
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form 

        if(value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true }) 
        }

        callback() 
    }
    
    render() {
      const { form, onToLogin, isRegister, GTVInfo, oauthBindData } = this.props
    const { getFieldDecorator, getFieldValue } = form 
    const { bindLoading } = this.state

    const formItemLayout = {
        labelCol: {
            xs: { span: 24 },
            sm: { span: 24 },
        },
        // wrapperCol: {
        //     xs: { span: 12, offset: 6 },
        //     sm: { span: 12, offset: 6 },
        // },
    } 
    const tailFormItemLayout = {
        // wrapperCol: {
        //     xs: { span: 12, offset: 6 },
        //     sm: { span: 12, offset: 6 },
        // },
    } 

    // console.log('auth', toJS(oauthBindData))

    return (
        <>
            {!isRegister ? 
                <>
                  <div className="login-bind-container">
                    <div className="sign-top-intro">绑定已有梅花网账户</div>
                    <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <Form.Item>
                            {getFieldDecorator('email', {
                                //TODO: 加一组邮箱已被人注册的功能
                                rules: [
                                    {
                                        type: 'email', message: '邮箱格式不正确!'
                                    }, {
                                        required: true, message: '请输入邮箱!'
                                    },
                                    // {
                                    //     validator: this.validateToEmail
                                    // }
                                ]
                            })(
                                <div className='field'>
                                    <Input id='email' size='large' placeholder='邮箱' onBlur={this.handleEmailBlur} />
                                    <label className='field-label' htmlFor='email'>邮箱</label>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('password', {
                                rules: [{
                                    pattern: new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/, 'gi'), message: '密码长度为6-16位，必须为字母加数字'
                                }, {
                                    required: true, message: '请输入密码!',
                                }, {
                                    // validator: this.validateToNextPassword,
                                }],
                            })(
                                <div className='field'>
                                    <Input id='pwd' size='large' type='password' placeholder='密码' />
                                    <label className='field-label' htmlFor='pwd'>密码</label>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('name', {
                                rules: [{ required: true, message: '请输入姓名!', whitespace: true }],
                            })(
                                <div className='field'>
                                    <Input id='name' size='large' placeholder='姓名' />
                                    <label className='field-label' htmlFor='name'>姓名</label>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('phone', {
                                rules: [{
                                    pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                }, {
                                    required: true, message: '请输入手机号!'
                                }]
                            })(
                                <div className='field'>
                                    <Input id='phone' type='number' size='large' style={{ width: '100%' }}
                                        placeholder='手机' />
                                    <label className='field-label' htmlFor='phone'>手机</label>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('company', {
                                rules: [{ required: true, message: '请输入公司名称!' }],
                            })(
                                <div className='field'>
                                    <Input id='company' size='large' style={{ width: '100%' }} placeholder='公司' />
                                    <label className='field-label' htmlFor='company'>公司</label>
                                </div>
                            )}
                        </Form.Item>
                        <Form.Item>
                            {getFieldDecorator('job', {
                                rules: [{ required: true, message: '请输入职务名称!' }],
                            })(
                                <div className='field'>
                                    <Input id='post' size='large' placeholder='职务' />
                                    <label className='field-label' htmlFor='post'>职务</label>
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
                                        width='100%' />}
                            </div>
                        </Form.Item>
                        <Form.Item {...tailFormItemLayout}>
                            <Button 
                                size='large' 
                                type='primary' 
                                htmlType='submit' 
                                className='themes' 
                                loading={bindLoading}
                                style={{ borderRadius: '3px', border: 'none', outline: 'none' }}
                            >注册绑定并登陆</Button>
                        </Form.Item>
                    </Form>
                    <p className='description'>
                        已有账号，
                    {/* <Link route='/signin'>立即登录</Link> */}
                    <a className='direct' onClick={onToLogin} >立即登录</a>
                    </p>
                  </div>
                </> : 
                <div className='other-box'>
                    <SendEmailComp 
                        value={getFieldValue(`email`)}
                        onSendEmail={this.handleRegisterSendEmail}
                    />
                </div>
            }
        </>
      ) 
    }
}

const WrappedRegisterForm = Form.create({ name: 'register' })(RegisterForm) 

export default WrappedRegisterForm