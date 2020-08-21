import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import classnames from 'classnames'
import { Form, Input, Row, Col, Checkbox, Button, message } from 'antd'

import OAuthIcons from './OAuthIcons'
import SendEmailComp from '@components/account/SendEmailComp'
import ResendActiveEmail from '../oauth/ResendActiveEmail'

const LoginType = {
    EMAIL: 1,
    PHONE: 2,
}


@inject(stores => {
    const { accountStore, globalStore } = stores.store
    const { ip } = globalStore
    const { loginFailInfo, fetchApinLogin, fetchUserSignIn } = accountStore

    return {
        accountStore,
        ip,
        loginFailInfo,
        fetchApinLogin,
        fetchUserSignIn,
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
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { remindPwd } = this.state
        const { ip, fetchApinLogin, fetchUserSignIn } = this.props

        this.props.form.validateFieldsAndScroll((err, values) => {
            const { username, password } = values
            const { setFields, getFieldValue } = this.props.form

            if (err) {
                return
            }

            fetchApinLogin({ username, password })
            this.setState({ loginLoading: true })
            fetchUserSignIn({ username, password, remindPwd, setFields, getFieldValue, ip }, (res) => {
                this.setState({ loginLoading: false })
                const resData = res.data || {}
                if (resData.code === 'E100007') {
                    const data = resData.data || {}
                    const verifyData = {
                        ...data,
                        verifyToken: data.activeToken,
                    }
                    this.setState({ verifyData, showType: 'active' })
                }
            })
        })
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
    render() {
        const { showType, verifyData, loginType } = this.state
        const { getFieldDecorator } = this.props.form
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