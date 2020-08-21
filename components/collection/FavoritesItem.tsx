import React, { PureComponent } from 'react'

import { Avatar, Dropdown, Menu, Icon, Tooltip } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import { Router } from '@routes'

import './FavoritesItem.less'

const allMenuItems = [
  {key: 'edit', label: '编辑'},
  {key: 'delete', label: '删除'},
  {key: 'follow', label: '取消关注'},
]

interface Props {
  item: object
  hideAuthor: boolean
  showExtra: boolean
  extraMenus: Array<string>
  scope: string
}

export default class FavoritesItem extends PureComponent<Props> {

  handleMenuClick = ({item, key, keyPath}) => {
    const { onEdit, onDelete, onFollow } = this.props
    const record = item.props.record || {}
    switch(key) {
      case 'edit':
        if (onEdit) onEdit(record)
        break
      case 'delete':
        if (onDelete) onDelete(record)
        break
      case 'follow':
        if (onFollow) onFollow(record)
        break
    }
  }

  handleJumpClick = () => {
    const { scope, item } = this.props
    const isMyFavorites = scope === 'myFavorites'
    if (isMyFavorites) {
      Router.pushRoute(`/personal/collections/${item.id}`)
    } else {
      window.open(`/collection/${item.id}`)
    }
  }

  render() {
    const { item, hideAuthor, showExtra, extraMenus=[], scope } = this.props
    let covers = item.cover || []
    let menu = null

    if (covers.length < 4) {
      covers = covers.slice(0,1)
    }

    if (showExtra) {
      const menuItems = allMenuItems.filter(m => {
        if (m.key === 'delete') {
          // 默认收藏夹不可删除
          return extraMenus.includes(m.key) && !item.hasdefault
        } else {
          return extraMenus.includes(m.key)
        }
      })
      menu = (
        <Menu onClick={this.handleMenuClick}>
          {menuItems.map(m => (
            <Menu.Item key={m.key} record={item}>
              {m.label}
            </Menu.Item>
          ))}
        </Menu>
      )
    }

    return (
      <div className="collection-item">
        <div className="collection-item-content">
            <div className={`collection-item-cover ${covers.length === 1 ? 'single' : ''}`}>
              <a onClick={this.handleJumpClick}>
                {covers.map((url, i) => (<img key={i} src={`${url}?imageMogr2/thumbnail/!252x180r/size-limit/50k/gravity/center/crop/252x180`} alt={item.name} />))}
              </a>
            </div>
            <div className="collection-item-intro">
                <div className={`title ${!item.published ? 'lock' : ''}`}>
                    <a onClick={this.handleJumpClick} title={item.name} alt={item.name}><Tooltip title={item.name}>{item.name}</Tooltip></a>
                    {!item.published && <span className="published"><CustomIcon name="lock" /></span>}
                </div>
                <div className="footer-bar">
                  <span className="stat">
                    <span className="text">{item.pv || 0}人浏览</span>
                    <span className="text">{item.follows || 0}人关注</span>
                  </span>
                  {showExtra && <span className="extra">
                    <Dropdown overlay={menu} placement="bottomRight">
                      <a><Icon type="ellipsis" /></a>
                    </Dropdown>
                  </span>}
                </div>
            </div>
        </div>
        {!hideAuthor && <div className="collection-item-author">
            <span className="avatar"><Avatar icon="user" src={item.userAvatar + '?imageMogr2/thumbnail/!32x32r/size-limit/50k/gravity/center/crop/32x32'} size={16} /></span>  
            <span className="name">{item.userNickname}</span>
        </div>}
      </div>
    )
  }
}