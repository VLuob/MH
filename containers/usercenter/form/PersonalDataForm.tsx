import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { AuthorType } from '@base/enums'
import { TweenOneGroup } from 'rc-tween-one'
import isEqual from 'lodash/isEqual'
import area from '@base/system/area'
import { utils, config, helper } from '@utils'
import { toJS } from 'mobx'

import { Tag, Form, Input, Avatar, Tooltip, Cascader, message, Icon, Upload, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd'

import ModifyModal from '@components/usercenter/ModifyModal'
import CoverCrop from '@components/common/CoverCrop';
import uploadingSvg from '@static/images/usercenter/uploading.svg'

const { Option } = Select
const TextArea = Input.TextArea
const AutoCompleteOption = AutoComplete.Option

let provinceData = []
let cityData = {}
let cityIdData = []
let provinceIdData = []

let seconds = 60

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
  const { fetchSetUserInfo, GTVInfo, fetchPhoneBind, fetchGTVerifyCode } = accountStore
  const { suggestTagList, fetchGetTagSuggestion, qiniuToken } = globalStore
  const { personBaseInfo, curClientUserInfo, fetchSetSetting, fetchSetSettingBaseInfo, fetchCreatorPhoneVerify } = userCenterStore


  return {
    globalStore,
    qiniuToken,
    GTVInfo,
    suggestTagList,
    baseInfo: personBaseInfo, // 用户费个人账户初试渲染判断
    personBaseInfo,
    curClientUserInfo,
    fetchSetSetting,
    fetchSetUserInfo,
    fetchSetSettingBaseInfo,
    fetchGetTagSuggestion,
    fetchPhoneBind,
    fetchGTVerifyCode,
    fetchCreatorPhoneVerify,
  }
})
@observer
class PersonalDataForm extends Component {
  constructor(props) {
    super(props)
    const personBaseInfo = props.personBaseInfo
    this.state = {
      tags: [],
      loading: false,
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
      avatarUrl: personBaseInfo.avatar,

      phoneVal: '',
      verifyVal: '',
      phoneVisible: false,
      isDownCount: false,
      downCount: 60,
    }
  }

