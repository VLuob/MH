import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import moment from 'moment'
import { Avatar, Modal } from 'antd'

import weiboSvg from '@static/images/account/weibo.svg'
import mingdaoSvg from '@static/images/account/mingdao.svg'
import qqSvg from '@static/images/account/qq.svg'
import weixinSvg from '@static/images/account/weixin.svg'
import accountStore from '@stores/account/accountStore';

const oauths = [
  {id: '1', key: 'weibo', name: '微博登录', btnName: '点击绑定微博账号', icon: weiboSvg},
  {id: '5', key: 'wechat', name: '微信登录', btnName: '微信扫一扫绑定', icon: weixinSvg},
  {id: '2', key: 'qq', name: 'qq登录', btnName: '点击绑定QQ账号', icon: qqSvg},
  {id: '3', key: 'mingdao', name: '明道登录', btnName: '点击绑定明道账号', icon: mingdaoSvg},
]

// const oauthUrls = {
//   1: `https://api.weibo.com/oauth2/authorize?client_id=2549043541&redirect_uri=${currDomain}/oauth/weibocallback&response_type=code&state=cc6771eb-2902-429d-b506-a749a4f242e5`,
//   2: `https://graph.qq.com/oauth2.0/authorize?client_id=101246240&redirect_uri=${currDomain}/oauth/qqcallback&response_type=code&state=e3531d51914036a7f42d8aa1d81aaac5&scope=get_user_info`,
//   3: `https://api.mingdao.com/oauth2/authorize?app_key=99DAF9B19D49194FB812D96922BBD&redirect_uri=${currDomain}/oauth/mingdaocallback`,
//   5: `https://open.weixin.qq.com/connect/qrconnect?appid=wxc8f6c116420e8a2d&redirect_uri=${currDomain}%2Foauth%2Fweixincallback&response_type=code&scope=snsapi_login&state=d3141076-c480-4b14-9f34-e0927021be26#wechat_redirect`
// }

@inject(stores => {
  const { accountStore } = stores.store
  const { oauthBinds } = accountStore

  return {
    accountStore,
    oauthBinds,
  }
})
@observer
export default class OAuthContainer extends Component {

  state = {
    oauthUrls: {},

    isBindModalVisible: false,
  }

  componentDidMount() {
    this.requestUrls()
    this.requestBinds()
  }


  async requestUrls() {
    const { accountStore } = this.props
    const oauthUrls = await accountStore.fetchOauthUrls({}) || {}
    this.setState({oauthUrls})
  }

  requestBinds() {
    const { accountStore } = this.props
    accountStore.fetchOauthBinds()
  }

  handleDeleteBind = (type) => {
    Modal.confirm({
      title: '是否确认解除绑定？',
      okText: '确认',
      cancelText: '取消',
      onOk: () => {
        const { accountStore } = this.props
        accountStore.fetchDeleteOauth({type})
      }
    })
  }

  handleBindConfirm = (e) => {
    Modal.confirm({
      title: '确认绑定',
      content: '是否绑定成功？',
      maskClosable: false,
      okText: '绑定成功',
      cancelText: '绑定未成功',
      onOk: () => {
        this.requestBinds()
      }
    })
  }

  render() {
    const { oauthBinds } = this.props
    const { oauthUrls, isBindModalVisible } = this.state

    return (
      <>
        <div className="user-comment-container">
            <ul className="user-oauth-list">
              {oauths.map(item => (
                <li className="oauth-item" key={item.id}>
                  <div className="icon">
                    <Avatar src={item.icon}  size={86} />
                  </div>
                  <div className="name">
                    {!!oauthBinds[item.id] ? oauthBinds[item.id] : '未绑定'}
                  </div>
                  {!!oauthBinds[item.id] 
                  ? <a className={`btn ${item.key} bind`} onClick={e => this.handleDeleteBind(item.id)} >
                      解除绑定
                    </a>
                  : <a className={`btn ${item.key}`} href={oauthUrls[item.id]} target="_blank" onClick={this.handleBindConfirm}>
                    {item.btnName}
                  </a>}
                </li>
              ))}
            </ul>
        </div>
      </>
    )
  }
}