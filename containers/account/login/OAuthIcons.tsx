import { Component } from 'react'

import { Row, Col } from 'antd'

import accountStore from '@stores/account/accountStore';

import LineContentWidget from '@components/widget/common/LineContentWidget'

import { config } from '@utils'

const weiboSvg = '/static/images/account/weibo.svg'
const mingdaoSvg = '/static/images/account/mingdao.svg'
const qqSvg = '/static/images/account/qq.svg'
const weixinSvg = '/static/images/account/weixin.svg'


const oauths = [
  {key: '1', name: '微博登录', icon: weiboSvg},
  {key: '5', name: '微信登录', icon: weixinSvg},
  {key: '2', name: 'qq登录', icon: qqSvg},
  {key: '3', name: '明道登录', icon: mingdaoSvg},
]



export default class OAuthIcons extends Component {
  state = {
    oauthUrls: {}
  }

  componentDidMount() {
    this.requestUrls()
    // this.testInitUrls()
  }

  testInitUrls() {
    const currDomain = encodeURIComponent(location.origin)
    const urls = {
      1: `https://api.weibo.com/oauth2/authorize?client_id=2549043541&redirect_uri=${currDomain}/oauth/weibocallback&response_type=code&state=cc6771eb-2902-429d-b506-a749a4f242e5`,
      2: `https://graph.qq.com/oauth2.0/authorize?client_id=101246240&redirect_uri=${currDomain}/oauth/qqcallback&response_type=code&state=e3531d51914036a7f42d8aa1d81aaac5&scope=get_user_info`,
      3: `https://api.mingdao.com/oauth2/authorize?app_key=99DAF9B19D49194FB812D96922BBD&redirect_uri=${currDomain}/oauth/mingdaocallback`,
      5: `https://open.weixin.qq.com/connect/qrconnect?appid=wxc8f6c116420e8a2d&redirect_uri=${currDomain}%2Foauth%2Fweixincallback&response_type=code&scope=snsapi_login&state=d3141076-c480-4b14-9f34-e0927021be26#wechat_redirect`
    }
    this.setState({oauthUrls: urls})
  }

  async requestUrls() {
    const oauthUrls = await accountStore.fetchOauthUrls({}) || {}
    this.setState({oauthUrls})
  }

  render() {
    const { oauthUrls } = this.state

    return (
      <>
        <LineContentWidget content={`第三方账号登录`} />
        <div className='other-login-way'>
            <Row type='flex' style={{justifyContent: 'center'}}>
                {oauths.map(item => (
                    <Col key={item.key} span={6}>
                        <div className='imgbox'>
                            <a href={oauthUrls[item.key]}>
                                <img src={item.icon} alt={item.name} />
                            </a>
                        </div>
                    </Col>
                ))}
            </Row>
        </div>
      </>
    )
  }
}