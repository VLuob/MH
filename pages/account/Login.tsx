import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { parseCookies } from 'nookies'
import { inject, observer } from 'mobx-react'
import { initializeStore } from '@stores'
import srvUtils from '@utils/srvutils'
import { composition as compositionSys } from '@base/system'
import { config } from '@utils'

import LoginForm from '@containers/account/login/LoginForm'
import HeadComponent from '@components/common/HeadComponent'
import AccountLayout from '@containers/account/AccountLayout'
import OAuthIcons from '@containers/account/login/OAuthIcons'



@inject(stores => {
  const { accountStore } = stores.store
  const { fetchGetClientCurrent } = accountStore

  return {
    fetchGetClientCurrent,
  }
})
@observer
export default class Login extends Component {
  static async getInitialProps(ctx) {
    const { req, res, query, asPath, mobxStore } = ctx
    const { accountStore, adStore } = mobxStore
    const pageProps = {}
    if (req && req.headers) {
      const host = req.headers.host
      const isMobile = srvUtils.isMobile(req)
      // const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
      // const c = query.c
      // if (token) {
      //     res.writeHead(307,{ Location: c ? c : '/'})
      //     res.end()
      // }
      if (!isMobile) {
        const placeMap = { 1: 0, 2: 4, 3: 8 } // 广告位置第1、5、9位
        const resAds = await adStore.fetchAdvertisement({ host, page_code: 'f_l_l', field_code: ['f_l_l_1', 'f_l_l_2', 'f_l_l_3'] })
        const resultHotShots = await accountStore.fetchHotShots({ host, limit: 9 })
        const resHotShots = compositionSys.mergeShotsAndAds({ shotsList: resultHotShots, adsData: resAds, placeMap })
        accountStore.updateHotShots(resHotShots)
        pageProps.resHotShots = resHotShots
      } else {
        accountStore.updateHotShots([])
      }
    }
    return { query, ...pageProps }
  }

  render() {
    const { resHotShots, query } = this.props
    return (
      <>
        <HeadComponent
          title={`登录-梅花网`}
          keywords=" "
          description=" "
        />
        <AccountLayout resHotShots={resHotShots}>
          <LoginForm query={query} />
          {/* <a className='direct' href='/signup'> 注册新账号 </a>
                    <OAuthIcons /> */}
        </AccountLayout>
      </>
    )
  }
}