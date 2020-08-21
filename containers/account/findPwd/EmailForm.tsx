import { Component } from 'react'
import { message, Form, Input, Button } from 'antd'

import { ApplyType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import Geetest from '@components/features/Geetest'
import SendEmailComp from '@components/account/SendEmailComp'

interface Props {
    form: any,
    GTVInfo: object,
    fetchRetrievePwd: any,
    fetchGTVerifyCode: any,
    isEmailNextStep: boolean,
}

interface State {

}

let defaultEmail = ''
@inject(stores => {
    const { accountStore } = stores.store
    const { GTVInfo, isEmailNextStep, fetchRetrievePwd, fetchGTVerifyCode } = accountStore

    return {
        GTVInfo,
        isEmailNextStep,
        fetchRetrievePwd,
        fetchGTVerifyCode,
    }
})
@observer
class EmailForm extends Component<Props, State> {
    state = {
        remindPwd: false,
        confirmDirty: false,
        gtResult: null,
    }

    async componentDidMount() {
        const { fetchGTVerifyCode } = this.props

        fetchGTVerifyCode()
    }

    handleGeetest = gtResult => {
        this.setState({ gtResult })
    }

    handleSubmit = (e) => {
        e.preventDefault()

        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err) {
                return
            }

            const { email } = values
            const { gtResult } = this.state
            const { fetchRetrievePwd } = this.props

            if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
                defaultEmail = email
                fetchRetrievePwd({ email, ...gtResult, type: ApplyType.EMAIL })
            } else {
                message.destroy()
                message.error(`请先完成验证`)
            }

            //TODO: 处理忘记密码接口
            // Router.pushRoute(`/password/nextstep/${ApplyType.EMAIL}/${values.email}`)
        })
    }

    handleReceiveEmail = e => {
        // console.log(123)
    }

    handleSendEmail = e => {
        const { fetchRetrievePwd } = this.props
        // console.log(defaultEmail)
        fetchRetrievePwd({ email: defaultEmail, type: ApplyType.EMAIL })
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

        if(value && value !== form.getFieldValue('password')) {
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

    render() {
        const { GTVInfo, isEmailNextStep } = this.props
        const { getFieldValue, getFieldDecorator } = this.props.form
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

        return (
            <>
                {!isEmailNextStep ? 
                    <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <Form.Item>
                            {getFieldDecorator('email', {
                                //TODO: 加一组邮箱已被人注册的功能
                                rules: [{
                                    type: 'email', message: '邮箱格式不正确!'
                                }, {
                                    required: true, message: '请输入邮箱!'
                                }]
                            })(
                                <div className='field'>
                                    <Input id='emailAndUser' size='large' placeholder='请输入邮箱' />
                                    <label className='field-label' htmlFor='emailAndUser'>邮箱</label>
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
                        <Form.Item>
                            <Button style={{ marginTop: '16px' }} size='large' type='primary' 
                                className='forget-btn themes' htmlType='submit'>
                                下一步
                                {/* <a href='/forgotpwd/email/nextStep'>下一步</a> */}
                            </Button>
                        </Form.Item>
                    </Form> :
                    <SendEmailComp value={getFieldValue('email')} 
                        onSendEmail={this.handleSendEmail} />
                }
            </>
        )
    }
}

const WrappedEmailForm = Form.create({ name: 'email' })(EmailForm)

export default WrappedEmailForm