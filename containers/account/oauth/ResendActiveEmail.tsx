import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Button, message } from 'antd'
import { filterEmail } from '@base/system/account'

interface Props {
    value: string,
    onSendEmail: any,
}

interface State {

}

@inject(stores => {
  const { accountStore } = stores.store
  return {
    accountStore
  }
})
@observer
export default class AccountNotActive extends Component<Props, State> {
  state = {
    sendLoading: false,
  }
  sendActiveEmail = e => {
    const { accountStore, email, verifyToken, handleSendSubmit } = this.props
    this.setState({sendLoading: true})
    accountStore.fetchSendEmail({email, verify_token: verifyToken}).then(res => {
      this.setState({sendLoading: false})
      if (res.success) {
        handleSendSubmit({email, verifyToken})
      } else {
        message.error(res.data.msg)
      }
    })

  }

  render() {
    const { email } = this.props
    const { sendLoading } = this.state

    return (
      <>
        <div className='value-meta'>
            您的注账户尚未激活, 请到注册邮箱里激活
        </div>
        <Button 
          size='large' 
          type='primary' 
          className='forget-btn themes' 
          loading={sendLoading}
          onClick={this.sendActiveEmail}
        >
            重新发送激活邮件
        </Button>
      </>
    )
  }
}