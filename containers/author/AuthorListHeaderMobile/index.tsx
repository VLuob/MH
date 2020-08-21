import { Component } from 'react'
import { Dropdown, Menu, message } from 'antd'

import { CommonSortType, AuthorType } from '@base/enums'
import { config } from '@utils'

import CustomIcon from '@components/widget/common/Icon'
import AreaDropdown from '@components/common/AreaDropdown'
import ClassifyDropdown from '@components/common/ClassifyDropdown'

import './index.less'

const authorSorts = [{
  key: CommonSortType.RECOMMEND,
  name: '推荐',
}, {
  key: CommonSortType.HOT,
  name: '热门',
}, {
  key: CommonSortType.NEWEST,
  name: '最新',
}, {
  key: CommonSortType.SHOTS,
  name: '作品',
}, {
  key: CommonSortType.SERVICE,
  name: '服务',
}, {
  key: CommonSortType.FOLLOW,
  name: '关注',
}]

const authorTypes = [{
  key: 0,
  name: '全部'
}, {
  key: AuthorType.PERSONAL,
  name: '个人'
}, {
  key: AuthorType.BRANDER,
  name: '品牌主'
}, {
  key: AuthorType.SERVER,
  name: '服务商'
}]


class AuthorSubFilterBar extends Component {
  handleSortSelect = (e) => {
    const { onSortChange } = this.props
    if (onSortChange) onSortChange(e.key)
  }

  handleAuthorTypeSelect = (e) => {
    const { onTypeChange } = this.props
    if (onTypeChange) onTypeChange(Number(e.key))
  }


  handleAreaChange = (option) => {
    const { onAreaChange } = this.props
    if (onAreaChange) onAreaChange(option)
  }


  render() {
    const { sort, authorType, provinceId, cityId, } = this.props

    const currSortItem = authorSorts.find(item => item.key === sort) || authorSorts[0]
    const currAuthorTypeItem = authorTypes.find(item => item.key === Number(authorType)) || authorTypes[0]

    const sortMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleSortSelect}
    >
      {authorSorts.map(item => (
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
          <div className="filter-item">
            <Dropdown trigger={['click']} overlay={sortMenu}>
              <div className="sort-dropdown-btn"><span>{currSortItem.name}</span> <CustomIcon name="arrow-down" /></div>
            </Dropdown>
          </div>
          <div className="filter-item">
            <Dropdown trigger={['click']} overlay={authorTypeMenu}>
              <div className="sort-dropdown-btn"><span>{currAuthorTypeItem.key ? currAuthorTypeItem.name : '创作者类型'}</span> <CustomIcon name="arrow-down" /></div>
            </Dropdown>
          </div>
          <div className="filter-item">
            <AreaDropdown
              trigger="click"
              provinceId={provinceId}
              cityId={cityId}
              areaTitle="地区"
              onChange={this.handleAreaChange}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default AuthorSubFilterBar