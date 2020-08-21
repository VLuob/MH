import { Component } from 'react'
import jsCookie from 'js-cookie'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import debounce from 'lodash/debounce'
import { message, Dropdown, Menu } from 'antd'

import HeaderInput from '@components/widget/animations/HeaderInput'
import MbNavigatorBar from '../MbNavigatorBar'
import DropdownDiscover from './DropdownDiscover'
import DropdownPricing from './DropdownPricing'
import DropdownPublish from './DropdownPublish'
import DropdownMessage from './DropdownMessage'
import DropdownUser from './DropdownUser'

import CustomIcon from '@components/widget/common/Icon'
import { config } from '@utils'

import './index.less'

const homeLogoSvg = '/static/images/logo.svg'

let textareaLimitedNum = 200

interface Props {
  fetchUserLogout: any,
}
interface State {

}


@inject(stores => {
  const { globalStore, accountStore, searchStore, adStore, messageStore, letterStore, compositionStore } = stores.store
  const { navTipShow, isBigScreen, updateNavTipShow, navigationData, mobileNavigationData, navExpand, isMobileScreen } = globalStore
  const { currentUser, updateUserInfo, fetchUserLogout } = accountStore
  const { searchPopup, searchUi } = searchStore
  const { searchKeywordsAds } = adStore
  const { messageStat } = messageStore
  const { letterUnreadData } = letterStore
  const { authors, classificationsAll } = compositionStore

  return {
    globalStore,
    searchStore,
    messageStore,
    letterStore,
    adStore,
    compositionStore,
    currentUser,
    navTipShow,
    isBigScreen,
    isMobileScreen,
    updateUserInfo,
    fetchUserLogout,
    updateNavTipShow,
    navigationData,
    mobileNavigationData,
    navExpand,
    searchUi,
    searchPopup,
    searchKeywordsAds,
    messageStat,
    letterUnreadData,
    authors,
    classificationsAll,
  }
})
@observer
export default class GlobalHeader extends Component<Props, State> {
  constructor(props) {
    super(props)
    this.beforeScrollTop = 0
    // this.mouseWhellNavToggle = debounce(this.mouseWhellNavToggle, 80)
    // this.handleScroll = debounce(this.handleScroll, 80)
    this.reqSearchPopup = debounce(this.reqSearchPopup, 500)
  }
  state = {
    current: '',
    visible: false,
    msgVisible: false,
    userVisible: false,
    showMsgModal: false,
    searchShow: false,

    textareaVal: '',
    textareaNum: 0,
    showMenu: false,

    navFixed: false,
    hiddenNav: false,

    searchKeywords: '',

    authorsLoading: false,
    classificationLoading: false,
  }

  componentDidMount() {
    const { currentUser, updateUserInfo, globalStore } = this.props

    updateUserInfo(currentUser)

    let isNavFixed = false

    if (this.checkPageNavFixed()) {
      isNavFixed = true
      this.initEvents()
    } else {
      isNavFixed = false
    }

    globalStore.setNavigationData({ fixed: isNavFixed })

    this.requestSearchKeywords()
    this.requestMessageStat()
    this.requestUnreadLetters()
    this.requestUnreadEnquiryCount()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    // document.addEventListener('mousewheel', this.mouseWhellNavToggle, false)
    window.addEventListener('scroll', this.handleScroll, false)
  }

  removeEvents() {
    // document.removeEventListener('mousewheel', this.mouseWhellNavToggle, false)
    window.removeEventListener('scroll', this.handleScroll, false)
  }

  handleScroll = (e) => {
    const { globalStore } = this.props
    const afterScrollTop = window.scrollY
    const delta = afterScrollTop - this.beforeScrollTop
    // console.log(afterScrollTop, delta)

    if (afterScrollTop > 0 && delta >= 0) {
      // console.log('down')
      globalStore.setNavigationData({ hide: true })
    } else {
      // console.log('up')
      globalStore.setNavigationData({ hide: false })
    }

    this.beforeScrollTop = afterScrollTop
  }


