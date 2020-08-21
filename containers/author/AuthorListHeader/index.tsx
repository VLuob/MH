import { useState } from 'react'
import classnames from 'classnames'
import { Dropdown, Menu, Button, } from 'antd'
import { CommonSortType, AuthorType } from '@base/enums'
import AreaDropdown from '@components/common/AreaDropdown'
import CustomIcon from '@components/widget/common/Icon'
import './index.less'

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

const AuthorListHeader = (props) => {
  const { onSortChange, onTypeChange, onFormChange, onAreaChange, forms=[], sort, authorType=0, formCode=0, provinceId, cityId } = props
  const handleSortClick = (e) => {
    if (onSortChange) onSortChange(e.key)
  }
  const handleTypeClick = (e) => {
    const type = Number(e.key)
    if (onTypeChange) onTypeChange(type)
  }
  const handleFormClick = (code) => {
    if (onFormChange) onFormChange(code)
  }
  const handleAreaChange = (option) => {
    if (onAreaChange) onAreaChange(option)
  }

  const sortItem = authorSorts.find(item => item.key === sort) || authorSorts[0]
  const typeItem = authorTypes.find(item => item.key === Number(authorType)) || authorTypes[0]

  return (
    <div className="author-list-header">
      <div className="author-list-nav">
        <div className="author-list-container nav-wrapper">
          <div className="nav-left">
            <div className="nav-item sort">
              <Dropdown
                overlay={<Menu onClick={handleSortClick}>
                {authorSorts.map(item => (
                  <Menu.Item key={item.key}>{item.name}</Menu.Item>
                ))}
              </Menu>}
              >
                <Button><span>{sortItem.name}</span> <CustomIcon name="arrow-down" /></Button>
              </Dropdown>
            </div>
            <div className="nav-item type">
              <Dropdown
                overlay={<Menu onClick={handleTypeClick}>
                {authorTypes.map(item => (
                  <Menu.Item key={item.key}>{item.name}</Menu.Item>
                ))}
              </Menu>}
              >
                <Button><span>{typeItem.name}</span> <CustomIcon name="arrow-down" /></Button>
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
          </div>
          <div className="nav-right">
            <ul className="fast-menu">
              <li><a href="/top/author!1" target="_blank"><CustomIcon name="statistics" />一周排行榜</a></li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthorListHeader