import { Dropdown, Menu, Tooltip, Avatar } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import CoverCarousel from '../CoverCarousel'

import { ServiceStatus } from '@base/enums'

import './index.less'

const ServiceItem = (props) => {
  const { item, onEdit, onRemove, onPreview, showOperation, hideAuthor } = props

  const handleOperation = (e) => {
    switch (e.key) {
      case 'edit':
        if (onEdit) onEdit(item)
        break
      case 'delete':
        if (onRemove) onRemove(item)
        break
    }
  }

  const handleClick = () => {
    switch (item.status) {
      case ServiceStatus.PASSED:
        window.open(`/service/${item.id}`)
        break
      case ServiceStatus.AUDITING:
      case ServiceStatus.REFUSE:
      case ServiceStatus.DRAFT:
        // 跳转到预览
        if (onPreview) onPreview(item)
        break
    }
  }

  return (
    <div className="service-item">
      <div className="service-item-cover">
        <CoverCarousel
          list={item.authorServiceCompositions}
          onClick={handleClick}
        />
        <Tooltip title={'创意形式：' +item.formName}>
          <div className="form-tag">
            {item.formName}
          </div>
        </Tooltip>
      </div>
      <div className="service-item-content">
        {!hideAuthor && <div className="author-wrapper">
          <div className="author-avatar">
            <a href={`/author/${item.authorCode}`} target="_blank"><Avatar src={item.authorAvatar} size={40} /></a>
          </div>
          <div className="author-info">
            <div className="nick"><a href={`/author/${item.authorCode}`} target="_blank">{item.authorNickName}</a></div>
            <div className="intro"><UserIdentityComp currentType={Number(item.authorType)} /></div>
          </div>
        </div>}
        <div className="name">
        <Tooltip title={item.name}>
          <a onClick={handleClick}>{item.name}</a>
        </Tooltip>
        </div>
        <div className="footer">
          <div className="intro">
            <Tooltip title={`中位价≈ ${item.minPrice || 0}元`}>
              <span className="price">
                中位价≈ {item.minPrice || 0}元
              </span>
            </Tooltip>
          </div>
          {showOperation && <div className="operation">
            <Dropdown
              placement="bottomRight"
              overlay={<Menu onClick={handleOperation}>
                <Menu.Item key="edit">编辑</Menu.Item>
                <Menu.Item key="delete">删除</Menu.Item>
              </Menu>}
            >
              <span><CustomIcon name="ellipsis" /></span>
            </Dropdown>
          </div>}
        </div>
      </div>
    </div>
  )
}

export default ServiceItem