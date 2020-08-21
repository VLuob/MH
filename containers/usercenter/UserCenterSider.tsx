import React, { Component } from 'react'
import { Router } from '@routes'
import { inject, observer } from 'mobx-react'
import { Row, Col, Button, Menu, Badge, Icon, Avatar, Dropdown } from 'antd'
import { MineType, } from '@base/enums'
import { utils, config } from '@utils'
import { toJS } from 'mobx'

import CusIcon from '@components/widget/common/Icon'
import PartLoading from '@components/features/PartLoading'
import AvatarComponent from '@components/common/AvatarComponent'

interface Props {
  query: any
}

interface State {
  query: any
}

@inject(stores => {
  const { accountStore, messageStore, letterStore } = stores.store
  const { currentUser } = accountStore
  const { messageStat } = messageStore
  const { unreadEnquiryCount } = letterStore
  return {
    letterStore,
    currentUser,
    messageStat,
    unreadEnquiryCount,
  }
})
@observer
export default class UserCenterSider extends Component<Props, State> {

  handleClick = e => {
    const { query } = this.props

    if (e.key === MineType.CREATOR) {
      // Router.pushRoute(`/creator`)
      window.open('/creator')
    } else {
      Router.pushRoute(`/personal/${e.key}`)
    }
  }


  render() {
    const {
      query,
      currentUser,
      messageStat,
      unreadEnquiryCount,
    } = this.props
    const { id, menu, tab } = query

    let menus
    if (query.collectionId) {
      menus = MineType.COLLECTION
    } else {
      menus = menu ? menu : MineType.FOLLOW
    }

    return (
      <div className='user-info-box'>
        <Row>
          <div className='user-brief-box clearfix'>
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
            </Col>
          </div>
        </Row>
        <Row>
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
          </div>
        </Row>
      </div>
    )
  }
}