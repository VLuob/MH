import { Dropdown, Button } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import './index.less'

const DropdownPricing = (props) => {
  const { children } = props
  return (
    <Dropdown
      placement="bottomCenter"
      overlay={<div className="menu-nav-overlay overlay-pricing">
        <div className="menu-overlay-item">
          <CustomIcon name="pricing-exposure" />
          <span className="text">
            曝光率提升100%
          </span>
        </div>
        <div className="menu-overlay-item">
          <CustomIcon name="pricing-add" />
          <span className="text">
            发布量不限量
          </span>
        </div>
        <div className="menu-overlay-item">
          <CustomIcon name="pricing-4k" />
          <span className="text">
            支持4K超清视频
          </span>
        </div>
        <div className="menu-overlay-item">
          <CustomIcon name="pricing-service" />
          <span className="text">
            甄选供应商库
          </span>
        </div>
        <div className="menu-overlay-item">
          <Button type="primary" href="/pricing">查看升级</Button>
        </div>
      </div>}
    >
      <a href="/pricing" className="menu-btn pricing">
        <div className="icon">
          <CustomIcon name="pricing-fire" />
        </div>
        <div className="name">推广</div>
      </a>
    </Dropdown>
  )
}

export default DropdownPricing