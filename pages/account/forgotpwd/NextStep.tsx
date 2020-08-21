import { Component } from 'react'
import { Button } from 'antd'

import { ApplyType } from '@base/enums'
import { inject, observer } from 'mobx-react'

import AccountLayout from '@containers/account/AccountLayout'
import PhoneVeriForm from '@components/account/PhoneVeriForm'

interface Props {
    value: string
}

interface State {
    type: string,
    value: string
}

@inject(stores => {
    const { accountStore } = stores.store
    const { phoneData, showSetPwdForm } = accountStore

    return {
        phoneData,
        showSetPwdForm
    }
})
@observer
export default class NextStep extends Component<Props, State> {
    static async getInitialProps({ query }) {
        return {
            ...query
        }
    }

    handleReceiveEmail = e => {
        // console.log(123)
    }

    handleSendEmail = e => {
        // console.log(456)
    }

    renderEmailContainer = value => (
        <>
            <div className='value-meta'>
                已向您的注册邮箱 {value} <br/>
                发送了一封验证邮件 请注意查收
            </div>
            <Button size='large' type='primary' className='forget-btn themes' onClick={this.handleReceiveEmail}>
                去邮箱接收邮件
            </Button>
            <p className='description'>未收到邮件？
                <span className='send-email' onClick={this.handleSendEmail}>重新发送验证邮件</span>
            </p>
        </>
    )

    renderPhoneContainer = value => (
        <>
            <div className='value-meta'> 已发送验证码到：{value} </div>
            <div className='other-box'>
                <PhoneVeriForm />
            </div>
        </>
    )

    render() {
        const { type, value, showSetPwdForm } = this.props
        const types = type === ApplyType.EMAIL ? '邮箱' : '手机'

        const EmailContainer = this.renderEmailContainer(value)
        const PhoneContainer = this.renderPhoneContainer(value)
        // const RegisterEmailContainer = this.renderRegisterEmailContainer(email)

        return (
            <AccountLayout>
                <h3 className='headline'>通过{types}找回密码</h3>
                <div className='other-box'>
                    {type === ApplyType.EMAIL 
                        ? EmailContainer : PhoneContainer}
                </div>
            </AccountLayout>
        )
    }
}