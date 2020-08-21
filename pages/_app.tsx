import '@babel/polyfill'
import App, { Container } from 'next/app'
import Head from 'next/head'
import { Provider } from 'mobx-react'
import md5 from 'md5'
import { utils, config } from '@utils'
import srvUtils from '@utils/srvutils'
// import NextSeo from 'next-seo'
// import Head from 'next/head'
// import { WithUserAgentProps, withUserAgent } from 'next-useragent'

import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { toJS } from 'mobx'
import { LocaleProvider, ConfigProvider } from 'antd'
import zh_CN from 'antd/lib/locale-provider/zh_CN';
// import zhCN from 'antd/es/locale/zh_CN'

// import SEO from '../next-seo.config'
import { initializeStore } from '@stores'
import { wxReplaceHistory } from '@base/system'

import Containers from '@containers'
import Layout from '@containers/layout/Layout'
import HeadComponent from '@components/common/HeadComponent'
import CommonHeader from '@containers/common/GlobalHeader'
import ReturnTopComp from '@containers/common/ReturnTopComp'
import GlobalFixedActionButtons from '@containers/common/GlobalFixedActionButtons'
import { noHeadList, subFooterList } from '@constants/common/noList'
import PopupModal from '@components/common/PopupModal'
import BottomAdBox from '@containers/common/BottomAdBox'
import CommonFooter from '@containers/common/CommonFooter'
import CommonSubFooter from '@components/common/CommonSubFooter'
import LetterChat from '@containers/usercenter/letter/LetterChat'
// import EnquiryModal from '@containers/usercenter/letter/EnquiryModal'
import EnquiryModal from '@containers/enquiry/EnquiryModal'
import BottomTabBar from '@containers/common/BottomTabBar'

import '../less/index.less'


export default class MyApp extends App {
  state = {
    obstacleList: [{ id: -1, link: '', image: '' }],
    globalBottomAdItem: { id: null, link: '', image: '' },
    homeBottomAdItem: { id: null, link: '', image: '' },
  }

