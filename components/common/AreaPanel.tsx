import { Component } from 'react'
import classnames from 'classnames'
import { AutoComplete, Tabs } from 'antd'

import area from '@base/system/area'

const TabPane = Tabs.TabPane


let dataCompletedSource = []
area.forEach(item => {
    dataCompletedSource = [...dataCompletedSource, ...item.provinces]

    item.provinces.forEach(t => {
        dataCompletedSource = [...dataCompletedSource, ...t.cities]
    })
})

const dataSource = Array.from(new Set(dataCompletedSource.map(l => l.name)))

class AreaPanel extends Component {

  searchFn = (v) => {

  }
  onSelectAutoComplete = (e) => {
    const { onSelect } = this.props
    let param = {}
    const current = dataCompletedSource.filter(l => l.name === e)[0]

    if(Object.keys(current).some(l => l === `cities`)) {
        param = {
          type: 'provinces',
          provinceId: current.id,
          provinceName: current.name,
        }
    } else {
        param = {
          type: 'city',
          city: current.id,
          cityName: current.name,
        }
    }
    if (onSelect) {
      onSelect(param)
    }
  }

  selectArea = (option) => {
    const { onSelect } = this.props
    if (onSelect) {
      onSelect(option)
    }
  }

  render() {
    const { className } = this.props

    return (
      <div className={classnames('area-panel', className)} id='area-panel'>
        <div className='search-part'>
          <span className='area-meta' onClick={e => this.selectArea({type: 'all'})}>{`全部地区`}</span>
          <AutoComplete 
            dataSource={dataSource}
            style={{ width: 200 }}
            onSelect={this.onSelectAutoComplete}
            onSearch={value => this.searchFn(value)}
            placeholder={`请输入城市名`}
            filterOption={(inputValue, option) =>
              option.props.children.toUpperCase().indexOf(inputValue.toUpperCase()) !== -1
            }
          />
        </div>
        <Tabs className='area-tabs' type='card'>
          {area.map(l => {
            return (
              <TabPane tab={l.name} key={l.id}>
                {l.provinces.map(m => {
                  return (
                    <div className='area-address clearfix' key={m.id}>
                      <span key={m.id} className='area-provinces' onClick={e => this.selectArea({ type: `province`, provinceId: m.id, provinceName: m.name })}>{m.name}</span>
                      <div className='area-cities-group'>
                        {m.cities.map(t => {
                          return (
                            <span key={t.id} className='area-cities' onClick={e => this.selectArea({ type: `city`, cityId: t.id, cityName: t.name, provinceId: m.id, provinceName: m.name })}>{t.name}</span>
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
    )
  }
}

export default AreaPanel