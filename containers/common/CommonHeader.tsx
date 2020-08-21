import { Component } from 'react'
import { navList } from '@constants/common/header'
import { message, Avatar, Tabs, Layout, Row, Col, Drawer, Icon, Modal, AutoComplete, Input, Menu, Button } from 'antd'
import jsCookie from 'js-cookie'
import { Link } from '@routes'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import classnames from 'classnames'
import debounce from 'lodash/debounce'

import Portal from '@components/common/Portal'
import MaskLayer from '@components/widget/common/MaskLayer'
import MobileMsgList from '@components/common/MobileMsgList'
import LogoWidget from '@components/widget/header/LogoWidget'
import BriefWidget from '@components/widget/common/BriefWidget'
import HeaderInput from '@components/widget/animations/HeaderInput'
import NavMenuWidget from '@components/widget/header/NavMenuWidget'
import NavToolMenuWidget from '@components/widget/header/NavToolMenuWidget'
import LetterNavDropPanel from '@containers/usercenter/letter/LetterNavDropPanel'
import MbNavigatorBar from './MbNavigatorBar'

import { config } from '@utils'

// import homeLogoSvg from '@static/images/logo.svg'
// import userSvg from '@static/images/account/user.svg'
// import searchSvg from '@static/images/account/search.svg'
// import messageSvg from '@static/images/account/message.svg'

const publishSvg = '/static/images/account/publish.svg'

const homeLogoSvg = '/static/images/logo.svg'

const { Header } = Layout
const { TabPane } = Tabs
const Option = AutoComplete.Option
const OptGroup = AutoComplete.OptGroup
const MenuItem = Menu.Item

let textareaLimitedNum = 200

interface Props {
  fetchUserLogout: any,
}
interface State {

}

const dataSource = [
  {
    title: '热门搜索',
    children: [
      {
        title: 'AntDesign',
        count: 10000,
      },
      {
        title: 'AntDesign UI',
        count: 10600,
      },
    ],
  }
]

function renderTitle(title) {
  return (
    <span>{title}</span>
  )
}

const options = dataSource.map(group => (
  <OptGroup key={group.title} label={renderTitle(group.title)}>
    {group.children.map(opt => (
      <Option key={opt.title} value={opt.title}>
        {opt.title}
        <span className='certain-search-item-count'>{opt.count} 人 关注</span>
      </Option>
    ))}
  </OptGroup>
))

