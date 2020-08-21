import { Component } from 'react'
import jsCookie from 'js-cookie'
import { Dropdown, Menu, message, Divider } from 'antd'

import { CommonSortType } from '@base/enums'

import CustomIcon from '@components/widget/common/Icon'
import ClassifyDropdown from '@components/common/ClassifyDropdown'

import './index.less'

const shotsSorts = [{
  key: CommonSortType.RECOMMEND,
  name: '推荐',
}, {
  key: CommonSortType.HOT,
  name: '热门',
}, {
  key: CommonSortType.NEWEST,
  name: '最新',
}, {
  key: CommonSortType.SERVICE,
  name: '服务',
}, {
  key: CommonSortType.FOLLOW,
  name: '关注',
}]


class ShotsListHeaderMobile extends Component {

  changeSortKey(key) {
    this.setState({ sortKey: key })
  }

  handleSortSelect = (e) => {
    const { sort, onSortChange } = this.props
    if (e.key === sort) {
      return
    }
    if (onSortChange) onSortChange(e.key)
  }

  handleCategoryChange = value => {
    const { onCategoryChange } = this.props
    if (onCategoryChange) {
      onCategoryChange(value)
    }
  }

  handleFormChange = value => {
    const { onFormChange } = this.props
    if (onFormChange) {
      onFormChange(value)
    }
  }

  render() {
    const { categoryCode = 0, formCode = 0, categories = [], forms = [], sort } = this.props

    const currSortItem = shotsSorts.find(item => item.key === sort) || shotsSorts[0]

    const sortMenu = (<Menu
      className="sort-drop-overlay-menu"
      onClick={this.handleSortSelect}
    >
      {shotsSorts.map(item => (
        <Menu.Item key={item.key} value={item.key}>{item.name}</Menu.Item>
      ))}
    </Menu>)


    return (
      <div className="mb-filter-bar-wrapper">
        <div className="mb-sub-filter-bar">
          <div className="filter-item">
            <Dropdown trigger={['click']} overlay={sortMenu}>
              <div className="sort-dropdown-btn"><span>{currSortItem.name}</span> <CustomIcon name="arrow-down" /></div>
            </Dropdown>
          </div>
          <div className="filter-item">
            <ClassifyDropdown
              classifyName="形式"
              currentId={Number(formCode)}
              dataSource={forms}
              onChange={this.handleFormChange}
              renderTitle={(option) => <div className="filter-dropdown-btn"><span>{option.name || '形式'}</span> <CustomIcon name="arrow-down" /></div>}
            />
          </div>
          <div className="filter-item">
            <ClassifyDropdown
              classifyName="品类"
              currentId={Number(categoryCode)}
              dataSource={categories}
              onChange={this.handleCategoryChange}
              renderTitle={(option) => <div className="filter-dropdown-btn"><span>{option.name || '品类'}</span> <CustomIcon name="arrow-down" /></div>}
            />
          </div>
        </div>
      </div>
    )
  }
}

export default ShotsListHeaderMobile