import { Component } from 'react'
import { message, Form, Input, Button } from 'antd'

import { ApplyType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import Geetest from '@components/features/Geetest'
import PhoneVeriForm from '@components/account/PhoneVeriForm'

@inject(stores => {
    const { accountStore } = stores.store
    const { GTVInfo, phoneData, showSetPwdForm, isPhoneNextStep, fetchRetrievePwd, 
        fetchPasswordReset, fetchGTVerifyCode, fetchPhoneVerification } = accountStore

    return {
        GTVInfo,
        phoneData,
        showSetPwdForm,
        isPhoneNextStep,
        fetchRetrievePwd,
        fetchGTVerifyCode,
        fetchPasswordReset,
        fetchPhoneVerification
    }
})
@observer
class PhoneForm extends Component {
    state = {
        remindPwd: false,
        confirmDirty: false,

        gtResult: null,
    }

    componentDidMount() {
        const { fetchGTVerifyCode } = this.props

        fetchGTVerifyCode()
    }

    handleGeetest = gtResult => this.setState({ gtResult })

    handleSubmit = (e) => {
        e.preventDefault()

        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err) {
                return
            }

            const { phone } = values
            const { gtResult } = this.state
            const { fetchRetrievePwd } = this.props

            if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
                fetchRetrievePwd({ phone, ...gtResult, type: ApplyType.PHONE })
            } else {
                message.destroy()
                message.error(`请先完成验证`)
            }
            // Router.pushRoute(`/password/nextstep/${ApplyType.PHONE}/${values.phone}`)
        })
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value

        this.setState({ confirmDirty: this.state.confirmDirty || !!value })
    }

    handleChange = e => {
        this.setState({ remindPwd: e.target.checked })
        // console.log(`checked = ${e.target.checked}`)
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

    render() {
        const { GTVInfo, phoneData, showSetPwdForm, isPhoneNextStep, 
            fetchPasswordReset, fetchRetrievePwd, fetchPhoneVerification } = this.props
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

        return (
            <>
                {!isPhoneNextStep ? 
                    <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <Form.Item>
                            {getFieldDecorator('phone', {
                                rules: [{
                                    pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                }, {
                                    required: true, message: '请输入手机号!'
                                }]
                            })(
                                <div className='field'>
                                    <Input id='phone' type='number' size='large' style={{ width: '100%' }} placeholder='手机' />
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
                    <>
                        <div className='value-meta'> 已发送验证码到：{phoneData.phone} </div>
                        <div className='other-box'>
                            <PhoneVeriForm phoneData={phoneData} 
                                showSetPwdForm={showSetPwdForm}
                                fetchRetrievePwd={fetchRetrievePwd}
                                fetchPasswordReset={fetchPasswordReset}
                                fetchPhoneVerification={fetchPhoneVerification} />
                        </div>
                    </>
                }
            </>
        )
    }
}

const WrappedPhoneForm = Form.create({ name: 'phone' })(PhoneForm)

export default WrappedPhoneForm