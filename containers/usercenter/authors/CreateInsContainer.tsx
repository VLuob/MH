import { Component } from 'react'
import { config } from '@utils'
import classNames from 'classnames'
import { inject, observer } from 'mobx-react'
import area from '@base/system/area'    
import { Form, Input, Avatar, Tooltip, Cascader, message, Icon, Upload, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd'

const uploadingSvg = '/static/images/usercenter/uploading.svg'

const { Option } = Select
const TextArea = Input.TextArea
const AutoCompleteOption = AutoComplete.Option

let textareaLimitedNum = 500
const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

let provinceData = []
let cityData = {}
let cityIdData = []
let provinceIdData = []

area.forEach(l => {
    provinceData = [...provinceData, ...l.provinces]
})

provinceData.forEach(l => {
    cityData[l.name] = l.cities
    cityIdData[l.id] = l

    provinceIdData = [...provinceIdData, ...l.cities]
})

const options = provinceData.map(l => {
    return {
        value: l.id,
        label: l.name,
        children: l.cities.map(m => {
            return {
                value: m.id,
                label: m.name
            }
        })
    }
})

function getBase64(img, callback) {
    const reader = new FileReader()
    reader.addEventListener('load', () => callback(reader.result))
    reader.readAsDataURL(img)
}

function beforeUpload(file) {
    const isJPG = file.type === 'image/jpeg'
    const isPNG = file.type === 'image/png'
    const isGIF = file.type === 'image/gif'

    if (!isJPG && !isPNG && !isGIF) {
        message.destroy()
        message.error('只能上传PNG,JPG,GIF格式')

        return
    }

    const isLt10M = file.size / 1024 / 1024 < 10

    if(!isLt10M) {
        message.destroy()
        message.error('PNG,JPG,GIF不得超过10MB!')
    }

    return isLt10M
}

const defalutMember = [{
    id: 1,
    name: `10人以下`
}, {
    id: 2,
    name: `10-50人`
}, {
    id: 3,
    name: `51-100人`
}, {
    id: 4,
    name: `100-200人`
}, {
    id: 5,
    name: `200人以上`
}]

@inject(stores => {
    const { userCenterStore } = stores.store
    const { fetchSetSetting, fetchCreateInstitution } = userCenterStore

    return {
        fetchSetSetting,
        fetchCreateInstitution
    }
})
@observer
class CreateInsContainerForm extends Component {
    state = {
        tags: [],
        loading: false,
        textareaVal: '',
    }

    handleSubmit = e => {
        const { imgSrc, imageUrl } = this.state
        const { fetchSetSetting, fetchCreateInstitution } = this.props

        e.preventDefault()

        this.props.form.validateFieldsAndScroll((err, values) => {
            if(!err) {
                const { tags } = this.state
                let params = { ...values, avatar: imgSrc, tagList: JSON.stringify(tags) }
                const city = values.area[1]
                const province = values.area[0]

                params = {
                    ...params,
                    contact: JSON.stringify({
                        name: values.name,
                        job: values.job,
                        phone: values.phone,
                        email: values.email,
                        wx: values.wx,
                        qq: values.qq,
                        web: values.web
                    }),
                    tag: JSON.stringify(params.tag)
                }

                delete params.area
                delete params.job
                delete params.phone
                delete params.email
                delete params.wx
                delete params.qq
                delete params.web

                fetchCreateInstitution({ ...params, city, province})
            }
        })
    }

    handleChange = (info) => {
        if(info.file.status === 'uploading') {
            this.setState({ loading: true })

            return
        }
        if(info.file.status === 'done') {
            this.setState({ imgSrc: info.file.response.data.url })
            getBase64(info.file.originFileObj, imageUrl => {
                this.setState({
                    imageUrl,
                    loading: false,
                })
            })
        }
    }

    handleTextareaChange = e => {
        const { textareaVal } = this.state
        const { setFieldsValue } = this.props.form

        if(e.target.value.length <= textareaLimitedNum) {
            this.setState({ textareaVal: e.target.value, textareaNum: e.target.value.length })
        } else {
            // FIXME: message只出现一次
            message.destroy()
            message.warning(`超出字数限制!`)
        }
    }

    handleTagChange = tags => {
        this.setState({ tags })
    }

    validateAvatar = (rule, value, callback) => {
        const { imgSrc, loading } = this.state
        const { insBaseInfo, fetchSetSetting } = this.props

        if(!imgSrc) {
            const warningText = loading ? `LOGO上传中`: `请上传机构LOGO`
            callback(warningText)
        }

        callback()
    }

    render() {
        const { loading, imageUrl, textareaVal } = this.state
        const { getFieldDecorator } = this.props.form
        const formItemLayout = {

        }

        const tailFormItemLayout = {
            wrapperCol: {
                xs: {
                    span: 24,
                    offset: 0,
                },
            }
        }
        const uploadButton = (
            <div>
                {/* {loading ? 
                    <Icon type='loading' /> :
                    <Avatar size={50} src={uploadingSvg} />
                } */}
                {loading && <Icon type='loading' />}
            </div>
        )
        const image = imageUrl

        return (
            <div className='institution-container'>
                <div className='title-line'>
                    创建机构
                    {/* <a href='/author' style={{ marginLeft: '10px' }}>加入机构</a> */}
                </div>
                <div className='create-ins-content'>
                    <Form {...formItemLayout} onSubmit={this.handleSubmit}>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='avatar-item' label={<span className='avatar-symbols'>机构LOGO</span>}>
                                {/* <img src={uploadingSvg} alt='' className='creation-hover-img' /> */}
                                {getFieldDecorator('avatar', {
                                    rules: [{
                                        validator: this.validateAvatar
                                    }]
                                })(
                                    <Upload
                                        name='file' 
                                        accept='image/*'
                                        listType='picture-card'
                                        className={classNames(
                                            { 'avatar-uploader': image }
                                        )}
                                        style={{ width: '110px' }}
                                        showUploadList={false}
                                        action={uploadFileApi}
                                        supportServerRender={true}
                                        beforeUpload={beforeUpload}
                                        onChange={this.handleChange}>
                                        {image ? <img src={image} alt='' className='upload-img' /> : uploadButton}
                                    </Upload>
                                )}
                            </Form.Item>
                            <div className='suggest-wrap'>
                                <span className='suggest'>建议尺寸</span>
                                <span className='suggest'>200*200px</span>
                            </div>
                        </div>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='double-columns' label={<span className='avatar-symbol'>显示名称</span>}>
                                {getFieldDecorator('nickname', {
                                    rules: [{
                                        required: true, message: '请输入名称',
                                    }]
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                            <div className='split-block'></div>
                            <Form.Item className='double-columns' label='机构名称'>
                                {getFieldDecorator('name', {
                                    rules: [{
                                        required: true, message: '请输入机构名称',
                                    }]
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                        </div>
                        <div className='row-wrap clearfix' id='cascader'>
                            <Form.Item className='double-columns columns-bg' label={<span className='avatar-symbol'>所在地</span>}>
                                {getFieldDecorator('area', {
                                    rules: [{
                                        required: true, message: '请选择所在地'
                                    }]
                                })(
                                    <Cascader
                                        options={options}
                                        placeholder='请选择所在地'
                                        onChange={this.onChange}
                                        getPopupContainer={() => document.getElementById('cascader')}
                                    />
                                )}
                            </Form.Item>
                            <div className='split-block'></div>
                            <Form.Item className='double-columns columns-bg staff-size' label='人员规模'>
                                {getFieldDecorator('staff_size', {
                                    // rules: [{ required: true, message: '请输入详细地址' }],
                                })(
                                    <Select className='ins-input' style={{ width: 120 }}>
                                        {defalutMember.map(item => {
                                            return (
                                                <Option key={item.id} value={item.id}>{item.name}</Option>
                                            )
                                        })}
                                    </Select>
                                )}
                            </Form.Item>
                        </div>
                        <div className='bg-line'></div>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='double-columns' label={<span className='avatar-symbol'>联系人</span>}>
                                {getFieldDecorator('contact', {
                                    rules: [{
                                        required: true, message: '请输入联系人'
                                    }]
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                            <div className='split-block'></div>
                            <Form.Item className='double-columns' label='职务'>
                                {getFieldDecorator('job', {
                                    
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                        </div>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='double-columns' label={<span className='avatar-symbol'>手机号码</span>}>
                                {getFieldDecorator('phone', {
                                    rules: [{
                                        required: true, message: '请输入手机号码'
                                    }, {
                                        pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                    }]
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                            <div className='split-block'></div>
                            <Form.Item className='double-columns' label={<span className='avatar-symbol'>电子邮件</span>}>
                                {getFieldDecorator('email', {
                                    rules: [{
                                        required: true, message: '请输入电子邮箱'
                                    }, {
                                        type: 'email', message: '邮箱格式不正确!'
                                    }]
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                        </div>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='double-columns' label='微信'>
                                {getFieldDecorator('wx', {
                                    
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                            <div className='split-block'></div>
                            <Form.Item className='double-columns' label='QQ'>
                                {getFieldDecorator('qq', {
                                    
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                        </div>
                        <div className='row-wrap clearfix'>
                            <Form.Item className='single-column' label='官网' style={{ marginBottom: '50px' }}>
                                {getFieldDecorator('web', {
                                    
                                })(
                                    <Input type='text' className='ins-input' />
                                )}
                            </Form.Item>
                        </div>
                        <div className='bg-line'></div>
                        <div className='profile-box single-column'>
                            <div className='text-number-box single-column'>
                                <span className='text-number'>{textareaVal.length}/{textareaLimitedNum}</span>
                            </div>
                            <Form.Item label={<span className='avatar-symbol'>机构简介</span>}>
                                {getFieldDecorator('profile', {
                                    rules: [{ required: true, message: '请输入机构简介' }]
                                })(
                                    <TextArea style={{ resize: 'none', height: '150px', overflow: 'hidden' }} placeholder={`请输入机构简介`}
                                        className='ins-input' onChange={this.handleTextareaChange} maxLength={500} />
                                )}
                            </Form.Item>
                        </div>
                        {/* <Row type='flex' align='middle' justify='start' id='personal-tags'>
                            <Col span={18}>
                                <Form.Item label='机构标签' className='tag-form'>
                                    {getFieldDecorator('tag', {
                                    
                                    })(
                                        <Select
                                            mode='tags'
                                            // open={false}
                                            className='tag-select-box'
                                            getPopupContainer={() => document.getElementById('personal-tags')}
                                            onChange={e => this.handleTagChange(e)}
                                            tokenSeparators={[',']}>
                                            
                                        </Select>
                                        // <Select
                                        //     mode='tag'
                                        //     placeholder='请选择标签'
                                        //     // onSearch={this.handleSearch}
                                        //     // onChange={this.handleTagChange}
                                        //     style={{ width: '100%' }}>
                                        //     {personBaseInfo.tag && personBaseInfo.tag.map(item => {
                                        //         return (
                                        //             <Option key={item.id} value={item.name}>{item.name}</Option>
                                        //         )
                                        //     })}
                                        // </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row> */}
                        {/* <Row type='flex' align='middle' justify='start'>
                            <Col span={18}>
                                <Form.Item label='机构签名' className='single-column'>
                                    {getFieldDecorator('signature', {
                                        
                                    })(
                                        <Input type='text' className='ins-input' />
                                    )}
                                </Form.Item>
                            </Col>
                            <Col span={6}></Col>
                        </Row> */}
                        {/* <Row type='flex' align='middle' justify='start' id='ins-tags'>
                            <Col span={18}>
                                <Form.Item label='机构标签' className='tag-form'>
                                    {getFieldDecorator('tag', {
                                        
                                    })(
                                        <Select 
                                            mode='tags'
                                            // open={false}
                                            className='tag-select-box'
                                            getPopupContainer={() => document.getElementById('ins-tags')}
                                            onChange={this.handleTagChange} 
                                            tokenSeparators={[',']}>
                                            {children}
                                        </Select>
                                    )}
                                </Form.Item>
                            </Col>
                        </Row> */}
                        <Row type='flex' align='middle' justify='start'>
                            <Form.Item {...tailFormItemLayout}>
                                <Button type='primary' htmlType='submit' className='themes' style={{ borderRadius: '3px', border: 'none', outline: 'none' }}>提交</Button>
                            </Form.Item>
                        </Row>
                    </Form>
                </div>
            </div>
        )
    }
}

const WrappedInsDataFormForm = Form.create({ name: 'register' })(CreateInsContainerForm)

export default WrappedInsDataFormForm