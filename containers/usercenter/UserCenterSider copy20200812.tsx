import React, { Component } from 'react'
import { Router } from '@routes'
import qs from 'qs'
import ReactTooltip from 'react-tooltip'
import { inject, observer } from 'mobx-react'
import { Row, Col, Button, Menu, Badge, Icon, Avatar, Dropdown } from 'antd'
import { AuthorStatus, MineType, TeamMenuType, AuthorType, EditionType, AddedServiceType } from '@base/enums'
import { utils, config } from '@utils'
import area from '@base/system/area'
import { toJS } from 'mobx'

import CusIcon from '@components/widget/common/Icon'
import PartLoading from '@components/features/PartLoading'
import AvatarComponent from '@components/common/AvatarComponent'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import MiniappIcon from '@containers/widget/MiniappIcon'
import QRCodeIcon from '@components/widget/common/QRCodeIcon'
import moment from 'moment'

import sysOrder from '@base/system/order'

interface Props {
  query: any
}

interface State {
  query: any
}

const editionMap = sysOrder.filters.editionMap

const SubMenu = Menu.SubMenu

let provinceData = []
let cityData = {}
let cityIdData = []
let provinceIdData = []

area.forEach(l => {
  provinceData = [...provinceData, ...l.provinces]
})

provinceData.forEach(l => {
  cityData[l.name] = l.cities
  cityIdData[l.id] = l

  provinceIdData = [...provinceIdData, ...l.cities]
})

let Comp = ''
@inject(stores => {
  const { globalStore, userCenterStore, accountStore, messageStore, letterStore } = stores.store
  const { currentUser } = accountStore
  const { updateGlobalTitle } = globalStore
  const { saveDomain, perSettingData, insSettingData, curClientUserInfo, mineInsList, fetchGetOrgList, fetchGetSubscriptions, fetchGetSettingMember, } = userCenterStore
  const { messageStat } = messageStore
  const { letterUnreadData, unreadEnquiryCount } = letterStore
  return {
    letterStore,
    curClientUserInfo,
    currentUser,
    saveDomain,
    perSettingData,
    insSettingData,
    updateGlobalTitle,
    messageStat,
    letterUnreadData,
    unreadEnquiryCount,
    mineInsList,
    fetchGetOrgList,
    fetchGetSubscriptions,
    fetchGetSettingMember,
  }
})
@observer
export default class UserCenterSider extends Component<Props, State> {
  componentDidMount() {
    const { query, letterStore } = this.props

    // letterStore.fetchUnreadEnquiryCount()

    this.requestAuthorList()
  }

  requestAuthorList() {
    const { mineInsList, fetchGetOrgList, currentUser } = this.props
    if (mineInsList.length === 0) {
      fetchGetOrgList({ user_id: currentUser.id })
    }
  }

  handleClick = e => {
    const { query, updateGlobalTitle, fetchGetSubscriptions, fetchGetSettingMember } = this.props
    const { type, menu, tab, id } = query
    if (!id) {
      if (e.key === MineType.CREATOR) {
        // Router.pushRoute(`/creator`)
        window.open('/creator')
      } else {
        Router.pushRoute(`/personal/${e.key}`)
      }
      // window.location.href = `/personal/${e.key}`
    } else {
      const { userCenterInfo } = this.props
      if (e.key === TeamMenuType.HOME_PAGE) {
        window.open(`/author/${userCenterInfo.code}?edit=1`)
      } else if (e.key === TeamMenuType.WEBSITE) {
        // console.log(toJS(userCenterInfo))
        window.open(`/theme/author/${userCenterInfo.authorId}`)
      } else {
        Router.pushRoute(`/teams/${id}/${e.key}`)
      }
      // window.location.href = `/teams/${id}/${e.key}`
    }
  }

  renderAuthorDropdown() {
    const { mineInsList, query } = this.props
    const { menu, tab, id, ...restQuery } = query
    // console.log('query id', query)
    const filterList = mineInsList.filter(item => {
      return item.authorPassed && ![AuthorStatus.CLOSED].includes(item.status) && item.id !== query.id
    })

    // 没有其他创作者
    if (filterList.length === 0) {
      return null
    }

    let urlSuffix = ''
    if (menu) {
      urlSuffix += `/${menu}`
      if (tab) {
        urlSuffix += `/${tab}`
      }
    }
    const queryParamStr = qs.stringify(restQuery)
    // console.log(queryParamStr)
    if (queryParamStr) {
      urlSuffix += `?${queryParamStr}`
    }

    return (
      <Dropdown
        overlay={
          <Menu
            className="ucenter-author-dropdown-menu"
          >
            {filterList.map(item => {
              return (
                <Menu.Item key={item.id}>
                  <a href={`/teams/${item.id}${urlSuffix}`}>
                    <div className="author-avatar">
                      <Avatar src={item.avatar} size={40} />
                    </div>
                    <div className="author-info">
                      <div className="nickname">
                        {item.nickname}
                      </div>
                      <div className="intro">
                        <UserIdentityComp currentType={item.type} editionType={item.editionType} />
                        <span className="company">{item.name}</span>
                      </div>
                    </div>
                  </a>
                </Menu.Item>
              )
            })}
          </Menu>
        }
      >
        <span className="switch-author-btn"><CusIcon name="switch" /> 切换创作者</span>
      </Dropdown>
    )
  }

