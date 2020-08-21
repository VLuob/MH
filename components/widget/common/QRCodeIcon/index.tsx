import { Popover } from 'antd'
import QRCode from 'qrcode.react'
import CustomIcon from '../Icon'
import './index.less'

const QRCodeIcon = (props) => {
  const { url, size, placement } = props
  return (
    <Popover
      placement={placement || 'bottom'}
      content={
        <div className="author-url-qrcode-popover">
          <QRCode 
            value={url}
            size={size || 145}
          />
          <div className="text">手机扫一扫查看</div>
        </div>
      }
    >
      <span className="author-url-qrcode-icon">
        <CustomIcon name="qrcode" />
      </span>
    </Popover>
  )
}
export default QRCodeIcon