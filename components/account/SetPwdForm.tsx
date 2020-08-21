import { Component } from 'react'
import jsCookie from 'js-cookie'
import { utils } from '@utils'

import { Form, Input, Button } from 'antd'

interface Props {
    form: any,
    phoneData: object,
    fetchPasswordReset: any
}

interface State {
    savePwd: string
}

class SetPwdForm extends Component<Props, State> {
    state = {
        savePwd: ''
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { phoneData, fetchPasswordReset } = this.props
        const activation_token = utils.getUrlParam('token') || phoneData.token
        
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err) {
                const type = jsCookie.get('setPwdType')
                const param = { type, password: values.password, activation_token, ...phoneData }

                fetchPasswordReset(param)

                jsCookie.remove('setPwdType')
            }
        })
    }

    validateToPassword = (rule, value, callback) => {
        const { setFields, getFieldValue } = this.props.form

        if(getFieldValue('comfirmpwd')) {
            if(value !== getFieldValue('comfirmpwd')) {
                setFields({
                    comfirmpwd: {
                        value: getFieldValue('comfirmpwd'),
                        errors: [new Error('两次输入的密码不一致')]
                    }
                })
            } else {
                setFields({ comfirmpwd: {
                    value: getFieldValue('comfirmpwd')
                }})
            }
        }

        callback()
    }

    validateToComfirmPwd = (rule, value, callback) => {
        const { getFieldValue } = this.props.form

        if(value && value !== getFieldValue('password')) {
            callback(`两次输入的密码不一致！`)
        }

        callback()
    }

    render() {
        const { getFieldDecorator } = this.props.form

        const formItemLayout = {
            labelCol: {
                xs: { span: 24 },
                sm: { span: 24 },
            },
            wrapperCol: {
                // xs: { span: 12, offset: 6 },
                // sm: { span: 12, offset: 6 },
            },
        }
        const tailFormItemLayout = {
            wrapperCol: {
                // xs: { span: 12, offset: 6 },
                // sm: { span: 12, offset: 6 },
            },
        }

        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('password', {
                        //TODO: 加一组邮箱已被人注册的功能
                        rules: [{
                            pattern: new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/, 'gi'), message: '密码长度为6-16位，必须为字母加数字'
                        }, {
                            required: true, message: '请输入密码!',
                        }, {
                            validator: this.validateToPassword
                        }],
                    })(
                        <div className='field'>
                            <Input id='pwd' size='large' type='password' placeholder='设置新密码' />
                            <label className='field-label' htmlFor='pwd'>密码</label>
                        </div>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('comfirmpwd', {
                        rules: [{
                            // pattern: new RegExp(/^(?![0-9]+$)(?![a-zA-Z]+$)[0-9A-Za-z]{6,16}$/, 'gi'), message: '密码长度为6-16位，必须为字母加数字'
                        }, {
                            required: true, message: '请再次输入密码!',
                        }, {
                            validator: this.validateToComfirmPwd,
                        }]
                    })(
                        <div className='field'>
                        <Input id='comfirmpwd' size='large' type='password' placeholder='再次输入密码' />
                            <label className='field-label' htmlFor='comfirmpwd'>再次输入密码</label>
                        </div>
                    )}
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button size='large' type='primary' htmlType='submit' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                </Form.Item>
            </Form>
        )
    }
}

const WrappedSetPwdForm = Form.create({ name: 'setPwd' })(SetPwdForm)

export default WrappedSetPwdForm