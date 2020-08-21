
import QRCode from 'qrcode.react'
import { Spin, Modal } from 'antd'

const WxpayQrcode = (props) => {
  const { url, loading, visible, onCancel } = props
  
  return (
    <Modal
      visible={visible}
      onCancel={onCancel}
      maskClosable={false}
      footer={null}
      width={300}
    >
      <div className="wxpay-qrcode-box">
        <div className="qrcode-header">
          扫码支付
        </div>
        <div className="qrcode-content">
          <QRCode 
            id="qrcode-canvas"
            value={url || ''} 
            size={168} 
          />
          {loading && <div className="loading-box">
            <div className="spin-box">
              <Spin />
            </div>
            <div className="spin-text">
              加载中，请稍后
            </div>
          </div>}
        </div>
        <div className="qrcode-footer">
          使用<span className="text-wx">微信</span>APP扫码完成支付
        </div>
      </div>
    </Modal>
  )
}

export default WxpayQrcode