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
  key: CommonSortType.FOLLOW,
  name: '关注',
}]

const ShotsListHeader = (props) => {
  const { onSortChange, onCategoryChange, onFormChange, onAreaChange, onPublish, categories=[], forms=[], sort, categoryCode=0, formCode=0, provinceId, cityId } = props
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
            <div className="sort">
              <Dropdown
                overlay={<Menu onClick={handleSortClick}>
                {shotsSorts.map(item => (
                  <Menu.Item key={item.key}>{item.name}</Menu.Item>
                ))}
              </Menu>}
              >
                <span>{sortItem.name} <CustomIcon name="arrow-down-o" /></span>
              </Dropdown>
            </div>
            <div className="area">
              <AreaDropdown
                provinceId={provinceId}
                cityId={cityId}
                onChange={handleAreaChange}
              />
            </div>
          </div>
          <div className="nav-center">
            <div className="classify-wrapper">
                <ClassifyDropdown
                    classifyName="品类"
                    currentId={Number(categoryCode)}
                    dataSource={categories}
                    onChange={handleCategoryChange}
                />
                <ClassifyDropdown
                    classifyName="形式"
                    currentId={Number(formCode)}
                    dataSource={forms}
                    onChange={handleFormChange}
                />
            </div>
          </div>
          <div className="nav-right">
            <Button type="primary" onClick={onPublish}>发布作品</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShotsListHeader