import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Button, message, Spin } from 'antd'
import { CompositionTypes } from '@base/enums'


export interface Props {
  query: object
}

@inject(stores => {
  const { compositionStore } = stores.store
  return {
    compositionStore,
  }
})
@observer
export default class InviteContainer extends Component<Props> {
  state = {
    inviteStatus: 'loading',
    inviteData: {},
    error: '',

    confirmStatus: '',
  }

  componentDidMount() {
    this.verifyInvite()
  }

  verifyInvite() {
    const { query, compositionStore } = this.props
    const code = query.code
    if (code) {
      this.setState({inviteStatus: 'loading'})
      compositionStore.verifyMemberInvite({code}, (res) => {
        if (res.success) {
          this.setState({inviteData: res.data, inviteStatus: 'success'})
        } else {
          const msgStr = res.data.msg === 'ERROR CODE' ? '错误的code' : res.data.msg
          this.setState({error: msgStr, inviteStatus: 'error'})
        }
      })
    } else {
      this.setState({error: '错误的code', inviteStatus: 'error'})
    }
  }

  handleInviteConfirm = () => {
    const { query, compositionStore } = this.props
    const code = query.code
    this.setState({confirmStatus: 'laoding'})
    compositionStore.confirmMemberInvite({code}, (res) => {
      if (res.success) {
        this.setState({confirmStatus: 'success'});
        message.success('加入成功')
      } else {
        this.setState({confirmStatus: 'error'})
        message.error(res.data.msg)
      }
    })
  }

  render() {
    const { inviteData, inviteStatus, error, confirmStatus } = this.state
    
    const isLoading = inviteStatus === 'loading'
    const isSuccess = inviteStatus === 'success'
    const isError = inviteStatus === 'error'

    const isConfirmLoading = confirmStatus === 'laoding'
    const isConfirmSuccess = confirmStatus === 'success'

    const author = inviteData.author || {}
    const composition = inviteData.composition || {}

    return (
      <div className="display-container">
          <div className="display-content">
            <div className="display-info">
              <div className="display-info-icon">
                <img src="/static/images/logo_blue.svg" />
              </div>
              <div className="display-info-text">
                {isLoading && 
                <div className="invite-verify">
                  <div className="invite-loading">
                    <Spin />
                  </div>
                  <div className="invite-loading-text">
                    验证中...
                  </div>
                </div>}
                {isSuccess && 
                <div className="invite-intro">
                  <p>
                    梅花网创作者  
                    <a href={`/author/${author.code}`} target="_blank">{author.nickname}</a>  
                    发布的 
                    <a href={`/${composition.type === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${composition.id}`} target="_blank">{composition.title}</a> 
                    将您添加为共同创作者
                  </p>
                  <p>若同意成为共同创作者 点击下面按钮完成验证</p>
                </div>}
                {isError && 
                <div className="invite-error">
                  {error}
                </div>}
              </div>
            </div>
            <div className="footer">
              {isSuccess && 
              <Button 
                type="primary" 
                className="themes" 
                loading={isConfirmLoading}
                disabled={isConfirmSuccess}
                onClick={this.handleInviteConfirm}
                style={isConfirmSuccess ? {backgroundColor: '#BBBBBB', borderColor: '#BBBBBB'} : null}
              >{isConfirmSuccess ? '已同意' : '同意'}</Button>}
            </div>
          </div>
      </div>
    )
  }
}