  componentDidMount() {
    // const { personBaseInfo } = this.props
    const { userCenterInfo, fetchGTVerifyCode } = this.props
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

    fetchGTVerifyCode()

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

  handleTextareaChange = e => {
    const { textareaVal } = this.state
    const { setFieldsValue } = this.props.form

    if (e.target.value.length <= textareaLimitedNum) {
      this.setState({ textareaVal: e.target.value, textareaNum: e.target.value.length })
    } else {
      // FIXME: message只出现一次
      message.destroy()
      message.warning(`超出字数限制!`)
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
    // const { personBaseInfo, fetchSetSetting, fetchSetSettingBaseInfo } = this.props
    const { isAuthor, userCenterInfo, fetchSetUserInfo, fetchSetSettingBaseInfo, baseInfo, curClientUserInfo } = this.props

    e.preventDefault()

    // const personBaseInfo = baseInfo.authorId ? baseInfo : curClientUserInfo

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tags } = this.state
        const name = (values.name || '').replace(/\s+/g, '')
        const nickname = (values.nickname || '').replace(/\s+/g, '')
        let params = { ...values, name, nickname, avatar: avatarUrl || userCenterInfo.avatar, tagList: JSON.stringify(tags) }
        const city = values.area[1]
        const province = values.area[0]

        params.orgContact = JSON.stringify({
          // name: values.contact,
          job: values.job,
          phone: values.phone,
          email: values.email,
          wx: values.wx,
          qq: values.qq,
          // web: values.web
        }),

          delete params.area
        delete params.wx
        delete params.qq

        if (isAuthor) {
          params = {
            ...params,
            tag: JSON.stringify(params.tag)
          }
          if (!this.checkFieldsChange(values)) {
            message.destroy()
            message.info('您的资料未有变动，请修改后再提交')
          } else {
            fetchSetSettingBaseInfo({ ...params, city, province, org_id: userCenterInfo.authorId })
          }
        } else {
          fetchSetUserInfo({ ...params, city, province, id: userCenterInfo.id })
        }
        // fetchSetSetting({ data: JSON.stringify(params) })
      }
    })
  }

  checkFieldsChange(values) {
    const { avatarUrl } = this.state
    const { personBaseInfo } = this.props
    const orgContact = personBaseInfo.orgContact || {}
    let isChange = false
    // console.log('personBaseInfo', toJS(personBaseInfo), values)
    // console.log('avatar', personBaseInfo.avatar, avatarUrl, personBaseInfo.avatar !== avatarUrl)
    // console.log(personBaseInfo.avatar !== avatarUrl
    //     , personBaseInfo.nickname !== values.nickname 
    //     , personBaseInfo.name !== values.name
    //     , personBaseInfo.province !== values.area[0]
    //     , personBaseInfo.city !== values.area[1]
    //     // , personBaseInfo.staffSize !== values.staffSize
    //     // , personBaseInfo.address !== values.address
    //     , personBaseInfo.profile !== values.profile
    //     , personBaseInfo.signature !== values.signature
    //     , orgContact.name !== values.contact
    //     , orgContact.job !== values.job
    //     , orgContact.phone !== values.phone
    //     , orgContact.email !== values.email
    //     , orgContact.wx !== values.wx
    //     , orgContact.qq !== values.qq
    //     // , orgContact.web !== values.web
    //     )

    if (personBaseInfo.avatar !== avatarUrl
      || personBaseInfo.nickname !== values.nickname
      || personBaseInfo.name !== values.name
      || personBaseInfo.province !== values.area[0]
      || personBaseInfo.city !== values.area[1]
      // || personBaseInfo.staffSize !== values.staffSize
      // || personBaseInfo.address !== values.address
      || personBaseInfo.profile !== values.profile
      || personBaseInfo.signature !== values.signature
      // || orgContact.name !== values.contact
      || orgContact.job !== values.job
      || orgContact.phone !== values.phone
      || orgContact.email !== values.email
      || orgContact.wx !== values.wx
      || orgContact.qq !== values.qq
      // || orgContact.web !== values.web
    ) {
      isChange = true
    }
    return isChange
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

  handleKeyUp = e => {
    // console.log(e.target.value)
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



  // 发送验证码
  handleDownCount = () => {
    const { gtResult, phoneVal } = this.state
    const { fetchPhoneBind } = this.props

    if (!utils.isMobile(phoneVal)) {
      message.destroy()
      message.error(`请输入正确的手机号`)
      return
    }
    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      this.setState(prevState => ({ isDownCount: !prevState.isDownCount }))
      this.calculateDownCount()
      fetchPhoneBind({ type: 2, phone: encodeURIComponent(phoneVal), ...gtResult })
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
      if (downCounts >= 0) {
        this.setState({ downCount: downCounts })
      } else {
        this.setState(prevState => ({ isDownCount: !prevState.isDownCount, downCount: seconds }))
        clearInterval(timer)
      }
    }, 1000)
  }

  handleGeetest = gtResult => this.setState({ gtResult })

  handleShowPhoneModal = () => {
    this.setState({ phoneVisible: true })
  }

  handleModalConfirm = () => {
    const { gtResult, phoneVal, verifyVal } = this.state
    const { fetchCreatorPhoneVerify } = this.props
    const token = localStorage.getItem('phoneData')

    if (!phoneVal) {
      message.destroy()
      message.error(`请输入手机号`)
      return
    }

    if (!verifyVal) {
      message.destroy()
      message.error(`请输入验证码`)
      return
    }

    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      // 进行验证
      fetchCreatorPhoneVerify({ phone: encodeURIComponent(phoneVal), code: verifyVal, type: 2, verify_token: token }, cb => {
        this.setState({
          phoneVisible: false,
          newPhoneNum: false,
          isPhoneVerified: true,
          verifyVal: ''
        })
        this.props.form.setFieldsValue({
          phone: phoneVal
        });
      })
    } else {
      message.destroy()
      message.error(`请先完成验证`)
    }
  }

  handleModalCancel = () => {
    this.setState({
      phoneVal: '',
      verifyVal: '',
      phoneVisible: false,
    })
  }

  handleVerifyChange = e => {
    this.setState({
      verifyVal: e.target.value
    })
  }

  handlePhoneChange = e => {
    this.setState({ phoneVal: e.target.value })
  }


  handleSearch = e => {
    const { fetchGetTagSuggestion } = this.props

    // fetchGetTagSuggestion({ type: AuthorType.PERSONAL, keywords: e })
  }

  handleTagChange = selectedItems => {
    // console.log(selectedItems)
    // this.setState({ selectedItems })
  }

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag.name !== removedTag)

    this.setState({ tags })
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
      tags,
      loading,
      cities,
      signaturelen,
      secondCity,
      textareaVal,
      tagInitialList,
      selectedItems,

      phoneVal,
      verifyVal,
      phoneVisible,
      isDownCount,
      downCount,
      avatarUrl,
      tmpAvatarUrl,
      avatarUploading,
      showAvatarCropModal,
    } = this.state
    const { baseInfo, userCenterInfo, curClientUserInfo, isAuthor, GTVInfo } = this.props
    // const personBaseInfo = userCenterInfo
    const personBaseInfo = isAuthor ? baseInfo : curClientUserInfo
    const { setFieldsValue, getFieldDecorator } = this.props.form
    const orgContact = personBaseInfo.orgContact || {}

    const formItemLayout = {}
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
    const { city, province, tagList } = personBaseInfo


    // console.log('personBaseInfo', isAuthor, toJS(baseInfo), toJS(curClientUserInfo))

    return (
      <div className='personal-data-box'>
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <div className='row-wrap clearfix'>
            <Form.Item
              className='avatar-item'
              label={<span className='avatar-symbols'>{isAuthor ? `个人` : ``}头像</span>}
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
                initialValue: personBaseInfo.nickname || personBaseInfo.nickName
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
                initialValue: personBaseInfo.name || personBaseInfo.realName
              })(
                <Input type='text' className='ins-input' placeholder="2-8个汉字（4-16和字符）" />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns disabled-form tel-columns' label={<span className='avatar-symbol'>手机号码</span>}>
              {getFieldDecorator('phone', {
                rules: [{
                  required: true, message: '请输入手机号码'
                }, {
                  pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                }],
                initialValue: personBaseInfo.phone || personBaseInfo.mobilePhone
              })(
                <Input type='text' disabled className='data-input' style={{ width: `80%` }} />
              )}
              {/* <span className='verify'><Icon type='check-circle' theme='filled' style={{ color: `#19BC9C` }} /> 已验证</span> */}
              {/* <span className='modify' onClick={this.changePhone}>修改</span> */}
            </Form.Item>
            <div className='split-block'></div>
            <Button className='tel-verify skyblue-themes' onClick={this.handleShowPhoneModal}>修改</Button>
            <div className='split-block'></div>
            <Form.Item className='double-columns columns-bg' label={<span className='avatar-symbol'>电子邮箱</span>}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true, message: '请输入电子邮箱'
                }, {
                  type: 'email', message: '邮箱格式不正确!'
                }],
                initialValue: personBaseInfo.email
              })(
                <Input type='text' className='data-input' />
              )}
              {/* <span className='verify'><Icon type='check-circle' theme='filled' style={{ color: `#19BC9C` }} /> 已验证</span> */}
              {/* <span className='modify' onClick={this.changeEmail}>修改</span> */}
            </Form.Item>
            {/* <div className='split-block'></div> */}

            {/* {personBaseInfo.mobileBind ? <Form.Item className='double-columns disabled-form' label={<span className='avatar-symbol'>手机号码</span>}>
                            {getFieldDecorator('phone', {
                                rules: [{ 
                                    required: true, message: '请输入手机号码' 
                                }, {
                                    pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                                }],
                                initialValue: personBaseInfo.phone || personBaseInfo.mobilePhone
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
                                initialValue: personBaseInfo.phone || personBaseInfo.mobilePhone
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
            {/* <Form.Item className='double-columns columns-bg' label='详细地址'>
                            {getFieldDecorator('address', {
                                // rules: [{ required: true, message: '请输入详细地址' }],
                                initialValue: personBaseInfo.address
                            })(
                                <Input type='text' className='data-input' />
                            )}
                        </Form.Item> */}
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
                initialValue: orgContact.qq
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label='微信'>
              {getFieldDecorator('wx', {
                initialValue: orgContact.wx
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          {personBaseInfo.authorId && <div className='profile-box single-column'>
            <Form.Item
              label={<span className='avatar-symbol'>个人简介</span>}
              extra={this.renderModifyTip('profile')}
            >
              {getFieldDecorator('profile', {
                rules: [{ required: true, message: '请输入个人简介' }],
                initialValue: personBaseInfo.profile
              })(
                <TextArea style={{ resize: 'none', height: '150px', overflow: 'auto' }} placeholder={`请输入个人简介`}
                  className='ins-input' onChange={this.handleTextareaChange} maxLength={500} />
              )}

              <span className='text-number'>{textareaVal.length}/{textareaLimitedNum}</span>

            </Form.Item>
          </div>}
          {personBaseInfo.authorId && <Row type='flex' align='middle' justify='start' className='single-column signature-box'>
            <Col span={18}>
              <Form.Item
                label='个人签名'
                className='single-column'
                extra={this.renderModifyTip('signature')}
              >
                {getFieldDecorator('signature', {
                  rules: [{
                    validator: this.signatureValidate
                  }],
                  initialValue: personBaseInfo.signature,
                })(
                  <Input type='text' className='ins-input' placeholder='不超过20个汉字或者40个字符' />
                )}
              </Form.Item>
              <div className='signature-input single-column'>
                <span className='text-number'>{signaturelen}/{signatureLimitedNum}</span>
              </div>
            </Col>
            <Col span={6}></Col>
          </Row>}
          {/* <Row type='flex' align='middle' justify='start' id='personal-tags'>
                        <Col span={18}>
                            <Form.Item label='个人标签' className='tag-form'>
                                {getFieldDecorator('tag', {
                                    initialValue: filterTagList || []
                                    // initialValue: filterTagList ? filterTagList.map(item => item.name) : []
                                })(
                                    <Select
                                        mode='tags'
                                        // open={false}
                                        className='tag-select-box'
                                        getPopupContainer={() => document.getElementById('personal-tags')}
                                        // onChange={this.handleTagChange}
                                        onSelect={this.handleTagChange}
                                        tokenSeparators={[',']}>
                                        {tagInitialList}
                                    </Select>
                                )}
                            </Form.Item>
                        </Col>
                    </Row> */}
          <Row type='flex' align='middle' justify='start'>
            <Form.Item {...tailFormItemLayout}>
              <Button type='primary' htmlType='submit' style={{ borderRadius: '3px', border: 'none', outline: 'none', minWidth: '100px', height: '38px' }}>提交</Button>
            </Form.Item>
          </Row>
        </Form>
        <ModifyModal
          GTVInfo={GTVInfo}
          phoneVal={phoneVal}
          verifyVal={verifyVal}
          downCount={downCount}
          isDownCount={isDownCount}
          phoneVisible={phoneVisible}
          onCancel={this.handleModalCancel}
          handleGeetest={this.handleGeetest}
          onConfirm={this.handleModalConfirm}
          handleDownCount={this.handleDownCount}
          handlePhoneChange={this.handlePhoneChange}
          handleVerifyChange={this.handleVerifyChange}
        />
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

const WrappedPersonalDataForm = Form.create({ name: 'register' })(PersonalDataForm)

export default WrappedPersonalDataForm