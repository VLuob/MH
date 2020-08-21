import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { AuthorType } from '@base/enums'
import { TweenOneGroup } from 'rc-tween-one'
import isEqual from 'lodash/isEqual'
import area from '@base/system/area'
import { utils, config, helper } from '@utils'
import classnames from 'classnames'
import { toJS } from 'mobx'

import { Tag, Form, Input, Avatar, Tooltip, Cascader, message, Icon, Upload, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd'

import { Router } from '@routes'
import CoverCrop from '@components/common/CoverCrop';
import uploadingSvg from '@static/images/usercenter/uploading.svg'


const { Option } = Select
const TextArea = Input.TextArea
const AutoCompleteOption = AutoComplete.Option

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

  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isLt2M) {
    message.destroy()
    message.error('PNG,JPG,GIF不得超过2MB!')
  }

  return isLt2M
}

let textareaLimitedNum = 500
let signatureLimitedNum = 40
const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

@inject(stores => {
  const { globalStore, accountStore, userCenterStore } = stores.store
  const { fetchSetUserInfo, userClientInfo } = accountStore
  const { suggestTagList, fetchGetTagSuggestion, qiniuToken } = globalStore
  const { personBaseInfo, curClientUserInfo, fetchSetSetting, fetchSetSettingBaseInfo } = userCenterStore


  return {
    globalStore,
    qiniuToken,
    suggestTagList,
    baseInfo: personBaseInfo, // 用户费个人账户初试渲染判断
    personBaseInfo,
    curClientUserInfo,
    fetchSetSetting,
    fetchSetUserInfo,
    fetchSetSettingBaseInfo,
    fetchGetTagSuggestion,

    userClientInfo,
  }
})
@observer
class UserDataForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      tags: [],
      loading: false,
      submiting: false,
      textareaVal: '',
      personalVal: '',
      signaturelen: 0,
      selectedItems: [],
      tagInitialList: [],
      cities: cityData[provinceData[0].name],
      secondCity: cityData[provinceData[0].name][0].name,

      showAvatarCropModal: false,
      avatarUploading: false,
      tmpAvatarUrl: '',
      avatarUrl: '',
    }
  }

  componentDidMount() {
    // const { personBaseInfo } = this.props
    const { userCenterInfo } = this.props
    const personBaseInfo = userCenterInfo
    const { tagList } = personBaseInfo
    // const filterTagList = tagList && tagList.map(l => l.name)
    const tagInitialList = tagList && tagList.map(l => {
      return (
        <Option key={l.id}>{l.name}</Option>
      )
    })

    this.setState({
      tagInitialList,
      signaturelen: (personBaseInfo.signature && personBaseInfo.signature.length) || 0,
      tags: personBaseInfo.tagList,
      textareaVal: personBaseInfo.profile || '',
    })

    this.initQiniuToken()
  }

  initQiniuToken() {
    const { globalStore, resultQiniuToken } = this.props
    // console.log(globalStore.setQiniuToken)
    if (resultQiniuToken) {
      globalStore.setQiniuToken(resultQiniuToken)
    } else {
      globalStore.fetchQiniuToken()
    }
  }

  handleProvinceChange = value => {
    this.setState({
      cities: cityData[value],
      secondCity: cityData[value][0].name,
    })
  }

  onSecondCityChange = value => {
    this.setState({
      secondCity: value,
    })
  }

  onChange = value => {
    // console.log(value)
  }

  handleSubmit = e => {
    const { avatarUrl } = this.state
    const { userCenterInfo, fetchSetUserInfo, fetchSetSettingBaseInfo, baseInfo, curClientUserInfo } = this.props
    e.preventDefault()

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const name = (values.name || '').replace(/\s+/g, '')
        const nickname = (values.nickname || '').replace(/\s+/g, '')
        let params = { ...values, name, nickname, avatar: avatarUrl || avatarUrl || userCenterInfo.avatar }
        const city = values.area[1]
        const province = values.area[0]
        delete params.area

        // fetchSetUserInfo({ ...params, city, province, id: userCenterInfo.id })
        this.handleSubmitSave({ ...params, city, province, id: userCenterInfo.id })

      }
    })
  }

  handleSubmitSave = async (params) => {
    const { fetchSetUserInfo } = this.props
    this.setState({ submiting: true })
    await fetchSetUserInfo(params)
    this.setState({ submiting: false })
  }

  handleChange = info => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true })

      return
    }

    if (info.file.status === 'done') {
      this.setState({ avatarUrl: info.file.response.data.url })
      getBase64(info.file.originFileObj, avatarUrl => this.setState({
        avatarUrl,
        loading: false,
      }))
    }
  }

  handleAvatarCropConfirm = (base64) => {
    const { globalStore, form } = this.props;
    const token = globalStore.qiniuToken;
    this.setState({ avatarUploading: true });
    helper.qiniuPutb64({ base64, token }).then((res) => {
      // console.log(res)
      const avatarUrl = `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
      // console.log(avatarUrl)
      this.setState({ avatarUrl, showAvatarCropModal: false, avatarUploading: false }, () => {
        // 删除后需触发验证，否则容易跳过验证，出错
        form.validateFields(['avatar'], { force: true })
      })
    }).catch((e) => {
      this.setState({ avatarUploading: false });
      message.error('上传失败：', e)
    })

  }

  handleAvatarCropVisible = (flag, url) => {
    this.setState({ showAvatarCropModal: !!flag, tmpAvatarUrl: url || '' })
  }

  handleAvatarCustomRequest = (option) => {
    const file = option.file
    // if (file.type === 'image/gif') {
    //     this.customRequest(option);
    // } else {
    // }
    getBase64(file, tmpAvatarUrl => {
      this.handleAvatarCropVisible(true, tmpAvatarUrl);
    })
  }

  validateAvatar = (rule, value, callback) => {
    const { avatarUrl } = this.state
    // const { personBaseInfo, fetchSetSetting } = this.props
    const { userCenterInfo } = this.props

    if (!(avatarUrl || userCenterInfo.avatar)) {
      callback(`请上传头像`)
    }

    callback()
  }

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag.name !== removedTag)

    this.setState({ tags })
  }

  handleEmailModify = () => {
    const { query, onChangeTab } = this.props
    // location.href = `/personal/${query.menu}/safe?set=email`
    Router.pushRoute(`/personal/account/safe?set=email`)
    onChangeTab('safe')
  }

  handlePhoneModify = () => {
    const { query, onChangeTab } = this.props
    // location.href = `/personal/${query.menu}/safe?set=phone`
    Router.pushRoute(`/personal/account/safe?set=phone`)
    onChangeTab('safe')
  }

  changeEmail = e => {
    // console.log(`修改邮箱`)
  }

  changePhone = e => {
    // console.log(`修改手机号`)
  }

  forMap = tag => {
    const tagElem = (
      <Tag
        closable
        onClose={e => {
          e.preventDefault()
          this.handleClose(tag)
        }}
      >
        {tag.name}
      </Tag>
    )
    return (
      <span key={tag} style={{ display: 'inline-block' }}>
        {tagElem}
      </span>
    )
  }

  signatureValidate = (rule, value, callback) => {
    const { setFields, getFieldValue } = this.props.form
    const len = utils.getStringLen(value)

    this.setState({ signaturelen: Number(len) })
    if (utils.getStringLen(value) > 40) {
      callback(`超过20个汉字或者40个字符, 请重新修改`)
    }

    callback()
  }

  checkNameRegexp(str) {
    // const reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
    const reg = /^(.){2,}$/gi;
    if (reg.test(str)) {
      const len = str.replace(/[^\x00-\xff]/g, "aa").length;
      if (len < 4 || len > 16) {
        return false;
      }

      return true;
    }

    return false;
  }

  checkNameRule = (rule, value, callback) => {
    if (!this.checkNameRegexp(value)) {
      callback('2-8个汉字（4-16个字符）')
    }
    callback()
  }

  checkUpdateAuditing() {
    const { personBaseInfo } = this.props;
    return !!personBaseInfo.authorPassed
  }

  renderModifyTip(keyName) {
    const { personBaseInfo, isAuthor } = this.props;
    if (!isAuthor) {
      return null
    }
    const authorPassed = personBaseInfo.authorPassed || {};
    const isUpdateAuditing = this.checkUpdateAuditing()
    return (isUpdateAuditing && !isEqual(personBaseInfo[keyName], authorPassed[keyName])) ? <span className="form-item-change-tips">修改正在审核中</span> : null
  }

  render() {
    const {
      loading,
      submiting,
      avatarUrl,
      tmpAvatarUrl,
      avatarUploading,
      showAvatarCropModal,
    } = this.state
    const { userClientInfo } = this.props
    const personBaseInfo = userClientInfo
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
    const uploadButton = (
      <div>
        {this.state.loading ?
          <Icon type='loading' /> :
          <Avatar src={uploadingSvg} size={50} />
        }
      </div>
    )
    const image = avatarUrl ? avatarUrl : personBaseInfo.avatar
    const { city, province, } = personBaseInfo

    const isMobileBind = personBaseInfo.mobileBind

    // console.log(toJS(personBaseInfo))

    return (
      <div className='personal-data-box'>
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <div className='row-wrap clearfix'>
            <Form.Item
              className='avatar-item'
              label={<span className='avatar-symbols'>头像</span>}
            >
              {getFieldDecorator('avatar', {
                rules: [{
                  validator: this.validateAvatar
                }]
              })(
                <Upload
                  name='file'
                  accept='image/*'
                  listType='picture-card'
                  className='avatar-uploader'
                  showUploadList={false}
                  action={uploadFileApi}
                  supportServerRender={true}
                  beforeUpload={beforeUpload}
                  customRequest={this.handleAvatarCustomRequest}
                  onChange={this.handleChange}>
                  {image ? <img src={image} alt='' className='upload-img' /> : uploadButton}
                  {this.renderModifyTip('avatar')}
                </Upload>
              )}
            </Form.Item>
            <div className='suggest-wrap'>
              <span className='suggest'>建议尺寸</span>
              <span className='suggest'>200*200px</span>
            </div>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item
              className='double-columns'
              label={<span className='avatar-symbol'>昵称</span>}
              extra={this.renderModifyTip('nickname')}
            >
              {getFieldDecorator('nickname', {
                rules: [{
                  validator: this.checkNameRule,
                }],
                initialValue: personBaseInfo.nickName
              })(
                <Input type='text' className='ins-input' placeholder="2-8个汉字（4-16个字符）" />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item
              className='double-columns'
              label='姓名'
              extra={this.renderModifyTip('name')}
            >
              {getFieldDecorator('name', {
                rules: [{
                  validator: this.checkNameRule,
                }],
                initialValue: personBaseInfo.realName
              })(
                <Input type='text' className='ins-input' placeholder="2-8个汉字（4-16和字符）" />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns columns-bg disabled-form tel-columns' label={<span className='avatar-symbol'>电子邮箱</span>}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true, message: '请输入电子邮箱'
                }, {
                  type: 'email', message: '邮箱格式不正确!'
                }],
                initialValue: personBaseInfo.email
              })(
                <Input type='text' disabled className='data-input' style={{ paddingRight: '40px' }} />
              )}
              <span className='verify'><Icon type='check-circle' theme='filled' style={{ color: `#19BC9C` }} /> 已验证</span>
              {/* <span className='modify' onClick={this.changeEmail}>修改</span> */}
            </Form.Item>
            <div className='split-block'></div>
            <Button className='tel-verify skyblue-themes' onClick={this.handleEmailModify}>修改</Button>
            <div className='split-block'></div>
            <Form.Item className={classnames(
              'double-columns',
              { 'disabled-form tel-columns': isMobileBind }
            )} label={<span className='avatar-symbol'>手机号码</span>}>
              {getFieldDecorator('phone', {
                rules: [{
                  required: true, message: '请输入手机号码'
                }, {
                  pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                }],
                initialValue: personBaseInfo.mobilePhone
              })(
                <Input type='text' disabled={isMobileBind} className='ins-input' />
              )}
              {isMobileBind ? <span className='verify'><Icon type='check-circle' theme='filled' style={{ color: `#19BC9C` }} /> 已验证</span>
                : <span className='verify' style={{ position: 'absolute', top: '-8px', right: '8px' }}><Icon type='close-circle' theme='filled' style={{ color: `#f00` }} /> 未验证</span>
              }
            </Form.Item>
            {isMobileBind && <>
              <div className='split-block'></div>
              <Button className='tel-verify skyblue-themes' onClick={this.handlePhoneModify}>修改</Button>
            </>}
            {/* {personBaseInfo.mobileBind ? <Form.Item className='double-columns disabled-form' label={<span className='avatar-symbol'>手机号码</span>}>
                            {getFieldDecorator('phone', {
                                rules: [{ 
                                    required: true, message: '请输入手机号码' 
                                }, {
                                    pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                }],
                                initialValue: personBaseInfo.mobilePhone
                            })(
                                <Input type='text' disabled className='data-input' style={{ width: `80%` }} />
                            )}
                            <span className='verify'><Icon type='check-circle' theme='filled' style={{ color: `#19BC9C` }} /> 已验证</span>
                            <span className='modify' onClick={this.changePhone}>修改</span>
                        </Form.Item> : 
                        <Form.Item className='double-columns' label={<span className='avatar-symbol'>手机号码</span>}>
                            {getFieldDecorator('phone', {
                                rules: [{
                                    required: true, message: '请输入手机号码'
                                }, {
                                    pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                }],
                                initialValue: personBaseInfo.mobilePhone
                            })(
                                <Input type='text' className='border-input' style={{ width: `100%` }} />
                            )}
                            <span className='verify' style={{ position: 'absolute', top: '-8px', right: '8px' }}><Icon type='close-circle' theme='filled' style={{ color: `#f00` }} /> 未验证</span>
                            <span className='modify' onClick={this.changePhone}>修改</span>
                        </Form.Item>} */}
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns columns-bg' label={<span className='avatar-symbol'>所在地</span>}>
              {getFieldDecorator('area', {
                rules: [{
                  required: true, message: '请选择所在地'
                }],
                initialValue: [Number(province), Number(city)]
                // initialValue: [Number(city), Number(province)]
                // initialValue: [2, 15]
              })(
                <Cascader
                  options={options}
                  placeholder='请选择所在地'
                  onChange={this.onChange}
                // defaultValue={[defaultCity, defaultProvince]} 
                />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns columns-bg' label='详细地址'>
              {getFieldDecorator('address', {
                // rules: [{ required: true, message: '请输入详细地址' }],
                initialValue: personBaseInfo.address
              })(
                <Input type='text' className='data-input' />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns' label='公司'>
              {getFieldDecorator('company', {
                initialValue: personBaseInfo.company
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label='职位'>
              {getFieldDecorator('job', {
                initialValue: personBaseInfo.jobTitle
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns' label='QQ'>
              {getFieldDecorator('qq', {
                initialValue: personBaseInfo.qq
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label='微信'>
              {getFieldDecorator('wx', {
                initialValue: personBaseInfo.weiXin
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <Row type='flex' align='middle' justify='start'>
            <Form.Item {...tailFormItemLayout}>
              <Button type="primary" htmlType="submit" loading={submiting} style={{ borderRadius: '3px', border: 'none', outline: 'none', minWidth: '100px', height: '40px' }}>提交</Button>
            </Form.Item>
          </Row>
        </Form>
        {showAvatarCropModal &&
          <CoverCrop
            title="裁剪头像"
            width={200}
            height={200}
            maxWidth={200}
            loading={avatarUploading}
            visible={showAvatarCropModal}
            url={tmpAvatarUrl}
            onCancel={e => this.handleAvatarCropVisible()}
            onConfirm={this.handleAvatarCropConfirm}
          />}
      </div>
    )
  }
}

const WrappedPersonalDataForm = Form.create({ name: 'register' })(UserDataForm)

export default WrappedPersonalDataForm