import { Component } from 'react'
import { Form, Input, Button, message } from 'antd'

import SetPwdForm from '@components/account/SetPwdForm'
import { toJS } from 'mobx'

interface Props {
    phoneData: object
}
interface State {
    isDownCount: boolean,
    downCount: number
}

const seconds = 60 
class PhoneVeriForm extends Component<Props, State> {
    state = {
        isDownCount: false,
        downCount: seconds
    }

    componentDidMount() {
        // this.handleDownCount()
        this.setState(prevState => ({ isDownCount: !prevState.isDownCount }))
        this.calculateDownCount()
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { phoneData, fetchPhoneVerification } = this.props

        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err) {
                return
            }

            if(!values.verify) {
                message.destroy()
                message.error(`请输入验证码`)

                return 
            }

            fetchPhoneVerification({
                code: values.verify,
                ...phoneData
            })
        })
    }

    handleChange = e => {
        // console.log(`checked = ${e.target.checked}`)
    }

    handleDownCount = () => {
        this.setState(prevState => ({ isDownCount: !prevState.isDownCount }))

        this.calculateDownCount()

        this.props.fetchRetrievePwd({ ...this.props.phoneData })
    }

    calculateDownCount = () => {
        const timer = setInterval(() => {
            const { downCount } = this.state
            const downCounts = downCount - 1

            if(downCounts >= 0) {
                this.setState({ downCount: downCounts })
            } else {
                this.setState(prevState => ({ isDownCount: !prevState.isDownCount, downCount: seconds }))

                clearInterval(timer)
            }
        }, 1000)
    }

    public render() {
        const { isDownCount, downCount } = this.state
        const { getFieldDecorator } = this.props.form
        const { phoneData, showSetPwdForm, fetchPasswordReset } = this.props
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

        if(showSetPwdForm) {
            return (
                <SetPwdForm phoneData={phoneData}
                    fetchPasswordReset={fetchPasswordReset} />
            )
        } else {
            return (
                <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                    <Form.Item>
                        {getFieldDecorator('verify', {

                        })(
                            <div className='field veri-field'>
                                <Input id='pwd' size='large' type='text' placeholder='短信验证码' maxLength={12} />
                                <div className='send-verify-box'>
                                    {!isDownCount ? <Button className='send-verify' onClick={this.handleDownCount}>发送验证码</Button> :
                                        <Button disabled>重新发送({downCount}) S</Button>}
                                </div>
                                <label className='field-label' htmlFor='pwd'>短信验证码</label>
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
}

const WrappedPhoneVeriForm = Form.create({ name: 'phoneVerify' })(PhoneVeriForm)

export default WrappedPhoneVeriForm