import React, { Component } from 'react'
import { Router } from '@routes'
import qs from 'qs'
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
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
// import MiniappIcon from '@containers/widget/MiniappIcon'
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
  const { userCenterStore, accountStore } = stores.store
  const { currentUser } = accountStore
  const { saveDomain, commonAuthor, mineInsList, fetchGetOrgList, fetchGetSubscriptions, fetchGetSettingMember, } = userCenterStore
  return {
    commonAuthor,
    currentUser,
    saveDomain,
    mineInsList,
    fetchGetOrgList,
  }
})
@observer
export default class AuthorCenterSider extends Component<Props, State> {
  componentDidMount() {
    this.requestAuthorList()
  }

  requestAuthorList() {
    const { mineInsList, fetchGetOrgList, currentUser } = this.props
    if (mineInsList.length === 0) {
      fetchGetOrgList({ user_id: currentUser.id })
    }
  }

  handleClick = e => {
    const { query, commonAuthor } = this.props
    const { type, menu, tab, id } = query

    if (e.key === TeamMenuType.HOME_PAGE) {
      window.open(`/author/${commonAuthor.code}?edit=1`)
    } else if (e.key === TeamMenuType.WEBSITE) {
      // console.log(toJS(commonAuthor))
      window.open(`/theme/author/${commonAuthor.authorId}`)
    } else {
      Router.pushRoute(`/teams/${id}/${e.key}`)
    }
  }

  renderAuthorDropdown() {
    const { mineInsList, query } = this.props
    const { menu, tab, id, ...restQuery } = query
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
          <Menu className="ucenter-author-dropdown-menu">
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
      commonAuthor,
    } = this.props
    const { id, menu, tab } = query

    const data = commonAuthor
    const age = utils.getAge(data.gmtCreate)
    const loaded = JSON.stringify(toJS(data)) !== '{}'
    const authorCode = saveDomain ? saveDomain : data.code
    const menus = menu ? menu : TeamMenuType.CREATION

    const workWebsite = commonAuthor.workWebsite || {}
    const websiteEditionRight = workWebsite.editionRight || {}
    const websiteDomain = websiteEditionRight.useDomain
    const hasWebsite = !!commonAuthor.workWebsite
    
    // console.log('author left side', toJS(commonAuthor))
    const edition = commonAuthor.authorEdition || { editionType: EditionType.FREE }
    const upgradeEditionType = edition.editionType === EditionType.FREE ? EditionType.STANDARD : edition.editionType
    const isFreeEdition = edition.editionType === EditionType.FREE
    const expireContent = isFreeEdition ? <span>免费版 <a href={`/pricing?v=${EditionType.STANDARD}&aid=${commonAuthor.authorId}`} target="_blank">升级</a></span> : <span>{editionMap[edition.editionType]}到期时间 {moment(edition.gmtExpire).format('YYYY-MM-DD')} <a href={`/pricing?v=${edition.editionType}&aid=${commonAuthor.authorId}`} target="_blank">续费</a></span>

    return (
      <div className='user-info-box'>
        <Row>
          <div className='user-brief-box clearfix'>
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
                  {commonAuthor.type && <div className='user-type'>
                    <UserIdentityComp currentType={commonAuthor.type} editionType={edition.editionType} />
                    {/* <AuthorEditionTag editionType={edition.editionType} authorType={commonAuthor.type} style={{marginLeft: '6px'}} /> */}
                    <span className="wx-mini-icon" style={{ marginLeft: '6px' }}>
                      {/* <MiniappIcon
                                            placement="bottomCenter"
                                            params={{scene: `code=${commonAuthor.code}`, page: 'pages/author/author-detail/author-detail', width: 320}}
                                        /> */}
                      <QRCodeIcon
                        placement="bottom"
                        url={config.CURRENT_DOMAIN + `/author/${commonAuthor.code}`}
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
                  {/* {!!(commonAuthor.authorId || !isUserCenter) && <div className='user-data'>
                                    <a href={`/author/${authorCode}/shots`} data-for={`box-user-data`} data-tip={`作品: ${data.compositionCount || 0}`}>作品 <strong>{data.compositionCount || 0}</strong></a> | <a href={`/author/${authorCode}/article`} data-for={`box-user-data`} data-tip={`文章: ${data.articleCount || 0}`}>文章 <strong>{data.articleCount || 0}</strong></a> | <a data-for={`box-user-data`} data-tip={`粉丝: ${data.fans || 0}`}>粉丝 <strong>{data.fans || 0}</strong></a>
                                    <ReactTooltip id={`box-user-data`} effect='solid' place='top' />
                                </div>} */}
                  {/* {!!data.signature && <div className='user-intro'>
                                    {data.signature}
                                </div>} */}
                  {/* {!!age && commonAuthor.authorId && <div className='user-net-age'>
                                    梅花网龄：{age}
                                </div>} */}
                  {commonAuthor.authorId && <div className='user-contact user-center'>
                    <Button>
                      <a href={`/author/${authorCode}`} target="_blank">创作者主页</a>
                    </Button>
                    {hasWebsite && websiteDomain && <Button>
                      <a href={utils.addHttp(`/${websiteDomain}`)} target="_blank">独立官网</a>
                    </Button>}
                    <Button type="primary">
                      <a href={`/pricing?v=${upgradeEditionType}&aid=${commonAuthor.authorId}`} target="_blank">服务商推广</a>
                    </Button>
                  </div>}
                </Col>
              </> :
              <Col className='user-info-col' span={24}>
                <PartLoading />
              </Col>
            }
          </div>
        </Row>
        <Row>
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
              {/* <Menu.Item key={TeamMenuType.MEMBER}>
                <CusIcon name='member' className='default-icon' />
                <span>成员管理</span>
              </Menu.Item> */}
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
        </Row>
      </div>
    )
  }
}