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
  key: CommonSortType.FOLLOW,
  name: '关注',
}]

const AuthorListHeader = (props) => {
  const { onSortChange, onTypeChange, onFormChange, onAreaChange, forms=[], sort, authorType=0, formCode=0, provinceId, cityId } = props
  const handleSortClick = (e) => {
    if (onSortChange) onSortChange(e.key)
  }
  const handleTypeClick = (type) => {
    if (onTypeChange) onTypeChange(type)
  }
  const handleFormClick = (code) => {
    if (onFormChange) onFormChange(code)
  }
  const handleAreaChange = (option) => {
    if (onAreaChange) onAreaChange(option)
  }

  const sortItem = authorSorts.find(item => item.key === sort) || authorSorts[0]
  // const typeItem = authorTypes.find(item => item.key === Number(authorType)) || authorTypes[0]

  return (
    <div className="author-list-header">
      <div className="author-list-nav">
        <div className="author-list-container nav-wrapper">
          <div className="nav-left">
            <div className="sort">
              <Dropdown
                overlay={<Menu onClick={handleSortClick}>
                {authorSorts.map(item => (
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
            <div className="author-type-nav">
              {authorTypes.map(item => (
                <div className={classnames('nav-tag', {active: item.key === Number(authorType)})} key={item.key} onClick={e => handleTypeClick(item.key)}>{item.name}</div>
              ))}
            </div>
          </div>
          <div className="nav-right">
            <Button type="primary" href="/creator" target="_blank">创建创作者</Button>
          </div>
        </div>
      </div>
      <div className="author-list-subnav">
        <div className="author-list-container subnav-wrapper">
          <div className="sub-nav-label">形式</div>
          <div className="sub-nav-content">
            <div className={classnames('nav-tag', {active: 0 === Number(formCode)})} onClick={e => handleFormClick(0)}>全部</div>
            {forms.map(item => (
              <div 
                key={item.id}
                className={classnames('nav-tag', {active: item.code === Number(formCode)})} 
                onClick={e => handleFormClick(item.code)}
              >
                {item.name}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AuthorListHeader