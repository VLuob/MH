import { Component } from 'react'
import { Row, Col, Input, Modal, Button } from 'antd'

import Geetest from '@components/features/Geetest'

export default class ModifyModal extends Component {
    render() {
        const { 
            GTVInfo, 
            onCancel, 
            gtResult, 
            phoneVal, 
            onConfirm,
            downCount, 
            verifyVal,
            currentItem, 
            isDownCount,
            phoneVisible, 
            handleGeetest, 
            handleDownCount,
            handlePhoneChange,
            handleVerifyChange,
            ...props 
        } = this.props

        return (
            <Modal
                className='modify-modal'
                title='修改手机号'
                visible={phoneVisible}
                onOk={onConfirm}
                onCancel={onCancel}
                forceRender={true}
                style={{ padding: '0 50px', height: '364px' }}
            >
                <Row>
                    <Col>
                        <Input type='number' 
                            value={phoneVal} 
                            className='new-border-input' 
                            onChange={handlePhoneChange} 
                            placeholder={`请输入新手机号`}
                            style={{ width: `100%`, height: 38 }} 
                        />
                    </Col>
                    <Col>
                        {!GTVInfo.success &&
                            <div className='gt-loading'>
                                <i className='m1-loading'><i></i></i> 正在加载验证码...
                                    </div>}
                        {GTVInfo.success &&
                            <Geetest 
                                {...GTVInfo}
                                onSuccess={handleGeetest}
                                width='100%' 
                            />}
                    </Col>
                    <Col>
                        <Input type='number' value={verifyVal} placeholder={`请输入验证码`} className='new-verify-input' onChange={handleVerifyChange} style={{ width: 250, height: 38, marginRight: 0 }} />
                        {!isDownCount ? <Button className='send-verify skyblue-themes' onClick={handleDownCount}>发送验证码</Button> :
                            <Button className='send-verify' disabled style={{ textIndent: '-0.3em' }}>重新发送({downCount})S</Button>}
                    </Col>
                </Row>
            </Modal>
        )
    }
}