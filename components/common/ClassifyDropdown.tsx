import { Component } from 'react'
import classnames from 'classnames'

import { Row, Col, Icon, Dropdown, Menu, Button } from 'antd'

import CIcon from '@components/widget/common/Icon'
import { toJS } from 'mobx'
import filters from '@base/system/filters'


// const classifyIconMap = {
//   // 品类
//   '药品诊疗': 'medical',
//   '化妆品及个人用品': 'cosmetics',
//   '家居用品': 'lamp',
//   '营养保健品': 'healthcare',
//   '母婴玩具': 'feeding-bottle',
//   '服装与饰品': 'clothing',
//   '食品饮料': 'cup',
//   '房地产': 'estate',
//   '家电': 'electrical',
//   '电子产品': 'computer',
//   '电商零售': 'e-commerce',
//   '车': 'car',
//   '物流服务': 'logistics',
//   '教育培训': 'education',
//   '网站与软件': 'ie',
//   '文化娱乐': 'book',
//   '游戏': 'game',
//   '体育运动': 'badminton',
//   '餐饮服务': 'restaurant',
//   '金融保险': 'finance',
//   '旅游航空': 'airplane',

//   // 形式
//   '平面': 'plane-picture',
//   '互动广告': 'swap-ad',
//   '户外广告': 'outdoor-ad',
//   '插画与动画': 'palette',
//   '视频广告': 'video-ad',
//   '微电影': 'micro-film',
//   '介绍视频': 'introducing-video',
//   '应用': 'application',
//   '网站': 'site',
//   '落地页/H5': 'h5',
//   '展示设计': 'display-design',
//   '包装设计': 'packing',
//   '视觉识别系统': 'eye-vi',
//   '商务摄影': 'camera',
//   '线下公关活动': 'handshake',
//   '短视频': 'short-video',
//   '音频': 'audio',

//   // 其他
//   '其他': 'classification',
// }

const classifyIconMap = filters.classifyIconMap

const MenuItemGroup = Menu.ItemGroup
const MenuItem = Menu.Item



interface State {
  currentId: number
}

interface Props {
  currentId?: number
  classifyName?: string,
  dataSource: Array<any>
  onChange?: Function
  renderTitle?: Function
}

export default class ClassifyDropdown extends Component<Props, State> {
  state = {
    currentId: 0,
  }

  componentDidMount() {
    const { currentId, initialFn } = this.props
    initialFn && this.handleClick(currentId)
    this.setState({ currentId: currentId || 0 })
  }

  handleClick = (currentId, item=null) => {
    const { onChange } = this.props

    onChange && onChange(currentId, item)
    this.setState({ currentId })
  }

  handleVisibleChange = (visible) => {
    const { onVisible, onHide } = this.props
    if (visible) {
      if (onVisible) onVisible()
    } else {
      if (onHide) onHide()
    }
  }

  render() {
    const { currentId } = this.state
    const { classifyName, dataSource, renderTitle, showTitleIcon } = this.props

    const currentItem = dataSource.find(item => item.code === currentId) || { id: 0, name: '' }
    const currentSettings = JSON.parse(currentItem.settings || '{}')
    const currentIcon = currentSettings.icon || classifyIconMap[currentItem.name] || 'classification'
    let currentTitle 
    if (renderTitle) {
      if (typeof renderTitle === 'function') {
        currentTitle = renderTitle({...currentItem, icon: currentIcon})
      } else {
        currentTitle = renderTitle
      }
    } else {
      if (showTitleIcon) {
        currentTitle = <Button>{currentItem.id === 0 ? `全部${classifyName}` : <span><CIcon name={currentIcon} /> {currentItem.name}</span>} <CIcon name="arrow-down" /></Button>
      } else {
        currentTitle = <Button>{currentItem.id === 0 ? `全部${classifyName}` : <span>{currentItem.name}</span>} <CIcon name="arrow-down" /></Button>
      }
    }
    const menu = (
      <Menu
        className="classify-dropdown-menu"
      >
        <MenuItemGroup title={
          <Button
            className={classnames({ active: !currentId })}
            onClick={e => this.handleClick(0, {})}
          >全部{classifyName}</Button>
        }>
          {dataSource.map(item => {
            const settings = JSON.parse(item.settings || '{}')
            return (
              <MenuItem
                key={item.id}
                className={classnames({ active: currentId === item.code })}
                onClick={e => this.handleClick(item.code, item)}
              >
                <CIcon name={settings.icon || classifyIconMap[item.name] || 'classification'} />{item.name}
              </MenuItem>
            )
          })}
        </MenuItemGroup>
      </Menu>
    )

    return (
      <Dropdown 
        overlay={menu}
        onVisibleChange={this.handleVisibleChange}
      >
        {currentTitle}
      </Dropdown>
    )
  }
}