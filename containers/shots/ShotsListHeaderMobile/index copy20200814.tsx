import { Component } from 'react'
import jsCookie from 'js-cookie'
import { Dropdown, Menu, message } from 'antd'

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
  constructor(props) {
    super(props)
    this.state = {
      showHighMenu: false,
      maskHeight: 0,
    }
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
    const { showHighMenu, maskHeight } = this.state
    const { categoryCode=0, formCode=0, categories=[], forms=[], sort } = this.props

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
                  currentId={Number(categoryCode)}
                  dataSource={categories}
                  onChange={this.handleCategoryChange}
              />
            </div>
            <div className="classify-item">
              <ClassifyDropdown
                  classifyName="形式"
                  currentId={Number(formCode)}
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

export default ShotsListHeaderMobile