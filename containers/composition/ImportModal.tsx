import { PureComponent } from 'react'
import { Modal, Button, Input } from 'antd'


export interface Props {
  onCancel: Function
  onOk: Function
}

export default class ImportModal extends PureComponent<Props> {
  state = {
    url: '',
  }

  handleChange = e => {
    this.setState({url: e.target.value})
  }
  handleOk = () => {
    const { onOk } = this.props
    const { url } = this.state
    if (onOk) {
      onOk(url)
    }
  }
  render() {
    const { onCancel, visible, loading } = this.props
    const { url } = this.state
    return (
      <Modal
        className="modal-base"
        title="导入外部文章"
        width={550}
        visible={visible}
        onCancel={onCancel}
        onOk={this.handleOk}
        footer={[
          <Button key="cancel" onClick={onCancel}>取消</Button>,
          <Button key="ok" type="primary" onClick={this.handleOk} disabled={loading} loading={loading}>{loading ? '正在导入中' : '一键导入'}</Button>,
        ]}
      >
        <div className="modal-import-container">
          <Input 
            placeholder="在此粘贴外部文章链接，如：微信公众号文章链接，头条号文章链接等"
            value={url} 
            onChange={this.handleChange} 
          />
          <div className="import-tips">每日最多可导入20次</div>
        </div>
      </Modal>
    )
  }
}