import { utils } from '@utils'
import { Component } from 'react'
import { Link, Router } from '@routes'

import Geetest from '@components/features/Geetest'
import { inject, observer } from 'mobx-react'
import { filterEmail } from '@base/system/account'
import { message, Row, Col, Icon, Input, Modal, Button, Form } from 'antd'
import { toJS } from 'mobx'

let seconds = 60
@inject(stores => {
    const { accountStore, userCenterStore } = stores.store
    const { GTVInfo, GTVNewInfo, phoneInfo, fetchEmailBind, fetchPhoneBind, isEmailNextStep, 
        isPhoneNextStep, fetchPhoneVeriBind, fetchGTVerifyCode, fetchNewGTVerifyCode, fetchChangePassword } = accountStore
    const { personBaseInfo } = userCenterStore

    return {
        GTVInfo,
        GTVNewInfo,
        phoneInfo,
        personBaseInfo,
        fetchEmailBind,
        fetchPhoneBind,
        isEmailNextStep,
        isPhoneNextStep,
        fetchGTVerifyCode,
        fetchPhoneVeriBind,
        fetchChangePassword,
        fetchNewGTVerifyCode,
    }
})
@observer
export default class SafeContainer extends Component {
    state = {
        title: '修改邮箱',
        pwdVal: '',
        emailVal: '',
        phoneVal: '',
        newPhoneVal: '',
        newPwdVal: '',
        verifyVal: '',
        newVerifyVal: '',
        visible: false,
        pwdVisible: false,
        phoneVisible: false,
        gtResult: null,
        gtNewResult: null,
        isDownCount: false,
        isNewDownCount: false,
        downCount: seconds,
        newDownCount: seconds
    }

    async componentDidMount() {
        const { fetchGTVerifyCode } = this.props

        fetchGTVerifyCode()
    }

