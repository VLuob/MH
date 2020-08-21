import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import jsCookie from 'js-cookie'
import { Dropdown, Menu, message } from 'antd'

import { AuthorType } from '@base/enums'
import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'

import AreaPanel from '@components/common/AreaPanel'

import './AuthorSubFilterBar.less'

const sorts = [
  {
    key: 'recommended',
    name: '推荐',
  },
  {
    key: 'degree',
    name: '热门',
  }, {
    key: 'gmtCreate',
    name: `最新`,
  }, {
    key: 'follower',
    name: '关注',
  }
]

const authorTypes = [
  {
    key: null,
    name: '全部创作者',
  },
  {
    key: AuthorType.PERSONAL,
    name: '个人',
  }, {
    key: AuthorType.BRANDER,
    name: '品牌主',
  }, {
    key: AuthorType.SERVER,
    name: '服务商',
  }
]


class AuthorSubFilterBar extends Component {
  constructor(props) {
    super(props)
    const { query={} } = props
    const sortKey = this.getSortKey()

    this.state = {
      showHighMenu: false,
      maskHeight: 0,
      sortKey,
      authorType: query.type ? Number(query.type) : null,
      currentArea: '全部地区'
    }
  }

  getSortKey() {
    const { query={} } = this.props
    let label = ''
    if (query.follow === '') {
        label = 'follower'
    } else if (query.popular === '' || query.like === '' || query.read === '' || query.collection === '' || query.comment === '') {
        label = 'degree'
    } else if (query.newest === '') {
        label = 'gmtCreate'
    } else {
        label = 'recommended'
    }
    return label
  }

  handleToggleHighMenu = () => {
    this.setState({showHighMenu: !this.state.showHighMenu})
    if (!this.state.showHighMenu) {
      const bodyHeight = document.querySelector('#__next').clientHeight
      this.setState({maskHeight: bodyHeight})
    }
  }

  closeHighMenu() {
    this.setState({showHighMenu: false})
  }

  handleDropdownClick = () => {
    this.closeHighMenu()
  }

  changeSortKey(key) {
    this.setState({sortKey: key})
  }
  changeAuthorType(type) {
    this.setState({authorType: type})
  }

  handleSortSelect = (e) => {
    const { sortKey } = this.state
    const { onRequestList, onRecommended, compositionType, currentUser={} } = this.props
    let param = {}
    let routeOption = {}

    if (e.key === sortKey) {
      return
    }

    switch(e.key) {
      case 'degree':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
        routeOption = {popular: ''}
        onRequestList && onRequestList(param, routeOption)
        break
      case 'gmtCreate':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: `desc` }], recommended: false }
        routeOption = {newest: ''}
        onRequestList && onRequestList(param, routeOption)
        break
      case 'follower':
        const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if(token && currentUser.id) {
          const follower = currentUser.id

          param = { term: { type: compositionType, follower }, recommended: false}
          let routeOption = {follow: ''}
          onRequestList && onRequestList(param, routeOption)
        } else {
            message.destroy()
            message.warning(`请登录后查看`)

            setTimeout(() => {
                window.location.href = `/signin?c=${encodeURIComponent(window.location.href)}`
            }, 2000)
        }
        break
      case 'recommended':
        onRecommended && onRecommended()
        break
    }

    this.changeSortKey(e.key)
  }

  handleAuthorTypeSelect = (e) => {
    const { condition={}, onRequestList } = this.props
    const key = Number(e.key) || null
    const param = {
      ...condition,
      term: { ...condition.term, type: key},
      page: 1,
    }
    const routeOption = {type: key}
    if (onRequestList) {
      onRequestList(param, routeOption)
    }
    this.changeAuthorType(key)
  }

  handleSelectArea = (option) => {
    const { onRequestList, condition } = this.props
    const { type, cityId, cityName, provinceId, provinceName } = option
    let param = { }
    let routeOption = {}
    let currentArea = ''

    if(type === 'province') {
      currentArea = provinceName
        param = {
          ...condition,
            term: {
                ...condition.term,
                province: [provinceId],
                city: undefined,
            }
        }
        routeOption = {province: provinceId}
    } else if (type === 'city') {
      currentArea = cityName
        param = {
          ...condition,
            term: {
                ...condition.term,
                province: [provinceId],
                city: [cityId]
            }
        }
        routeOption = {province: provinceId, city: cityId}
    } else {
      currentArea = '全部地区'
      param = {
        ...condition,
        term: {
          ...condition.term,
          province: undefined,
          city: undefined,
        }
      }
    } 

    onRequestList && onRequestList(param, routeOption)
    this.setState({ currentArea })
    this.closeHighMenu()
  }


  render() {
    const { showHighMenu, maskHeight, sortKey, authorType, currentArea } = this.state

    const currSortItem = sorts.find(item => item.key === sortKey) || sorts[0]
    const currAuthorTypeItem = authorTypes.find(item => item.key === authorType) || authorTypes[0]

    const sortMenu = (<Menu 
        className="sort-drop-overlay-menu"
        onClick={this.handleSortSelect}
      >
        {sorts.map(item => (
          <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
        ))}
      </Menu>)
    const authorTypeMenu = (<Menu 
        className="sort-drop-overlay-menu"
        onClick={this.handleAuthorTypeSelect}
      >
        {authorTypes.map(item => (
          <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
        ))}
      </Menu>)
    

    
    return (
      <div className="mb-filter-bar-wrapper author-filter-bar">
        <div className="mb-sub-filter-bar">
          <div className="filter-left">
            <div className="filter-item">
              <Dropdown trigger={['click']} overlay={sortMenu}>
                <div className="sort-dropdown-btn" onClick={this.handleDropdownClick}><span>{currSortItem.name}</span> <CustomIcon name="arrow-down" /></div>
              </Dropdown>
            </div>
            <div className="filter-item">
              <Dropdown trigger={['click']} overlay={authorTypeMenu}>
                <div className="sort-dropdown-btn" onClick={this.handleDropdownClick}><span>{currAuthorTypeItem.name}</span> <CustomIcon name="arrow-down" /></div>
              </Dropdown>
            </div>
          </div>
          <div className="filter-right">
              <span onClick={this.handleToggleHighMenu}>
                <span>{currentArea}</span> <CustomIcon name="screening" />
              </span>
          </div>
        </div>
        {showHighMenu && <div className="classify-filter-panel">
          <div 
            className="classify-fliter-mask"  
            onClick={this.handleToggleHighMenu}
            style={{height: maskHeight}}
          ></div>
          <AreaPanel
            className="mb-area-panel"
            onSelect={this.handleSelectArea}
          />
        </div>}
      </div>
    )
  }
}

export default AuthorSubFilterBar