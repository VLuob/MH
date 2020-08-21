import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { config, utils, helper } from '@utils'
import { Row, Col, Icon, Form, Input, Button, Upload, message, Checkbox } from 'antd'

const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

export interface State {
    isAgree: boolean
    attachFileList: Array<any>
}
export interface Props {
    qiniuToken: string
}

@inject(stores => {
    const { globalStore } = stores.store
    const { qiniuToken, setQiniuToken, fetchQiniuToken } = globalStore

    return {
        qiniuToken,
        setQiniuToken,
        fetchQiniuToken
    }
})
class ClaimForm extends Component<Props, State> {
    state = {
        isAgree: false,
        attachFileList: []
    }

    componentDidMount() {
        this.initQiniuToken()
    }

    initQiniuToken() {
        const { setQiniuToken, fetchQiniuToken, resultQiniuToken } = this.props

        if(resultQiniuToken) {
            setQiniuToken(resultQiniuToken)
        } else {
            fetchQiniuToken()
        }
    }

    handleSubmit = e => {
        const { isAgree } = this.state

        e.preventDefault()

        if(!isAgree) {
            message.error('请勾选并阅读发布协议')

            return
        }

        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err) {
                let params = { ...values }

                console.log(params)
            }
        })
    }

    attachUploadProps = {
        name: 'file',
        action: uploadFileApi,
        headers: {
            authorization: 'authorization-text',
        },
        onChange: (info) => {
            if (info.file.status !== 'uploading') {
                // console.log(info.file, info.fileList) 
            }
            if(info.file.status === 'done') {
                message.destroy()
                message.success(`${info.file.name} 文件上传成功`)
            } else if (info.file.status === 'error') {
                message.destroy()
                message.error(`${info.file.name} 文件上传失败`)
            }
        },
        onRemove: file => {

        }
    } 

    customRequest = ({ action, data, file, filename, onProgress, onError, onSuccess }) => {
        const { qiniuToken } = this.props 
        const token = qiniuToken 

        helper.qiniuUpload({
            file,
            token,
            next: (res) => {
                const ret = {
                    uid: file.uid,
                    name: file.name,
                    position: 0,
                    percent: res.total.percent,
                    status: 'uploading',
                }
                onProgress(ret, file)
            },
            error: (err) => {
                onError(err)
            },
            complete: (res) => {
                const ret = {
                    data: {
                        url: `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
                    }
                }

                onSuccess(ret, file)
            }
        })
    }

    handleAttachmentChange = attachFiles => this.setState({ attachFileList: attachFiles.fileList })

    handleAgreeChange = e => {
        const { isAgree } = this.state

        this.setState({ isAgree: !isAgree })
    }

    render() {
        const { isAgree, attachFileList } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {

        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                }
            }
        }

        return (
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                <div className='claim-form'>
                    <div className='claim-subtitle'>
                        <div className='title'>认领的创作者</div>
                        <div className='title-line'></div>
                    </div>
                    <div className='claim-wrap clearfix'>
                        <Form.Item className='double-columns' label='创作者简称'>
                            {getFieldDecorator('creatorNickName')(
                                <Input type='text' disabled className='ins-input' />
                            )}
                        </Form.Item>
                        <div className='split-block'></div>
                        <Form.Item className='double-columns' label='该创作者公司名称'>
                            {getFieldDecorator('creatorCompanyName')(
                                <Input type='text' disabled className='ins-input' />
                            )}
                        </Form.Item>
                    </div>
                    <p className='claim-explain'>认领成功后将成为您的机构创作者显示名称</p>
                    <div className='claim-subtitle'>
                        <span className='title'>认领人详细资料</span>
                        <div className='title-line'></div>
                    </div>
                    <div className='claim-wrap-form claim-wrap clearfix'>
                        <Form.Item className='double-columns' label='联系人'>
                            {getFieldDecorator('contact', {
                                rules: [{
                                    required: true, 
                                    message: '请输入联系人!'
                                }]
                            })(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                        <div className='split-block'></div>
                        <Form.Item className='double-columns' label='手机'>
                            {getFieldDecorator('telphone', {
                                rules: [{
                                    required: true, 
                                    message: '请输入手机!'
                                }]
                            })(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                    </div>
                    <div className='claim-wrap-form claim-wrap clearfix'>
                        <Form.Item className='double-columns' label='邮箱'>
                            {getFieldDecorator('email', {
                                rules: [{
                                    required: true,
                                    message: '请输入邮箱!'
                                }]
                            })(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                        <div className='split-block'></div>
                        <Form.Item className='double-columns' label='座机'>
                            {getFieldDecorator('phone')(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                    </div>
                    <div className='claim-wrap-secform claim-wrap clearfix'>
                        <Form.Item className='double-columns' label='公司名称'>
                            {getFieldDecorator('companyName', {
                                rules: [{
                                    required: true,
                                    message: '请输入公司名称!'
                                }]
                            })(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                        <div className='split-block'></div>
                        <Form.Item className='double-columns' label='职位'>
                            {getFieldDecorator('post', {
                                rules: [{
                                    required: true,
                                    message: '请输入职位!'
                                }]
                            })(
                                <Input type='text' className='ins-input' />
                            )}
                        </Form.Item>
                    </div>
                    <div className='claim-subtitle'>
                        <span className='title'>证明文件</span>
                        <div className='title-line'></div>
                    </div>
                    <h6 className='headline'>上传证明文件</h6>
                    <Form.Item {...formItemLayout} className='claim-attachment'>
                        {getFieldDecorator('attachment', {
                            initialValue: { fileList: attachFileList }
                        })(
                            <Upload 
                                {...this.attachUploadProps}
                                fileList={attachFileList}
                                className='attach-file'
                                customRequest={this.customRequest}
                                onChange={this.handleAttachmentChange}
                            >
                                <Button>
                                    <Icon type='paper-clip' /> 点击上传（如：名片、公司盖章确认函）
                                </Button>
                            </Upload>
                        )}
                    </Form.Item>
                    <Form.Item {...formItemLayout}>
                        <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意 <a href='/claim/protocol' className='copyright-link' target='_blank'>《梅花网机构创作者认领协议》</a></Checkbox>
                    </Form.Item>
                    <Row type='flex' align='middle' justify='start'>
                        <Form.Item {...tailFormItemLayout} className='claim-save-wrap'>
                            <Button type='primary' htmlType='submit' className='themes'>提交</Button>
                        </Form.Item>
                    </Row>
                </div>
            </Form>
        )
    }
}

const WrappedClaimForm = Form.create({ name: 'claim' })(ClaimForm)

export default WrappedClaimForm