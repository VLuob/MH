import { Component } from 'react'
import { Button } from 'antd'
import { filterEmail } from '@base/system/account'

interface Props {
    value: string,
    onSendEmail: any,
}

interface State {

}

export default class SendEmailComp extends Component<Props, State> {
    ReceiveEmail = e => {
        const { value } = this.props

        filterEmail(value, null)
    }

    render() {
        const { value, onSendEmail } = this.props

        return (
            <>
                <div className='value-meta'>
                    已向您的注册邮箱 {value} <br />
                    发送了一封验证邮件 请注意查收
                </div>
                <Button size='large' type='primary' className='forget-btn themes' onClick={this.ReceiveEmail}>
                    去邮箱接收邮件
                </Button>
                <p className='description'>
                    未收到邮件？
                    <span className='send-email' onClick={onSendEmail}>重新发送验证邮件</span>
                </p>
            </>
        )
    }
}