  render() {
    const {
      query,
      saveDomain,
      perSettingData,
      insSettingData,
      userCenterInfo,
      currentUser,
      messageStat,
      letterUnreadData,
      unreadEnquiryCount,
    } = this.props
    const { id, menu, tab } = query

    // const isUserCenter = userCenterInfo.authorId
    const isUserCenter = !id
    // const data = isUserCenter ? perSettingData : insSettingData 
    const data = userCenterInfo
    const age = utils.getAge(data.gmtCreate)
    const loaded = JSON.stringify(toJS(data)) !== '{}'
    const codes = saveDomain ? saveDomain : data.code
    let menus

    const workWebsite = userCenterInfo.workWebsite || {}
    const websiteEditionRight = workWebsite.editionRight || {}
    const websiteDomain = websiteEditionRight.useDomain
    const hasWebsite = !!userCenterInfo.workWebsite

    if (isUserCenter) {
      if (query.collectionId) {
        menus = MineType.COLLECTION
      } else {
        menus = menu ? menu : MineType.FOLLOW
      }
    } else {
      menus = menu ? menu : TeamMenuType.CREATION
    }

    // console.log('left side', toJS(currentUser))
    // console.log('author left side', toJS(userCenterInfo))
    const edition = userCenterInfo.authorEdition || { editionType: EditionType.FREE }
    const upgradeEditionType = edition.editionType === EditionType.FREE ? EditionType.STANDARD : edition.editionType
    const isFreeEdition = edition.editionType === EditionType.FREE
    const expireContent = isFreeEdition ? <span>免费版 <a href={`/pricing?v=${EditionType.STANDARD}&aid=${userCenterInfo.authorId}`} target="_blank">升级</a></span> : <span>{editionMap[edition.editionType]}到期时间 {moment(edition.gmtExpire).format('YYYY-MM-DD')} <a href={`/pricing?v=${edition.editionType}&aid=${userCenterInfo.authorId}`} target="_blank">续费</a></span>

    return (
      <div className='user-info-box'>
        <Row>
          {isUserCenter && <div className='user-brief-box clearfix'>
            {loaded ?
              <Col className='user-info-col' span={24}>
                <div className='avatar'>
                  <AvatarComponent
                    src={currentUser.avatar}
                    name={currentUser.nickName}
                    style={{ fontSize: '22px' }}
                  />
                </div>
                <h2 className='user-name'>
                  <span>{currentUser.nickName}</span>
                </h2>
                <div className='user-area'>
                  {currentUser.provinceName}
                  {currentUser.provinceName && currentUser.cityName && <span> / </span>}
                  {currentUser.cityName}
                </div>
              </Col> :
              <Col className='user-info-col' span={24}>
                <PartLoading />
              </Col>
            }
          </div>}
          {!isUserCenter && <div className='user-brief-box clearfix'>
            {loaded ?
              <>
                {this.renderAuthorDropdown()}
                <Col className='user-info-col' span={24}>
                  <div className='avatar'>
                    <AvatarComponent
                      src={data.avatar}
                      name={data.nickname || data.nickName}
                      style={{ fontSize: '22px' }}
                    />
                  </div>
                  <h2 className='user-name'>
                    <span>{data.nickname || data.nickName}</span>
                  </h2>
                  {!isFreeEdition && <div className="user-author-name">
                    <AuthorAuthenticationIcon />
                    <span>{data.name}</span>
                  </div>}
                  {userCenterInfo.type && <div className='user-type'>
                    <UserIdentityComp currentType={userCenterInfo.type} editionType={edition.editionType} />
                    {/* <AuthorEditionTag editionType={edition.editionType} authorType={userCenterInfo.type} style={{marginLeft: '6px'}} /> */}
                    <span className="wx-mini-icon" style={{ marginLeft: '6px' }}>
                      {/* <MiniappIcon
                                            placement="bottomCenter"
                                            params={{scene: `code=${userCenterInfo.code}`, page: 'pages/author/author-detail/author-detail', width: 320}}
                                        /> */}
                      <QRCodeIcon
                        placement="bottom"
                        url={config.CURRENT_DOMAIN + `/author/${userCenterInfo.code}`}
                      />
                    </span>
                  </div>}
                  <div className="user-expire">
                    {expireContent}
                  </div>
                  {/* <div className='user-area'>
                                    {data && data.provinceName}
                                    {data && data.provinceName && data.cityName && <span> / </span>}
                                    {data && data.cityName}
                                </div> */}
                  {/* {!!(userCenterInfo.authorId || !isUserCenter) && <div className='user-data'>
                                    <a href={`/author/${codes}/shots`} data-for={`box-user-data`} data-tip={`作品: ${data.compositionCount || 0}`}>作品 <strong>{data.compositionCount || 0}</strong></a> | <a href={`/author/${codes}/article`} data-for={`box-user-data`} data-tip={`文章: ${data.articleCount || 0}`}>文章 <strong>{data.articleCount || 0}</strong></a> | <a data-for={`box-user-data`} data-tip={`粉丝: ${data.fans || 0}`}>粉丝 <strong>{data.fans || 0}</strong></a>
                                    <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
                                </div>} */}
                  {/* {!!data.signature && <div className='user-intro'>
                                    {data.signature}
                                </div>} */}
                  {/* {!!age && userCenterInfo.authorId && <div className='user-net-age'>
                                    梅花网龄：{age}
                                </div>} */}
                  {userCenterInfo.authorId && <div className='user-contact user-center'>
                    <Button>
                      <a href={`/author/${codes}`} target="_blank">创作者主页</a>
                    </Button>
                    {hasWebsite && websiteDomain && <Button>
                      <a href={utils.addHttp(`/${websiteDomain}`)} target="_blank">独立官网</a>
                    </Button>}
                    <Button type="primary">
                      <a href={`/pricing?v=${upgradeEditionType}&aid=${userCenterInfo.authorId}`} target="_blank">服务商推广</a>
                    </Button>
                  </div>}
                </Col>
              </> :
              <Col className='user-info-col' span={24}>
                <PartLoading />
              </Col>
            }
          </div>}
        </Row>
        <Row>
          {isUserCenter ?
            <div className='usercenter-menu'>
              <Menu
                onClick={this.handleClick}
                defaultSelectedKeys={[menus]}
                mode='inline'>
                <Menu.Item key={MineType.FOLLOW}>
                  <CusIcon name='user1' className='default-icon' />
                  <span>我的关注</span>
                </Menu.Item>
                <Menu.Item key={MineType.COLLECTION}>
                  <CusIcon name='star' className='default-icon' />
                  <span>我的收藏</span>
                </Menu.Item>
                <Menu.Item key={MineType.FAVOR}>
                  <CusIcon name='heart' className='default-icon' />
                  <span>我的喜欢</span>
                </Menu.Item>
                <Menu.Item key={MineType.MESSAGE}>
                  <CusIcon name='message' className='default-icon' />
                  <Badge count={messageStat.totalCount}><span>我的消息</span></Badge>
                </Menu.Item>
                <Menu.Item key={MineType.LETTER}>
                  <CusIcon name='letter' className='default-icon' />
                  <Badge count={unreadEnquiryCount}><span>我的询价</span></Badge>
                </Menu.Item>
                <Menu.Item key={MineType.ORDER}>
                  <CusIcon name='order' className='default-icon' />
                  <span>我的订单</span>
                </Menu.Item>
                <Menu.Item key={MineType.DATAANDACCOUNT}>
                  <CusIcon name='account' className='default-icon' />
                  <span>资料与账户</span>
                </Menu.Item>
                <Menu.Item key={MineType.SUBSCRIPTION}>
                  <CusIcon name='email' className='default-icon' />
                  <span>邮件订阅</span>
                </Menu.Item>
                <Menu.Item key={MineType.CREATOR} className='usercenter-creator-side'>
                  <Icon type='plus-circle' theme="filled" className='default-icon' />
                  <span>创建创作者</span>
                </Menu.Item>
                <Menu.Item key={MineType.INSTITUTION}>
                  <CusIcon name='managecreator' className='default-icon' style={{ fontWeight: 600 }} />
                  <span>管理创作者</span>
                </Menu.Item>
              </Menu>
            </div> :
            <div className='usercenter-menu'>
              <Menu
                onClick={this.handleClick}
                defaultSelectedKeys={[menus]}
                defaultOpenKeys={['main-page']}
                mode='inline'
              >
                <Menu.Item key={TeamMenuType.CREATION}>
                  <CusIcon name='creation' className='default-icon' />
                  <span>创作管理</span>
                </Menu.Item>
                <Menu.Item key={TeamMenuType.SERVICE}>
                  <CusIcon name='relation-service' className='default-icon' />
                  <span>服务管理</span>
                </Menu.Item>
                <Menu.Item key={TeamMenuType.STATISTICS}>
                  <CusIcon name='statistics' className='default-icon' />
                  <span>创作统计</span>
                </Menu.Item>
                <Menu.Item key={TeamMenuType.MEMBER}>
                  <CusIcon name='member' className='default-icon' />
                  <span>成员管理</span>
                </Menu.Item>
                <SubMenu
                  className='usercenter-creator-side'
                  key="main-page"
                  title={<div>
                    <CusIcon name='monitor' className='default-icon' />
                    <span>主页设置</span>
                  </div>}
                >
                  <Menu.Item key={TeamMenuType.HOME_PAGE}>
                    <span>创作者主页设置</span>
                  </Menu.Item>
                  <Menu.Item key={TeamMenuType.WEBSITE}>
                    <span>独立官网设置</span>
                  </Menu.Item>
                </SubMenu>
                <Menu.Item key={TeamMenuType.DATA}>
                  <CusIcon name='account' className='default-icon' />
                  <span>资料与账户</span>
                </Menu.Item>
              </Menu>
            </div>
          }
        </Row>
      </div>
    )
  }
}