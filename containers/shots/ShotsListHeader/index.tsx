import { useState } from 'react'
import classnames from 'classnames'
import { Dropdown, Menu, Button, } from 'antd'
import { CommonSortType } from '@base/enums'
import AreaDropdown from '@components/common/AreaDropdown'
import ClassifyDropdown from '@components/common/ClassifyDropdown'
import CustomIcon from '@components/widget/common/Icon'

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

const ShotsListHeader = (props) => {
  const { onSortChange, onCategoryChange, onFormChange, onAreaChange, onPublish, categories = [], forms = [], sort, categoryCode = 0, formCode = 0, provinceId, cityId } = props
  const handleSortClick = (e) => {
    if (onSortChange) onSortChange(e.key)
  }
  const handleCategoryChange = (code) => {
    if (onCategoryChange) onCategoryChange(code)
  }
  const handleFormChange = (code) => {
    if (onFormChange) onFormChange(code)
  }
  const handleAreaChange = (option) => {
    if (onAreaChange) onAreaChange(option)
  }

  const sortItem = shotsSorts.find(item => item.key === sort) || shotsSorts[0]

  return (
    <div className="shots-list-header">
      <div className="shots-list-nav">
        <div className="shots-list-container nav-wrapper">
          <div className="nav-left">
            <div className="nav-item sort">
              <Dropdown
                overlay={<Menu onClick={handleSortClick}>
                  {shotsSorts.map(item => (
                    <Menu.Item key={item.key}>{item.name}</Menu.Item>
                  ))}
                </Menu>}
              >
                <Button><span>{sortItem.name}</span> <CustomIcon name="arrow-down" /></Button>
              </Dropdown>
            </div>
            <div className="nav-item area">
              <AreaDropdown
                provinceId={provinceId}
                cityId={cityId}
                onChange={handleAreaChange}
                renderTitle={({title}) => (
                  <Button><span>{title}</span> <CustomIcon name="arrow-down" /></Button>
                )}
              />
            </div>
            <div className="nav-item classify">
              <ClassifyDropdown
                classifyName="品类"
                currentId={Number(categoryCode)}
                dataSource={categories}
                onChange={handleCategoryChange}
              />
            </div>
          </div>
          
          <div className="nav-right">
            <ul className="fast-menu">
              <li><a href="/top/shots!1" target="_blank"><CustomIcon name="statistics" />一周排行榜</a></li>
              <li><a href="/topic" target="_blank"><CustomIcon name="topic" />最新热点专题</a></li>
              <li><a href="/collection" target="_blank"><CustomIcon name="favorites" />公开收藏夹</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShotsListHeader