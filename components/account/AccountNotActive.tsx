import { Component } from 'react'
import { Button } from 'antd'
import { filterEmail } from '@base/system/account'

interface Props {
    value: string,
    onSendEmail: any,
}

interface State {

}

export default class AccountNotActive extends Component<Props, State> {
    receiveEmail = e => {
        const { value } = this.props

        filterEmail(value, null)
    }

    render() {
        const { email, onSendEmail } = this.props

        return (
            <>
                <div className='value-meta'>
                    已向您的注册邮箱尚未激活<br />
                    请到注册邮箱{email}里激活
                </div>
                <Button size='large' type='primary' className='forget-btn themes' onClick={this.receiveEmail}>
                    重新发送激活邮件
                </Button>
            </>
        )
    }
}