import { Component } from 'react'
import { inject, observer } from 'mobx-react'

import { Form, Input, Row, Col, Checkbox, Button, message } from 'antd'
import { toJS } from 'mobx';

@inject(stores => {
    const { accountStore, globalStore } = stores.store
    const { ip } = globalStore
    const { loginFailInfo, fetchApinLogin, oauthBindData } = accountStore

    return {
      accountStore,
      ip,
      loginFailInfo,
      fetchApinLogin,

      oauthBindData,
    }
})
@observer
class LoginForm extends Component {
    state = {
        remindPwd: false,
        confirmDirty: false,
        bindLoading: false,
    }

    handleSubmit = (e) => {
        e.preventDefault()

        const { remindPwd } = this.state
        const { ip, fetchApinLogin, accountStore, oauthBindData } = this.props
        // if (!verifyData) {
        //   return
        // }
        
        this.props.form.validateFieldsAndScroll((err, values) => {
            if(err) {
                return 
            }

            const { username, password } = values
            const { setFields, getFieldValue } = this.props.form
            const vData = (oauthBindData.data || {}).data || {}
            const expire = vData.expire
            const openId = vData.openId
            const oauthToken = vData.token
            const passName = vData.passName
            const type = vData.socialType

            fetchApinLogin({ username, password })
            this.setState({bindLoading: true})
            accountStore.signinAndBind({ username, password, expire, openId , oauthToken , passName, type , remindPwd, setFields, getFieldValue, ip }, (res) => {
                this.setState({bindLoading: false})
                if (!res.success) {
                    message.error(res.data.msg)
                }
            })
        })
    }

    handleConfirmBlur = (e) => {
        const value = e.target.value

        this.setState({ confirmDirty: this.state.confirmDirty || !!value })
    }

    handleChange = e => {
        this.setState({ remindPwd: e.target.checked })
    }

    compareToFirstPassword = (rule, value, callback) => {
        const form = this.props.form

        if(value && value !== form.getFieldValue('password')) {
            callback('Two passwords that you enter is inconsistent!')
        } else {
            callback()
        }
    }

    validateToNextPassword = (rule, value, callback) => {
        const form = this.props.form

        if(value && this.state.confirmDirty) {
            form.validateFields(['confirm'], { force: true })
        }

        callback()
    }

    validateToNextUser = (rule, value, callback) => {
        const form = this.props.form

        // if(value && this.state.confirmDirty) {
        //     form.validateFields(['confirm'], { force: true })
        // }

        callback()
    }

    render() {
      const { form, onToRegister, oauthBindData } = this.props
      const { getFieldDecorator } = form
      const { bindLoading } = this.state
      const formItemLayout = {
          labelCol: {
              xs: { span: 24 },
              sm: { span: 24 },
          },
          wrapperCol: {
              // xs: { span: 12, offset: 6 },
              // sm: { span: 12, offset: 6 },
          }
      }
      const tailFormItemLayout = {
          wrapperCol: {
              // xs: { span: 12, offset: 6 },
              // sm: { span: 12, offset: 6 },
          }
      }

    //   console.log('ver data', toJS(oauthBindData))

        return (
          <div className="login-bind-container">
            <div className="sign-top-intro">绑定已有梅花网账户</div>
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <Form.Item>
                    {getFieldDecorator('username', {
                        rules: [{
                            required: true, message: '请输入邮箱/用户名!'
                        }, {
                            validator: this.validateToNextUser
                        }]
                    })(
                        <div className='field'>
                            <Input id='username' size='large' placeholder='邮箱/用户名' />
                            <label className='field-label' htmlFor='username'>邮箱/用户名</label>
                        </div>
                    )}
                </Form.Item>
                <Form.Item>
                    {getFieldDecorator('password', {
                        rules: [{
                            required: true, message: '请输入密码!'
                        }]
                    })(
                        <div className='field'>
                            <Input id='pwd' size='large' type='password' placeholder='密码' />
                            <label className='field-label' htmlFor='pwd'>密码</label>
                        </div>
                    )}
                </Form.Item>
                <Form.Item>
                    <Row type='flex' align='middle' justify='start'>
                        <Col span={12}>
                            <Checkbox className='remind-pwd' onChange={this.handleChange}>记住密码</Checkbox>
                        </Col>
                        <Col span={12}>
                            <a href='/password' className='forget-pwd'>忘记密码？</a>
                        </Col>
                    </Row>
                </Form.Item>
                <Form.Item {...tailFormItemLayout}>
                    <Button 
                        size='large' 
                        type='primary' 
                        htmlType='submit' 
                        className='themes' 
                        loading={bindLoading}
                        style={{ borderRadius: '3px', border: 'none', outline: 'none' }}
                    >登录并绑定</Button>
                </Form.Item>
            </Form>
            <div className="sign-bottom-intro">
              还没有梅花网账号？ <a className='direct' onClick={onToRegister}> 注册新账号 </a>
            </div>
          </div>
        )
    }
}

const WrappedLoginForm = Form.create({ name: 'login' })(LoginForm)

export default WrappedLoginForm