  mouseWhellNavToggle = (e) => {
    const { globalStore } = this.props
    e = e || window.event;
    if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
      if (e.wheelDelta > 0) { //当滑轮向上滚动时
        // console.warn("滑轮向上滚动");
        // this.setState({hiddenNav: false})
        globalStore.setNavigationData({ hide: false })
      }
      if (e.wheelDelta < 0) { //当滑轮向下滚动时
        // console.error("滑轮向下滚动");
        // this.setState({hiddenNav: true})
        globalStore.setNavigationData({ hide: true })
      }
    } else if (e.detail) {  //Firefox滑轮事件
      if (e.detail > 0) { //当滑轮向上滚动时
        // console.warn("滑轮向上滚动");
        // this.setState({hiddenNav: false})
        globalStore.setNavigationData({ hide: false })
      }
      if (e.detail < 0) { //当滑轮向下滚动时
        // console.error("滑轮向下滚动");
        // this.setState({hiddenNav: true})
        globalStore.setNavigationData({ hide: true })
      }
    }
  }

  checkPageNavFixed() {
    const regExp = /\/(article|shots)\/\d+/
    const pathname = location.pathname
    return regExp.test(pathname)
  }

  requestSearchKeywords() {
    const { adStore } = this.props
    adStore.fetchAdvertisement({ page_code: 'f_s' })
  }

  requestMessageStat() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { messageStore } = this.props
      messageStore.fetchMessageStat()
    }
  }

  requestUnreadLetters() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { letterStore } = this.props
      letterStore.fetchUnreadLetters()
    }
  }
  
  requestUnreadEnquiryCount() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { letterStore } = this.props
      letterStore.fetchUnreadEnquiryCount()
    }

  }

  async requestAuthors() {
    const { compositionStore } = this.props
    this.setState({ authorsLoading: true })
    const response = await compositionStore.fetchAuthors()
    this.setState({ authorsLoading: false })
  }

  requestClassifications = async () => {
    const { compositionStore, classificationsAll } = this.props
    const { classificationLoading } = this.state
    const forms = classificationsAll.forms || []
    if (forms.length === 0 && !classificationLoading) {
      this.setState({classificationLoading: true})
      const response = await compositionStore.fetchGetClassifications({})
      this.setState({classificationLoading: false})
    }
  }

  handleSubMenuTitleClick = e => {
    const { authors } = this.props
    const { authorsLoading } = this.state
    if (!authorsLoading && authors.length === 0) {
      this.requestAuthors()
    }
  }

  handleTextareaChange = e => {
    if (e.target.value.length <= textareaLimitedNum) {
      this.setState({ textareaVal: e.target.value, textareaNum: e.target.value.length })
    } else {
      message.destroy()
      message.warning(`超出字数限制!`)
    }
  }

  handleSearchShow = boolean => this.setState({ searchShow: boolean })

  handleSpread = (b) => {
    const { searchStore } = this.props
    searchStore.updateSearchUi({ spread: b })
  }

  handleLogout = () => {
    const { fetchUserLogout } = this.props
    fetchUserLogout()
  }

  handleSearch = e => {
    const result = encodeURIComponent(`${e.target.value.trim()}`)
    window.location.href = `/search!${result}`
  }

  handleSearchChange = (e) => {
    // const { searchStore } = this.props
    const searchKeywords = e.target.value
    this.setState({ searchKeywords })
    // if (searchKeywords.trim() !== '') {
    //     searchStore.fetchSearchPopup({keywords: searchKeywords})
    // } else {
    //     // searchStore.resetSearchPopup()
    // }
    this.reqSearchPopup(searchKeywords)
  }

  reqSearchPopup(searchKeywords) {
    const { searchStore } = this.props
    const keywords = searchKeywords.replace(/\s+/g, '')
    if (keywords.trim() !== '') {
      searchStore.fetchSearchPopup({ keywords })
    }
  }

  closeClick = () => {
    const { updateNavTipShow } = this.props
    jsCookie.set('meihua_nav_tooltip', true)

    updateNavTipShow(true)
    // this.forceUpdate()
  }

  render() {
    const {
      current,
      visible,
      textareaNum,
      textareaVal,
      msgVisible,
      userVisible,
      showMsgModal,
      searchShow,
      showMenu,
      hiddenNav,
      navFixed,
      searchKeywords,
      authorsLoading,
      classificationLoading,
    } = this.state
    const {
      asPath,
      currentUser,
      navTipShow,
      isBigScreen,
      isMobileScreen,
      updateNavTipShow,
      navigationData,
      mobileNavigationData,
      searchPopup,
      searchKeywordsAds,
      messageStat,
      letterUnreadData,
      searchUi,
      authors,
      classificationsAll,
    } = this.props
    const forms = classificationsAll.forms || []
    const isLogin = !!currentUser.id
    const marginTop = msgVisible ? '58px' : 0

    const letterCount = letterUnreadData.total

    const keywordsAds = []
    for (let k in searchKeywordsAds) {
      const keyAds = searchKeywordsAds[k]
      if (Array.isArray(toJS(keyAds))) {
        keywordsAds.push(...toJS(keyAds))
      }
    }

    return (
      <>
      {!isMobileScreen && <header className="pc-global-header">
        <div className="header-wrapper">
          <div className="header-nav">
            <div className="nav-item header-logo">
              <a href='/'>
                <img src={homeLogoSvg} alt='梅花网' />
              </a>
            </div>
            <div className="nav-item">
              <a href='/'><CustomIcon name="home" />首页</a>
            </div>
            <div className="nav-item">
              <DropdownDiscover 
                formLoading={classificationLoading}
                forms={forms} 
                requestForms={this.requestClassifications}
              />
            </div>
          </div>
          <div className="header-search-wrapper">
            <div className="header-search">
              <HeaderInput
                show={!searchShow}
                spread={searchUi.spread}
                keywords={searchKeywords}
                keywordsAds={keywordsAds}
                onChange={this.handleSearchChange}
                onSearch={this.handleSearch}
                onSearchShow={this.handleSearchShow}
                onSpread={this.handleSpread}
              />
            </div>
          </div>
          <ul className="header-quick-menu">
            <li className="menu-item">
              <DropdownPricing />
            </li>
            <li className="menu-item">
              <DropdownPublish currentUser={currentUser} />
            </li>
            {isLogin && <li className="menu-item">
              <DropdownMessage letterCount={letterCount} />
            </li>}
            <li className="menu-item">
              <DropdownUser currentUser={currentUser} />
            </li>
          </ul>
        </div>
      </header>}
      {/* {isMobileScreen && !mobileNavigationData.hide && <MbNavigatorBar />} */}
      </>
    )
  }
}