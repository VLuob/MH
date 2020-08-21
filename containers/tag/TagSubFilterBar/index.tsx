import { Component } from 'react'
import jsCookie from 'js-cookie'
import { Dropdown, Menu, message } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import { CompositionTypes } from '@base/enums'

import './index.less'

const sorts = [
  {
    key: 'degree',
    name: '热门',
  }, {
    key: 'gmtPublish',
    name: `最新`,
  }
]
const typeMaps = [
  {
    key: CompositionTypes.SHOTS,
    name: '作品',
  }, {
    key: CompositionTypes.ARTICLE,
    name: '文章',
  }
]


class TagSubFilterBar extends Component {
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
    if (query.popular === '' || query.like === '' || query.read === '' || query.collection === '' || query.comment === '') {
      label = 'degree'
    } else if (query.newest === '') {
      label = 'gmtPublish'
    } 
    return label
  }

  handleToggleHighMenu = () => {
    this.setState({ showHighMenu: !this.state.showHighMenu })
    if (!this.state.showHighMenu) {
      const bodyHeight = document.querySelector('#__next').clientHeight
      this.setState({ maskHeight: bodyHeight })
    }
  }

  closeHighMenu() {
    this.setState({ showHighMenu: false })
  }

  changeSortKey(key) {
    this.setState({ sortKey: key })
  }

  handleSortChange = (e) => {
    const { sortKey } = this.state
    const { onRequestList, compositionType, currentUser = {} } = this.props
    let param = {}
    let routeOption = {}

    if (e.key === sortKey) {
      return
    }

    switch (e.key) {
      case 'degree':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: 'desc' }], recommended: false }
        onRequestList && onRequestList(param, routeOption)
        break
      case 'gmtPublish':
        param = { term: { type: compositionType }, sort: [{ key: e.key, value: `desc` }], recommended: false }
        onRequestList && onRequestList(param, routeOption)
        break
    }

    this.changeSortKey(e.key)
  }

  handleTypeSelect = (e) => {
    const { onTypeChange } = this.props
    if (onTypeChange) onTypeChange(Number(e.key))
  }

  render() {
    const { sortKey } = this.state
    const { compositionType } = this.props

    const currSortItem = sorts.find(item => item.key === sortKey) || sorts[0]
    const currTypeItem = typeMaps.find(item => item.key === compositionType) || typeMaps[0]

    const sortMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleSortChange}
    >
      {sorts.map(item => (
        <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
      ))}
    </Menu>)
    const typeMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleTypeSelect}
    >
      {typeMaps.map(item => (
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
            <div className="filter-item">
              <Dropdown trigger={['click']} overlay={typeMenu}>
                <div className="sort-dropdown-btn"><span>{currTypeItem.name}</span> <CustomIcon name="arrow-down" /></div>
              </Dropdown>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

export default TagSubFilterBar