import { Modal } from 'antd'


const VipWechatModal = (props) => {
  const { visible, onVisible } = props
  return (
    <Modal
      visible={visible}
      onCancel={e => onVisible()}
      width={208}
      footer={null}
    >
      <div className="meihua_vip_wechat_qrcode">
        <img src="/static/images/weixin_vip_qrcode.png" width={160} alt="梅花网微信"/>
      </div>
    </Modal>
  )
}

export default VipWechatModal