import { Dropdown, Menu } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import './index.less'

const DropdownPublish = (props) => {
  const { children, onPublish, currentUser={} } = props
  const isLogin = !!currentUser.id
  const hasAuthor = currentUser.hasAuthor
  
  const handlePublish = (key) => {
    if (key === 'publish_enquiry') {
      window.location.href = '/enquiry/new'
    } else {
      if (isLogin) {
        if (hasAuthor) {
          if (key === 'publish_shots') {
            window.location.href = '/shots/new'
          } else if (key === 'publish_article') {
            window.location.href = '/article/new'
          } else if (key === 'publish_service') {
            window.location.href = '/service/new'
          }
        } else {
          window.location.href = '/creator'
        }
      } else {
        window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
      }
    }
  }

  const handlePublishSelect = e => {
    handlePublish(e.key)
  }
  const handleClick = () => {
    handlePublish('publish_shots')
  }

  return (
    <Dropdown
      placement="bottomCenter"
      overlay={<Menu className="btn-publish-menu" onClick={handlePublishSelect}>
        <Menu.Item key="publish_shots"><CustomIcon name="shots-publish" /> 发布作品</Menu.Item>
        <Menu.Item key="publish_article"><CustomIcon name="article-publish" /> 发布文章</Menu.Item>
        <Menu.Item key="publish_enquiry"><CustomIcon name="enquiry" /> 发布询价</Menu.Item>
        <Menu.Item key="publish_service"><CustomIcon name="relation-service" /> 发布服务</Menu.Item>
      </Menu>}
    >
      <a className="menu-btn publish" onClick={handleClick}>
        <div className="icon publish">
          <CustomIcon name="nav-publish" />
        </div>
        <div className="name">
          发布
          </div>
      </a>
    </Dropdown>
  )
}

export default DropdownPublish