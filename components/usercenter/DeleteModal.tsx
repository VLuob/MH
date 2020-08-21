import { Component } from 'react'
import { Modal, Button } from 'antd'

export default class DeleteModal extends Component {
    render() {
        const { visible, onCancel, onConfirm, currentItem, ...props } = this.props

        return (
            <Modal
                className='safe-container-modal'
                centered={true}
                title='删除'
                footer={<>
                    <Button onClick={onCancel}>取消</Button>
                    <Button onClick={onConfirm} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                </>}
                visible={visible}
                width={400}
            > 您是否确认删除，删除后数据无法恢复！</Modal>
        )
    }
}