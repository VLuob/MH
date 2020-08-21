import { Component } from 'react'
import { Link, Route } from '@routes'
import { Button, Row, Col } from 'antd'
import srvUtils from '@utils/srvutils'
import { composition as compositionSys } from '@base/system'
import HeadComponent from '@components/common/HeadComponent'

import { ApplyType } from '@base/enums'
import AccountLayout from '@containers/account/AccountLayout'

export default class Forgotpwd extends Component {
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
        <HeadComponent title={`找回密码-梅花网`} />
        <AccountLayout resHotShots={resHotShots} >
          <h3 className='headline'>重置密码</h3>
          <Row>
            <Col span={24}>
              <Button size='large' type='primary' className='forget-btn themes'>
                {/* <Link route={`/password/${ApplyType.EMAIL}`}>
                                    <a>通过邮箱找回</a>
                                </Link> */}
                <a href={`/password/${ApplyType.EMAIL}`}>通过邮箱找回</a>
              </Button>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Button size='large' type='primary' className='forget-btn themes'>
                {/* <Link route={`/password/${ApplyType.PHONE}`}>
                                    <a>通过手机找回</a>
                                </Link> */}
                <a href={`/password/${ApplyType.PHONE}`}>通过手机找回</a>
              </Button>
            </Col>
          </Row>
        </AccountLayout>
      </>
    )
  }
}