@inject(stores => {
  const { globalStore, accountStore, searchStore, adStore, messageStore, letterStore, compositionStore } = stores.store
  const { navTipShow, isBigScreen, updateNavTipShow, navigationData, mobileNavigationData, navExpand, isMobileScreen } = globalStore
  const { currentUser, updateUserInfo, fetchUserLogout } = accountStore
  const { searchPopup, searchUi } = searchStore
  const { searchKeywordsAds } = adStore
  const { messageStat } = messageStore
  const { letterUnreadData } = letterStore
  const { authors } = compositionStore

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
  }
})
@observer
export default class CommonHeader extends Component<Props, State> {
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
  }

  static getDerivedStateFromProps(props, state) {
    if (props.userInfo && props.userInfo.id) {
      return {
        userInfo: props.userInfo
      }
    } else {
      return {
        userInfo: props.currentUser
      }
    }
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

  async requestAuthors() {
    const { compositionStore } = this.props
    this.setState({ authorsLoading: true })
    const response = await compositionStore.fetchAuthors()
    this.setState({ authorsLoading: false })
  }

  handleSubMenuTitleClick = e => {
    const { authors } = this.props
    const { authorsLoading } = this.state
    if (!authorsLoading && authors.length === 0) {
      this.requestAuthors()
    }
  }

  renderNavList = (isMobile) => {

    let navList = [{
      id: 0,
      name: '首页',
      link: '/'
    }, {
      id: 1,
      name: '作品',
      link: '/shots'
    }, {
      id: 2,
      name: '文章',
      link: '/article'
    }, {
      id: 3,
      name: '创作者',
      link: '/author'
    },

    ]

    if (isMobile) {
      navList.push({
        id: 4,
        name: '专题',
        link: '/topics'
      },
        {
          id: 5,
          name: '榜单',
          link: '/top'
        },
        {
          id: 6,
          name: '收藏',
          link: '/collection'
        })
    }

    return navList
  }

  handleReply = e => {
    this.setState({
      showMsgModal: true
    })
  }

  hideReply = e => {
    this.setState({
      showMsgModal: false
    })
  }

  handleTextareaChange = e => {
    if (e.target.value.length <= textareaLimitedNum) {
      this.setState({ textareaVal: e.target.value, textareaNum: e.target.value.length })
    } else {
      message.destroy()
      message.warning(`超出字数限制!`)
    }
  }


  showDrawer = () => {
    this.setState({
      visible: true
    })
  }

  onSendMsg = e => {
    // console.log(`确定`)
  }

  showUserDrawer = () => {
    this.setState({
      userVisible: true
    })
  }

  showMsgDrawer = () => {
    this.setState(prevState => ({
      msgVisible: !prevState.msgVisible
    }))
  }

  onClose = () => {
    this.setState({
      visible: false
    })
  }

  onUserClose = () => {
    this.setState({
      userVisible: false
    })
  }

  handleClick = e => {
    this.setState({
      current: e.key,
    })

    switch (e.key) {
      case `message`:
        // console.log(`待定`)

        break
      case `search`:
        this.handleSearchShow(true)

        break
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

  handleShowMenu = showMenu => {
    this.setState({ showMenu })
  }

  handlePublish = () => {
    const userInfo = this.state.userInfo || {}
    const isLogin = !!userInfo.id
    if (isLogin) {
      if (userInfo.hasAuthor) {
        window.location.href = '/shots/new'
      } else {
        window.location.href = '/creator'
      }
    } else {
      window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
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
    } = this.props
    const userInfo = this.state.userInfo || {}
    const isLogin = !!userInfo.id
    const marginTop = msgVisible ? '58px' : 0
    const orgList = (userInfo && userInfo.author && userInfo.author.orgList) || []
    const link = `/personal`
    const navList = this.renderNavList()
    const mobileNavList = this.renderNavList(true)

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
        <Header className={classnames('pc-common-header', { fixed: navigationData.fixed }, { hidden: navigationData.hide })}>
          {!searchShow && <Row type='flex'>
            <Col span={2}>
              {!searchShow && <LogoWidget img={homeLogoSvg} />}
            </Col>
            {<>
              <Col span={9} className={classnames('nav-column', { spread: searchUi.spread })}>
                {!searchShow && <NavMenuWidget list={navList} asPath={asPath} />}
                {searchUi.spread && <div className="mask"></div>}
              </Col>
              <Col span={13} style={{ position: searchUi.spread ? 'static' : null }}>
                <div className={classnames("nav-right-wrapper", { spread: searchUi.spread })}>
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
                  {!searchShow && <NavToolMenuWidget
                    link={link}
                    that={this}
                    spread={searchUi.spread}
                    current={current}
                    orgList={orgList}
                    showMenu={showMenu}
                    userInfo={userInfo}
                    authors={authors}
                    authorsLoading={authorsLoading}
                    navTipShow={navTipShow}
                    messageCount={messageStat.totalCount}
                    letterCount={letterCount}
                    letterMenu={<LetterNavDropPanel />}
                    handleShowMenu={this.handleShowMenu}
                    handleLogout={this.handleLogout}
                    updateNavTipShow={updateNavTipShow}
                    user={<Avatar size={15} src={userInfo.avatar} style={{ marginRight: `10px`, marginBottom: `2.5px` }} />}
                    search={<Icon type='search' className='img-search' />}
                    msg={<Icon type='message' theme='filled' className='img-message' />}
                    handleClick={this.handleClick}
                    onSubMenuTitleClick={this.handleSubMenuTitleClick}
                  />}

                </div>
              </Col>
            </>}
          </Row>}
        </Header>

        {isMobileScreen && !mobileNavigationData.hide && <MbNavigatorBar />}
        <div>
          {!isMobileScreen && navigationData.fixed && <div className={classnames(
            'nav-height-place',
            { visible: navigationData.fixed && !navigationData.hide }
          )}></div>}
        </div>
      </>
    )
  }
}