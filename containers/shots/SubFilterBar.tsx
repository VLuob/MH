import { Component } from 'react'
import jsCookie from 'js-cookie'
import { Dropdown, Menu, message } from 'antd'

import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'

import './SubFilterBar.less'

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


class SubFilterBar extends Component {
  constructor(props) {
    super(props)

    const sortKey = this.getSortKey()

    this.state = {
      showHighMenu: false,
      maskHeight: 0,
      sortKey,
    }
  }

  getSortKey() {
    const { query } = this.props
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

  changeSortKey(key) {
    this.setState({sortKey: key})
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

  handleCategoryChange = value => {
    const { onCategoryChange } = this.props

    if (onCategoryChange) {
      onCategoryChange(value)
    }
    this.closeHighMenu()
  }

  handleFormChange = value => {
    const { onFormChange } = this.props
    if (onFormChange) {
      onFormChange(value)
    }
    this.closeHighMenu()
  }

  render() {
    const { showHighMenu, maskHeight, sortKey } = this.state
    const { categoryId, formId, categories, forms, } = this.props

    const currSortItem = sorts.find(item => item.key === sortKey) || sorts[0]

    const sortMenu = (<Menu 
        className="sort-drop-overlay-menu"
        onClick={this.handleSortSelect}
      >
        {sorts.map(item => (
          <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
        ))}
      </Menu>)

    
    return (
      <div className="mb-filter-bar-wrapper">
        <div className="mb-sub-filter-bar">
          <div className="filter-left">
            <div className="filter-item">
              <Dropdown trigger={['click']} overlay={sortMenu}>
                <div className="sort-dropdown-btn"><span>{currSortItem.name}</span> <CustomIcon name="arrow-down" /></div>
              </Dropdown>
            </div>
          </div>
          <div className="filter-right">
              <span onClick={this.handleToggleHighMenu}>
                <span>高级筛选</span> <CustomIcon name="screening" />
              </span>
          </div>
        </div>
        {showHighMenu && <div className="classify-filter-panel">
          <div 
            className="classify-fliter-mask"  
            onClick={this.handleToggleHighMenu}
            style={{height: maskHeight}}
          ></div>
          <div className="classify-wrapper">
            <div className="classify-item">
              <ClassifyDropdown
                  classifyName="品类"
                  currentId={categoryId}
                  dataSource={categories}
                  onChange={this.handleCategoryChange}
              />
            </div>
            <div className="classify-item">
              <ClassifyDropdown
                  classifyName="形式"
                  currentId={formId}
                  dataSource={forms}
                  onChange={this.handleFormChange}
              />
            </div>
          </div>
        </div>}
      </div>
    )
  }
}

export default SubFilterBar