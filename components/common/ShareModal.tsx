import {Component} from 'react'
import QRCode from 'qrcode.react'
import { Modal, Icon } from 'antd'

class QrcodeModal extends Component {
  render() {
    const { visible, onCancel, url } = this.props
    return (
        <Modal 
          className="center"
          visible={visible} 
          onCancel={onCancel} 
          width={320}
          footer={null}
        >
            <div className="qrcode-modal">
              <header style={{marginBottom: '20px'}}>
                <Icon name="share" /> 分享二维码
              </header>
              <section style={{textAlign: 'center'}}>
                <div className="qrcode">
                  <QRCode 
                    value={url || ''} 
                    size={190} 
                  />
                </div>
                <p style={{marginTop: '20px'}}>打开微信，点击底部的“发现”，<br/>
使用“扫一扫”即可将网页分享至朋友圈。</p>
              </section>
            </div>
        </Modal>
    )
  }
}

export default QrcodeModal