  static async getInitialProps(appContext) {
    const { req, res, query, asPath } = appContext.ctx
    const mobxStore = initializeStore()
    const { homeStore, globalStore, accountStore, adStore } = mobxStore
    const { fetchGetCurrent, updateUserInfo } = accountStore
    const { fetchGetAdvertisement } = homeStore
    const { updateClientCode, fetchGetClientCode, updateNavTipShow } = globalStore
    let appProps: any = {}

    appContext.ctx.mobxStore = mobxStore

    if (req && req.headers) {
      const host = req.headers.host
      // const hosts = host.split('.')[0] 
      // const cookies = req.headers.cookie 
      // const token = (cookies && jsHttpCookie.parse(cookies)) ? jsHttpCookie.parse(cookies)[config.COOKIE_MEIHUA_TOKEN] : ''
      // const userAgent = req ? req.headers['user-agent'] : navigator.userAgent
      // console.log('userAgent', utils.userAgent().isWebkit(userAgent), req)
      const currentCookies = parseCookies(appContext.ctx)
      const token = currentCookies[config.COOKIE_MEIHUA_TOKEN]
      let clientCode = currentCookies[config.COOKIE_MEIHUA_CLIENT_CODE]
      let referrerSource = query.ref

      if (referrerSource) {
        globalStore.saveReferrerSource(referrerSource)
        // 保存会话，退出浏览器既失效
        setCookie(appContext.ctx, config.COOKIE_MEIHUA_REFERRER_SOURCE, referrerSource, {
          // maxAge: 30 * 24 * 60 * 60,
          domain: config.COOKIE_MEIHUA_DOMAIN,
          path: '/',
        })
      } else {
        referrerSource = currentCookies[config.COOKIE_MEIHUA_REFERRER_SOURCE]
        if (referrerSource) {
          globalStore.saveReferrerSource(referrerSource)
        }
      }

      const navTipShow = currentCookies['meihua_nav_tooltip']
      updateNavTipShow(Boolean(navTipShow))

      const ip = srvUtils.getIp(req)
      const isMobile = srvUtils.isMobile(req)
      globalStore.saveIp(ip)
      globalStore.setMobileScreen(isMobile)

      if (!clientCode || clientCode === 'null' || clientCode === 'undefined' || clientCode.length < 30 || clientCode.length > 35) {
        // const ip = srvUtils.getIp(req)
        const t = String(new Date().getTime())
        const codeParam = { r: 0, d: 1, referer: '', ip, t, s: md5(t) }
        let clientRes = await fetchGetClientCode(codeParam)
        clientCode = clientRes.success ? clientRes.data : ''
        if (!clientCode || clientCode === 'null') {
          clientRes = await fetchGetClientCode(codeParam)
          clientCode = clientRes.success ? clientRes.data : ''
        }
        setCookie(appContext.ctx, config.COOKIE_MEIHUA_CLIENT_CODE, clientCode, {
          maxAge: 30 * 24 * 60 * 60,
          domain: config.COOKIE_MEIHUA_DOMAIN,
          path: '/',
        })
      }
      appProps.clientCode = clientCode

      updateClientCode(clientCode)

      if (token) {
        // 排除登录注册页
        if (!['/signin', '/signup'].some(path => asPath.indexOf(path) === 0)) {
          const param = { res, token, asPath, ctx: appContext.ctx }
          const currentResult = await fetchGetCurrent(param)
          if (!currentResult.success) {
            appProps.userInfo = {}
            // const hosts = host.split('.')[0] 
            const tokenOptions = {
              maxAge: -1,
              domain: config.COOKIE_MEIHUA_DOMAIN,
              // domain: hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN,
              path: '/'
            }
            destroyCookie(appContext.ctx, config.COOKIE_MEIHUA_TOKEN, tokenOptions)
            delete currentCookies[config.COOKIE_MEIHUA_TOKEN]
            const currentCookiesStr = Object.keys(currentCookies).map(k => (`${k}=${currentCookies[k]}`)).join('; ')
            appContext.ctx.req.headers.cookie = currentCookiesStr
            // console.log('destory token get', parseCookies(appContext.ctx, config.COOKIE_MEIHUA_TOKEN)[config.COOKIE_MEIHUA_TOKEN])
          } else {
            appProps.userInfo = currentResult.data || {}
          }
        }

      } else {
        // 清空缓存数据
        updateUserInfo({})
      }
    }

    let appProp = await App.getInitialProps(appContext)

    appProps = { ...appProps, ...appProp }
    const cookieCtxs = parseCookies(appContext.ctx)
    const popUpState = cookieCtxs.popUpState
    const bottomAdState = cookieCtxs[`bottom_ad_p_g`]
    const homeBottomAdState = cookieCtxs[`bottom_ad_p_h`]

    // FIXME: pushRoute的时候无法获取request 
    if (req && req.headers) {
      const host = req.headers.host

      // 拦路虎广告
      const obstacleResult = await fetchGetAdvertisement({ host, page_code: `t` })
      const obstacleData = obstacleResult.success ? obstacleResult.data : { t: [{ id: -1, link: '', image: '' }] }
      const obstacleList = obstacleData[`t`] || [{ id: -1, link: '', image: '' }]
      appProps.obstacleList = obstacleList

      const globalBottomAdResult = await fetchGetAdvertisement({ host, page_code: 'p_g' })
      const globalBottomAdData = globalBottomAdResult.success ? globalBottomAdResult.data : { 'p_g': [{ id: null, link: '', image: '', gmtModified: null }] }
      const globalBottomAdList = globalBottomAdData[`p_g`] || [{ id: null, link: '', image: '' }]
      appProps.globalBottomAdItem = globalBottomAdList[0] || {}
      // console.log('gmtModified',appProps.globalBottomAdItem.gmtModified)

      if (asPath === '/') {
        const homeBottomAdResult = await fetchGetAdvertisement({ host, page_code: 'p_h' })
        const homeBottomAdData = homeBottomAdResult.success ? homeBottomAdResult.data : { 'p_h': [{ id: null, link: '', image: '', gmtModified: null }] }
        const homeBottomAdList = homeBottomAdData[`p_h`] || [{ id: null, link: '', image: '' }]
        appProps.homeBottomAdItem = homeBottomAdList[0] || {}
      }
    }

    return {
      asPath,
      popUpState,
      bottomAdState,
      homeBottomAdState,
      ...appProps,
      initialMobxState: mobxStore,
    }
  }

  constructor(props) {
    super(props)

    const isServer = !process.browser

    this.mobxStore = isServer ? props.initialMobxState : initializeStore(props.initialMobxState)
  }

  componentDidMount() {
    const { obstacleList, globalBottomAdItem, homeBottomAdItem } = this.props

    if (obstacleList && obstacleList.length > 0) {
      this.setState({ obstacleList })
    }
    if (homeBottomAdItem) {
      this.setState({ homeBottomAdItem })
    }
    if (globalBottomAdItem) {
      this.setState({ globalBottomAdItem })
    }

    // globalStore.fetchWxSignature({url: encodeURIComponent(window.location.href), isPsomise: true}) || {}

    utils.loadScript('https://www.googletagmanager.com/gtag/js?id=UA-66884-1').then(data => {
      window.dataLayer = window.dataLayer || []
      function gtag() { dataLayer.push(arguments) }
      gtag('js', new Date())
      gtag('config', 'UA-66884-1')
    })

    wxReplaceHistory()
  }

