import { Component, createRef } from 'react'
import { AutoComplete, Tabs, Menu, Button, Popover } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import areaData from '@base/system/area'

import './index.less'

const TabPane = Tabs.TabPane
const SubMenu = Menu.SubMenu
const MenuItemGroup = Menu.ItemGroup

let dataCompletedSource = []
areaData.forEach(item => {
  dataCompletedSource = [...dataCompletedSource, ...item.provinces]

  item.provinces.forEach(t => {
    dataCompletedSource = [...dataCompletedSource, ...t.cities]
  })
})
const dataSource = Array.from(new Set(dataCompletedSource.map(l => l.name)))

const getArea = (provinceId, cityId) => {
  let label = ''
  const provinces = []
  const cities = []
  areaData.forEach(area => {
      area.provinces.forEach(province => {
          cities.push(...province.cities)
      })
      provinces.push(...area.provinces)
  })
  const currProvince = provinces.find(p => p.id === provinceId) || {}
  const currCity = cities.find(c => c.id === cityId) || {}
  label += currProvince.name || ''
  label += currCity.name || ''
  return label
}

class AreaDropdown extends Component {
  constructor(props) {
    super(props)
    const { areaTitle } = props
    this.otherRef = createRef(null)

    this.state = {
      currentArea: getArea(Number(props.provinceId), Number(props.cityId)) || areaTitle || '全部地区'
    }
  }

  onSelect = e => {
    const { onChange } = this.props
    let option = {}
    const current = dataCompletedSource.filter(l => l.name === e)[0]

    if (Object.keys(current).some(l => l === `cities`)) {
      option = { province: current.id }
    } else {
      option = { city: current.id }
    }

    this.setState({ currentArea: current.name })
    onChange && onChange(option)
  }

  areaClick = (record) => {
    const { onChange } = this.props
    const { type, val, name } = record
    let option = {}

    if (type === `provinces`) {
      option = { province: val }
    } else {
      const { pVal } = option
      option = { province: pVal, city: val }
    }

    this.setState({ currentArea: name })
    onChange && onChange(option)
  }

  renderMenu = list => {
    const { currentTab } = this.state

    return list.map(l => {
      if (!l.menu) {
        if (l.key === 'area') {
          return (
            <Menu.Item key={l.key} style={l.style} className='area-menu'>
              {l.name}
              {l.icon && <CustomIcon name={l.icon} />}
            </Menu.Item>
          )
        }

        return (
          <Menu.Item key={l.key} className={l.key} >
            {l.icon && <CustomIcon name={l.icon} />}
            {l.name}
          </Menu.Item>
        )
      } else {
        return (
          <SubMenu title={
            <>
              {/* <span>{l.name}</span>  */}
              <span>{currentTab}</span>
              <CustomIcon name='arrow-down' style={{ marginRight: 0 }} />
            </>
          } key={l.key} style={l.styles}>
            <MenuItemGroup>
              {this.renderSubMenu(l.menu)}
            </MenuItemGroup>
          </SubMenu>
        )
      }
    })
  }

  handleSelectAllArea = () => {
    const { onChange, areaTitle } = this.props
    const option = { province: 0, city: 0 }
    this.setState({ currentArea: areaTitle || '全部地区' })
    onChange && onChange(option)
  }

  renderSubMenu = list => list.map(l => {
    return (
      l.key !== key ? <Menu.Item style={{
        fontFamily: 'PingFangSC-Light',
        fontSize: '13px',
        color: '#000000'
      }} key={l.key}>
        {l.name}
      </Menu.Item> : null
    )
  })

  render() {
    const { placement, trigger, renderTitle } = this.props
    const { currentArea } = this.state
    let currentTitle 
    if (renderTitle) {
      if (typeof renderTitle === 'function') {
        currentTitle = renderTitle({title: currentArea})
      } else {
        currentTitle = renderTitle
      }
    } else {
      currentTitle = <span>{currentArea} <CustomIcon name="arrow-down" /></span>
    }

    return (
      <Popover
        trigger={trigger || 'hover'}
        placement={placement || 'bottomLeft'}
        content={
          <div className='area-panel area-panel-popover' id='area-panel'>
            <div className='search-part'>
              <span className='area-meta' onClick={this.handleSelectAllArea}>{`全部地区`}</span>
              <AutoComplete
                dataSource={dataSource}
                style={{ width: 200 }}
                onSelect={this.onSelect}
                placeholder={`请输入城市名`}
                filterOption={(inputValue, option) =>
                  option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
                }
              />
            </div>
            <Tabs className='area-tabs' type='card'>
              {areaData.map(l => {
                return (
                  <TabPane tab={l.name} key={l.id}>
                    {l.provinces.map(m => {
                      return (
                        <div className='area-address clearfix' key={m.id}>
                          <span key={m.id} className='area-provinces' onClick={e => this.areaClick({ type: `provinces`, val: m.id, name: m.name })}>{m.name}</span>
                          <div className='area-cities-group'>
                            {m.cities.map(t => {
                              return (
                                <span key={t.id} className='area-cities' onClick={e => this.areaClick({ type: `cities`, val: t.id, name: t.name, pVal: m.id })}>{t.name}</span>
                              )
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </TabPane>
                )
              })}
            </Tabs>
          </div>
        }
      >
        {currentTitle}
      </Popover>
    )
  }
}

export default AreaDropdown