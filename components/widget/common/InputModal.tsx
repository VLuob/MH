import { Component } from 'react'
import { Input, Modal, Button } from 'antd'

export default class InputModal extends Component {
    render() {
        const { title, visible, handleOk, onChange, hideModal, value } = this.props

        return (
            <Modal
                className='input-modal'   
                title={title || '输入模态框'}
                visible={visible}
                onOk={hideModal}
                onCancel={hideModal}
                // okText='确认'
                // cancelText='取消'
                footer={
                    <div>
                        <Button onClick={hideModal} className='default-themes'>取消</Button>
                        <Button onClick={handleOk} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                    </div>
                }
            >
                <Input placeholder='请输入名称' value={value} onChange={onChange} />
            </Modal>
        )
    }
}