    handleDownCount = () => {
        const { gtResult, phoneVal } = this.state

        if(!utils.isMobile(phoneVal)) {
            message.destroy()
            message.error(`请输入正确的手机号`)

            return 
        }

        if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
            this.setState(prevState => ({ isDownCount: !prevState.isDownCount }))
    
            this.calculateDownCount()
    
            this.props.fetchPhoneBind({ phone: encodeURIComponent(this.state.phoneVal), ...gtResult })
        } else {
            message.destroy()
            message.error(`请先完成验证`)

            return 
        }
    }

    calculateDownCount = () => {
        const timer = setInterval(() => {
            const { downCount } = this.state
            const downCounts = downCount - 1

            if(downCounts >= 0) {
                this.setState({ downCount: downCounts })
            } else {
                this.setState(prevState => ({ isDownCount: !prevState.isDownCount, downCount: seconds }))

                clearInterval(timer)
            }
        }, 1000)
    }

    handleNewDownCount = () => {
        const { gtResult, phoneVal } = this.state

        if(!utils.isMobile(phoneVal)) {
            message.destroy()
            message.error(`请输入正确的手机号`)

            return
        }

        if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
            this.setState(prevState => ({ isNewDownCount: !prevState.isNewDownCount }))

            this.calculateNewDownCount()

            this.props.fetchPhoneBind({ phone: encodeURIComponent(this.state.phoneVal), ...gtResult })
        } else {
            message.destroy()
            message.error(`请先完成验证`)

            return
        }
    }

    calculateNewDownCount = () => {
        const timer = setInterval(() => {
            const { newDownCount } = this.state
            const downCounts = newDownCount - 1

            if(downCounts >= 0) {
                this.setState({ newDownCount: downCounts })
            } else {
                this.setState(prevState => ({ isNewDownCount: !prevState.isNewDownCount, newDownCount: seconds }))

                clearInterval(timer)
            }
        }, 1000)
    }

    showModal = e => {
        this.setState({
            visible: true,
            emailVal: ''
        })
    }

    showPwdModal = e => {
        this.setState({
            pwdVisible: true,
            pwdVal: '',
            newPwdVal: '',
        }) 
    }

    showPhoneModal = e => {
        this.setState({
            phoneVisible: true,
            phoneVal: '',
        }) 
    }

    handleOk = e => {
        if (!utils.isEmail(this.state.emailVal)) {
            message.destroy()
            message.error(`邮箱格式不正确`)

            return 
        }

        this.props.fetchEmailBind({ email: this.state.emailVal })
        // console.log(e) 
        this.setState({
            title: '邮箱验证', 
            emailVal: this.state.emailVal
        }) 
    }

    handlePwdOk = e => {
        if(!this.state.pwdVal) {
            message.destroy()
            message.error(`请输入原密码`)

            return 
        }

        if(!utils.isPassword(this.state.newPwdVal)) {
            message.destroy()
            message.error(`密码长度为6-16位，且必须为字母和数字组合`)

            return 
        }

        this.props.fetchChangePassword({ original_password: this.state.pwdVal, password: this.state.newPwdVal }).then(res => {
            if (res.success) {
                this.setState({pwdVisible: false})
            }
        })
    }

    handlePhoneOk = e => {
        const { phoneInfo, fetchPhoneVeriBind, fetchNewGTVerifyCode } = this.props
        const { gtResult, phoneVal, verifyVal } = this.state
        const token = localStorage.getItem('phoneData')

        if(!phoneVal) {
            message.destroy()
            message.error(`请输入手机号`)

            return 
        }

        if(!verifyVal) {
            message.destroy()
            message.error(`请输入验证码`)

            return
        }

        if(!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
            fetchPhoneVeriBind({ phone: phoneVal, code: verifyVal, verify_token: token || phoneInfo.token })

            fetchNewGTVerifyCode()
        } else {
            message.destroy()
            message.error(`请先完成验证`)
        }
    } 

    handleCancel = (e) => {
        this.setState({
            visible: false,
        }) 
    }

    handlePwdCancel = (e) => {
        this.setState({
            pwdVisible: false,
        })
    }

    handlePhoneCancel = e => {
        this.setState({
            phoneVisible: false,
        })
    }

    ReceiveEmail = e => {
        const { emailVal } = this.state

        filterEmail(emailVal, null)
    }

    handleChangeEmail = e => {
        this.setState({
            emailVal: e.target.value
        })
    }

    handlePwdChange = e => {
        this.setState({
            pwdVal: e.target.value
        })
    }

    handleNewPwdChange = e => {
        this.setState({
            newPwdVal: e.target.value
        })
    }

    handlePhoneChange = e => {
        this.setState({
            phoneVal: e.target.value
        })
    }

    handleNewPhoneChange = e => {
        this.setState({
            newPhoneVal: e.target.value
        })
    }

    handleVerifyChange = e => {
        this.setState({
            verifyVal: e.target.value
        })
    }

    handleNewVerifyChange = e => {
        this.setState({
            newVerifyVal: e.target.value
        })
    }

    handleGeetest = gtResult => this.setState({ gtResult })
    handleNewGeetest = gtNewResult => this.setState({ gtNewResult })

    render() {
        const { title, visible, emailVal, pwdVal, newPwdVal, phoneVal, newPhoneVal, verifyVal, newVerifyVal, isDownCount, isNewDownCount, downCount, newDownCount, pwdVisible, phoneVisible } = this.state
        const { GTVInfo, GTVNewInfo, isEmailNextStep, isPhoneNextStep, userCenterInfo /* personBaseInfo */ } = this.props
        const { email, mobilePhone } = this.props.userInfo || {}
        const personBaseInfo = userCenterInfo

        return (
            <div className='safe-container'>
                <ul className='safe-list'>
                    <li>
                        <span className='name'>邮箱: &nbsp;&nbsp; {email || personBaseInfo.email}</span>
                        <Button type='primary' onClick={this.showModal}>修改</Button>
                        <span className='verify'><Icon type='check-circle' theme='filled' /> 已验证</span>
                    </li>
                    <li>
                        <span className='name'>手机: &nbsp;&nbsp; {personBaseInfo.phone || personBaseInfo.mobilePhone}</span>
                        <Button type='primary' onClick={this.showPhoneModal}>修改</Button>
                        {personBaseInfo.mobileBind ? 
                            <span className='verify'><Icon type='check-circle' theme='filled' /> 已验证</span> :
                            <span className='unverify'><Icon type='close-circle' theme='filled' /> 未验证</span>
                        }
                    </li>
                    <li>
                        <span className='name'>密码: &nbsp;&nbsp; {`******`}</span>
                        <Button type='primary' onClick={this.showPwdModal}>修改</Button>
                        {/* <span className='verify'><Icon type='check-circle' theme='filled' /> 已验证</span> */}
                    </li>
                </ul>
                <Modal
                    className='safe-container-modal'
                    title={title} 
                    visible={visible}
                    okText={`确定`}
                    cancelText={`取消`}
                    style={{ padding: '0 50px' }}
                    onOk={this.handleOk}
                    onCancel={this.handleCancel}
                    footer={!isEmailNextStep ? (
                        <>
                            <Button onClick={this.handleCancel}>取消</Button>
                            <Button onClick={this.handleOk} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>确定</Button>
                        </>
                    ) : (
                        <Button onClick={this.ReceiveEmail} type='primary' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>去邮箱接收邮件</Button>
                    )}>
                    {!isEmailNextStep ? 
                        <Input type='text' value={emailVal} placeholder={`请输入新的邮箱地址`} className='email-input' onChange={this.handleChangeEmail} /> :
                        <div className='email-verify-box'>
                            <p className='content'>我们已向您的绑定邮箱 {emailVal} 发送了一封邮件 请您注意接收邮件</p>
                        </div>
                    }
                </Modal>
                <Modal
                    className='safe-container-modal'
                    title={`修改登录密码`}
                    visible={pwdVisible}
                    okText={`确定`}
                    cancelText={`取消`}
                    style={{ padding: '0 50px' }}
                    onOk={this.handlePwdOk}
                    onCancel={this.handlePwdCancel}>
                    <Row>
                        <Col>
                            <Input type='password' value={pwdVal} placeholder={`请输入原有登录密码`} className='pwd-input' onChange={this.handlePwdChange} />
                            <Link route='/password' className='link'>
                                <a className='link'>忘记密码？</a>
                            </Link>
                            {/* <a href='/password' className='link'>忘记密码？</a> */}
                        </Col>
                        <Col>
                            <Input type='password' value={newPwdVal} placeholder={`设置新密码`} className='newpwd-input' onChange={this.handleNewPwdChange} />
                        </Col>
                    </Row>
                </Modal>
                <Modal
                    className='safe-container-modal'
                    title={`修改手机号`}
                    visible={phoneVisible}
                    okText={`确定`}
                    cancelText={`取消`}
                    style={{ padding: '0 50px' }}
                    onOk={this.handlePhoneOk}
                    onCancel={this.handlePhoneCancel}>
                    {!isPhoneNextStep ? 
                        <Row>
                            <Col>
                                <Input type='text' value={phoneVal} placeholder={`请输入当前绑定手机号`} className='border-input' onChange={this.handlePhoneChange} />
                            </Col>
                            <Col>
                                {!GTVInfo.success &&
                                    <div className='gt-loading'>
                                        <i className='m1-loading'><i></i></i> 正在加载验证码...
                                    </div>}
                                {GTVInfo.success &&
                                    <Geetest
                                        {...GTVInfo}
                                        onSuccess={this.handleGeetest}
                                    width='100%' />}
                            </Col>
                            <Col>
                                <Input type='text' value={verifyVal} placeholder={`请输入验证码`} className='verify-input' onChange={this.handleVerifyChange} />
                                {!isDownCount ? <Button className='send-verify' onClick={this.handleDownCount}>发送验证码</Button> :
                                    <Button className='send-verify' disabled>重新发送({downCount})S</Button>}
                            </Col>
                        </Row> : 
                        <Row>
                            <Col>
                                <Input type='text' value={newPhoneVal} placeholder={`请输入新手机号`} className='new-border-input' onChange={this.handleNewPhoneChange} />
                            </Col>
                            <Col>
                                {!GTVNewInfo.success &&
                                    <div className='gt-loading'>
                                        <i className='m1-loading'><i></i></i> 正在加载验证码...
                                    </div>}
                                {GTVNewInfo.success &&
                                    <Geetest
                                        {...GTVNewInfo}
                                        onSuccess={this.handleNewGeetest}
                                        width='100%' />}
                            </Col>
                            <Col>
                                <Input type='text' value={newVerifyVal} placeholder={`请输入验证码`} className='new-verify-input' onChange={this.handleNewVerifyChange} />
                                {!isNewDownCount ? <Button className='send-verify' onClick={this.handleNewDownCount}>发送验证码</Button> :
                                    <Button className='send-verify' disabled>重新发送({newDownCount})S</Button>}
                            </Col>
                        </Row>
                    }
                </Modal>
            </div>
        )
    }
}