  renderPopup() {
    const { obstacleList } = this.state
    const { popUpState } = this.props
    const popupAd: any = (obstacleList && obstacleList[0]) || {}
    const id = popupAd.id
    const link = popupAd.link
    const image = popupAd.image
    const popupAdTitle = popupAd.title
    const showPopup = popUpState !== `${id}-${image}`

    return (showPopup && link && image && <PopupModal
      id={id}
      url={link}
      imgUrl={image}
      title={popupAdTitle}
    />)
  }

  renderBottomAd() {
    const { globalStore } = this.mobxStore
    const { isMobileScreen } = globalStore
    const { globalBottomAdItem, homeBottomAdItem } = this.state
    const { bottomAdState, homeBottomAdState } = this.props
    const globalId = globalBottomAdItem.id
    const homeId = homeBottomAdItem.id
    // const showAd = bottomAdState !== `${id}-${globalBottomAdItem.gmtModified}`
    const showGlobalAd = bottomAdState !== (globalBottomAdItem.contentType === 2 ? `${globalId}-${globalBottomAdItem.description}` : `${globalId}-${globalBottomAdItem.image}`)
    const showHomeAd = homeBottomAdState !== (homeBottomAdItem.contentType === 2 ? `${homeId}-${homeBottomAdItem.description}` : `${homeId}-${homeBottomAdItem.image}`)

    // console.log('ad status', bottomAdState, `${id}-${globalBottomAdItem.gmtModified}`)
    let adNode = null
    if (!isMobileScreen) {
      if (homeId && showHomeAd) {
        adNode = <BottomAdBox id={homeId} pageCode="p_h" adItem={homeBottomAdItem} />
      } else if (globalId && showGlobalAd) {
        adNode = <BottomAdBox id={globalId} pageCode="p_g" adItem={globalBottomAdItem} />
      }
    }
    return adNode
    // return isMobileScreen ? null : (showAd && globalId && <BottomAdBox id={globalId} pageCode="p_g" adItem={globalBottomAdItem} />)
  }

  renderMobileBottomBar() {
    const { asPath } = this.props
    const { globalStore } = this.mobxStore
    const { isMobileScreen } = globalStore
    const paramIndex = asPath.indexOf('?')
    const paramLength = paramIndex > 0 ? paramIndex : asPath.length
    const currentPath = asPath.substring(0, paramLength)
    // const showTabBar = currentPath === '/' || ['/shots','/article','/discover','/user'].some(v => currentPath.indexOf(v) >= 0)
    const showTabBar = currentPath === '/' || ['/shots', '/article', '/discover', '/user'].some(v => currentPath === v)
    return isMobileScreen && showTabBar ? <BottomTabBar asPath={asPath} /> : null
  }

  render() {
    const { asPath, Component, pageProps, userInfo, hasTopic, hasTop } = this.props
    const { globalStore } = this.mobxStore
    const { isMobileScreen } = globalStore

    const hideHeader = noHeadList.some(l => (asPath.indexOf(l) > -1))
    const hideFooter = [...noHeadList, '/discover'].some(l => (asPath.indexOf(l) > -1)) || (isMobileScreen && asPath.indexOf('/author/') >= 0)
    const showSubFooter = subFooterList.some(l => (asPath === l) || (asPath.indexOf(l) === 0)) || asPath === '/'


    return (
      <ConfigProvider locale={zh_CN}>
        <HeadComponent />
        <Container>
          <Provider store={this.mobxStore}>
            <>
              {!hideHeader && <CommonHeader asPath={asPath} userInfo={userInfo} hasTopic={hasTopic} hasTop={hasTop} />}
              <Containers component={
                <Layout asPath={asPath}>
                  <Component {...pageProps} userInfo={userInfo} />
                  <GlobalFixedActionButtons asPath={asPath} />
                </Layout>}
              />
              {!hideFooter &&
                <>
                  <CommonSubFooter showSubFooter={showSubFooter} />
                  <CommonFooter />
                </>}
              {this.renderPopup()}
              {/* {this.renderMobileBottomBar()} */}
              {this.renderBottomAd()}
              <LetterChat />
              <EnquiryModal />
            </>
          </Provider>
        </Container>
      </ConfigProvider>
    )
  }
}