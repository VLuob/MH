import { Dropdown, Badge } from 'antd'
import CustomIcon from '@components/widget/common/Icon'
import LetterNavDropPanel from '@containers/usercenter/letter/LetterNavDropPanel'
import './index.less'

const DropdownPricing = (props) => {
  const { letterCount } = props
  return (
    <Dropdown
      overlay={<LetterNavDropPanel />}
      placement="bottomCenter"
    >
      <a className="menu-btn" href="/personal/message">
        <Badge count={letterCount}>
          <div className="icon">
            <CustomIcon name="message" />
          </div>
        </Badge>
        <div className="name">
          消息
          </div>
      </a>
    </Dropdown>
  )
}

export default DropdownPricing