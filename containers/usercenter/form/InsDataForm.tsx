import { Component } from 'react'
import { config, utils, helper } from '@utils'
import { getCreatorType } from '@base/system'
import classNames from 'classnames'
import ReactTooltip from 'react-tooltip'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'

import area from '@base/system/area'
import ModifyModal from '@components/usercenter/ModifyModal'
import CoverCrop from '@components/common/CoverCrop';

import { Form, Input, Avatar, Tooltip, Cascader, message, Icon, Upload, Select, Row, Col, Checkbox, Button, AutoComplete } from 'antd'

import uploadingSvg from '@static/images/usercenter/uploading.svg'

const { Option } = Select
const TextArea = Input.TextArea
const AutoCompleteOption = AutoComplete.Option

let textareaLimitedNum = 500
let signatureLimitedNum = 40
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

  if (!isLt10M) {
    message.destroy()
    message.error('PNG,JPG,GIF不得超过10MB!')
  }

  return isLt10M
}

let seconds = 60
@inject(stores => {
  const { accountStore, userCenterStore, globalStore } = stores.store
  const { qiniuToken } = globalStore
  const { GTVInfo, fetchPhoneBind, fetchGTVerifyCode } = accountStore
  const { insBaseInfo, fetchCreatorPhoneVerify, fetchSetSettingBaseInfo } = userCenterStore

  return {
    globalStore,
    qiniuToken,
    GTVInfo,
    insBaseInfo,
    fetchPhoneBind,
    fetchGTVerifyCode,
    fetchSetSettingBaseInfo,
    fetchCreatorPhoneVerify,
  }
})
@observer
class InsDataForm extends Component {
  constructor(props) {
    super(props)
    const insBaseInfo = props.insBaseInfo
    this.state = {
      tags: [],
      loading: false,
      gtResult: null,
      phoneVal: '',
      verifyVal: '',
      textareaVal: '',
      personalVal: '',
      signaturelen: 0,
      selectedItems: [],
      isDownCount: false,
      downCount: seconds,
      phoneVisible: false,
      cities: cityData[provinceData[0].name],
      secondCity: cityData[provinceData[0].name][0].name,
      showAvatarCropModal: false,
      avatarUploading: false,
      tmpAvatarUrl: '',
      avatarUrl: insBaseInfo.avatar,
    }
  }

  componentDidMount() {
    const { fetchGTVerifyCode } = this.props
    const insBaseInfo = this.props.insBaseInfo || {}

    fetchGTVerifyCode()
    // this.setState({
    //     textareaVal: insBaseInfo.profile || '',
    //     signaturelen: (insBaseInfo.signature && insBaseInfo.signature.length) || 0,
    // })

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

  handleSubmit = e => {
    const { avatarUrl } = this.state
    const { insBaseInfo, fetchSetSetting, fetchSetSettingBaseInfo } = this.props

    e.preventDefault()

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tags } = this.state
        const { query } = this.props
        const name = (values.name || '').replace(/\s+/g, '')
        const nickname = (values.nickname || '').replace(/\s+/g, '')
        let params = { ...values, name, nickname, avatar: avatarUrl || insBaseInfo.avatar, tag: tags.join(',') }
        const { id } = query
        const city = values.area[1]
        const province = values.area[0]

        params = {
          ...params,
          orgContact: JSON.stringify({
            name: values.contact,
            job: values.job,
            phone: values.phone,
            email: values.email,
            wx: values.wx,
            qq: values.qq,
            web: values.web
          }),
        }

        delete params.area
        delete params.contact
        // delete params.job
        // delete params.phone
        // delete params.email
        delete params.wx
        delete params.qq
        delete params.web

        if (!this.checkFieldsChange(values)) {
          message.info('您的资料未有变动，请修改后再提交')
        } else {
          fetchSetSettingBaseInfo({ ...params, city, province, org_id: id })
          // fetchSetSetting({ data: JSON.stringify(params) })
        }
      }
    })
  }

  checkFieldsChange(values) {
    const { avatarUrl } = this.state
    const { insBaseInfo } = this.props
    const orgContact = insBaseInfo.orgContact || {}
    let isChange = false
    // console.log('insBaseInfo', toJS(insBaseInfo), values)
    // console.log('avatar', insBaseInfo.avatar, avatarUrl, insBaseInfo.avatar !== avatarUrl)
    // console.log(insBaseInfo.avatar !== avatarUrl
    //     , insBaseInfo.nickname !== values.nickname 
    //     , insBaseInfo.name !== values.name
    //     , insBaseInfo.province !== values.area[0]
    //     , insBaseInfo.city !== values.area[1]
    //     , insBaseInfo.staffSize !== values.staffSize
    //     // , insBaseInfo.address !== values.address
    //     , insBaseInfo.profile !== values.profile
    //     , insBaseInfo.signature !== values.signature
    //     , orgContact.name !== values.contact
    //     , orgContact.job !== values.job
    //     , orgContact.phone !== values.phone
    //     , orgContact.email !== values.email
    //     , orgContact.wx !== values.wx
    //     , orgContact.qq !== values.qq
    //     , orgContact.web !== values.web
    //     )

    if (insBaseInfo.avatar !== avatarUrl
      || insBaseInfo.nickname !== values.nickname
      || insBaseInfo.name !== values.name
      || insBaseInfo.province !== values.area[0]
      || insBaseInfo.city !== values.area[1]
      || insBaseInfo.staffSize !== values.staffSize
      // || insBaseInfo.address !== values.address
      || insBaseInfo.profile !== values.profile
      || insBaseInfo.signature !== values.signature
      || orgContact.name !== values.contact
      || orgContact.job !== values.job
      || orgContact.phone !== values.phone
      || orgContact.email !== values.email
      || orgContact.wx !== values.wx
      || orgContact.qq !== values.qq
      || orgContact.web !== values.web
    ) {
      isChange = true
    }
    return isChange
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

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true })

      return
    }

    if (info.file.status === 'done') {
      // Get this url from response in real world.
      this.setState({ avatarUrl: info.file.response.data.url })
      getBase64(info.file.originFileObj, avatarUrl => this.setState({
        avatarUrl,
        loading: false,
      }))
    }
  }

  handleClose = removedTag => {
    const tags = this.state.tags.filter(tag => tag.name !== removedTag.id)

    this.setState({ tags })
  }

  onAddressChange = value => {
    // console.log(value)
  }

  onChange = value => {
    // console.log(value)
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
    const { insBaseInfo, fetchSetSetting, userCenterInfo } = this.props

    if (!(avatarUrl || insBaseInfo.avatar)) {
      callback(`请上传创作者LOGO`)
    }

    callback()
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


  checkNameRegexp(str) {
    // const reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
    // const reg = /^(.){2,}$/gi;
    const reg = /^[\u4e00-\u9fa5a-z\d_（）().]{2,}$/gi;
    if (reg.test(str)) {
      const len = str.replace(/[^\x00-\xff]/g, "aa").length;
      if (len < 4 || len > 36) {
        return false;
      }

      return true;
    }

    return false;
  }

  checkNameRule = (rule, value, callback) => {
    if (!this.checkNameRegexp(value)) {
      callback('2-18个汉字（4-36个字符）')
    }
    callback()
  }

  checkUpdateAuditing() {
    const { insBaseInfo } = this.props;
    return !!insBaseInfo.authorPassed
  }

  renderModifyTip(keyName) {
    const { insBaseInfo } = this.props;
    const authorPassed = insBaseInfo.authorPassed || {};
    const isUpdateAuditing = this.checkUpdateAuditing()
    return (isUpdateAuditing && !isEqual(insBaseInfo[keyName], authorPassed[keyName])) ? <span className="form-item-change-tips">修改正在审核中</span> : null
  }

  render() {
    const {
      cities,
      verifyVal,
      secondCity,
      textareaVal,
      signaturelen,
      phoneVal,
      downCount,
      isDownCount,
      selectedItems,
      phoneVisible,
      avatarUrl,
      tmpAvatarUrl,
      avatarUploading,
      showAvatarCropModal,
    } = this.state
    const { GTVInfo, insBaseInfo, userCenterInfo } = this.props
    const { setFieldsValue, getFieldDecorator } = this.props.form
    const filterTagList = insBaseInfo.tagList && insBaseInfo.tagList.map(l => l.name)
    const orgContact = insBaseInfo.orgContact || {}

    const formItemLayout = {

    }
    const tailFormItemLayout = {
      wrapperCol: {
        xs: {
          span: 24,
          offset: 0
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
    const image = avatarUrl ? avatarUrl : insBaseInfo.avatar
    const { city, province } = insBaseInfo

    const insName = getCreatorType(userCenterInfo.type)

    return (
      <div className='ins-data-box'>
        <div className='ins-subtitle'>
          <span className='title'>LOGO</span>
          <div className='title-line'></div>
        </div>
        <Form {...formItemLayout} onSubmit={this.handleSubmit}>
          <div className='row-wrap clearfix'>
            <Form.Item
              className='avatar-item'
              label={<span className='avatar-symbols'>LOGO</span>}

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
                  className={classNames({ 'avatar-uploader': image })}
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
          <div className='ins-subtitle'>
            <span className='title'>基本资料</span>
            <div className='title-line'></div>
          </div>
          <div className='row-wrap clearfix'>
            <ReactTooltip id={`nickname`} effect='solid' place='top' />
            <Form.Item
              className='double-columns'
              label={<span className='avatar-symbol'>{insName}简称 {/* <Icon type='question-circle' className='nickname-icon' data-for={`nickname`} data-tip={`创作者主页和各个列表显示的名称，如：上海梅花信息股份有限公司，${insName}为梅花网`} /> */} </span>}
              extra={this.renderModifyTip('nickname')}
            >
              {getFieldDecorator('nickname', {
                rules: [{
                  validator: this.checkNameRule,
                }],
                initialValue: insBaseInfo.nickname
              })(
                <Input type='text' className='ins-input' placeholder="2-18汉字（4-36个字符）" />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item
              className='double-columns'
              label={`${insName}公司名称`}
              extra={this.renderModifyTip('name')}
            >
              {getFieldDecorator('name', {
                rules: [{
                  validator: this.checkNameRule,
                }],
                initialValue: insBaseInfo.name
              })(
                <Input type='text' className='ins-input' placeholder="2-18汉字（4-36个字符）" />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns columns-bg' label={<span className='avatar-symbol'>所在地</span>}>
              {getFieldDecorator('area', {
                rules: [{
                  required: true, message: '请选择所在地'
                }],
                // initialValue: [Number(city), Number(province)]
                initialValue: [Number(province), Number(city)]
                // initialValue: [province, city]
              })(
                <Cascader
                  options={options}
                  placeholder='请选择所在地'
                  onChange={this.onChange}
                />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns columns-bg staff-size' label='人员规模'>
              {getFieldDecorator('staffSize', {
                // rules: [{ required: true, message: '请输入详细地址' }],
                initialValue: insBaseInfo.staffSize
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
          <div className='row-wrap clearfix'>
            <Form.Item className='single-column' label='官方网址'>
              {getFieldDecorator('web', {
                initialValue: orgContact.web
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <div className='ins-subtitle'>
            <span className='title'>联系资料</span>
            <div className='title-line'></div>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns' label={<span className='avatar-symbol'>联系人</span>}>
              {getFieldDecorator('contact', {
                rules: [{
                  required: true, message: '请输入联系人'
                }],
                initialValue: orgContact.name
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label='职务'>
              {getFieldDecorator('job', {
                initialValue: orgContact.job
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns tel-columns' label={<span className='avatar-symbol'>手机号码</span>}>
              {getFieldDecorator('phone', {
                rules: [{
                  required: true, message: '请输入手机号码'
                }, {
                  pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                }],
                initialValue: orgContact.phone
              })(
                <Input type='text' className='ins-input' disabled />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Button className='tel-verify skyblue-themes' onClick={this.handleShowPhoneModal}>修改</Button>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label={<span className='avatar-symbol'>电子邮箱</span>}>
              {getFieldDecorator('email', {
                rules: [{
                  required: true, message: '请输入电子邮箱'
                }, {
                  type: 'email', message: '邮箱格式不正确!'
                }],
                initialValue: orgContact.email
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <div className='row-wrap clearfix'>
            <Form.Item className='double-columns' label='微信'>
              {getFieldDecorator('wx', {
                initialValue: orgContact.wx
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
            <div className='split-block'></div>
            <Form.Item className='double-columns' label='QQ'>
              {getFieldDecorator('qq', {
                initialValue: orgContact.qq
              })(
                <Input type='text' className='ins-input' />
              )}
            </Form.Item>
          </div>
          <div className='ins-subtitle'>
            <span className='title'>更多资料</span>
            <div className='title-line'></div>
          </div>
          <div className='profile-box single-column'>
            {/* <div className='text-number-box single-column'>
                            <span className='text-number'>{textareaVal.length || (insBaseInfo.profile && insBaseInfo.profile.length) || '0'}/{textareaLimitedNum}</span>
                        </div> */}
            <Form.Item
              label={<span className='avatar-symbol'>{insName}简介</span>}
              extra={this.renderModifyTip('profile')}
            >
              {getFieldDecorator('profile', {
                rules: [{ required: true, message: `请输入${insName}简介` }],
                // initialValue: profile
                initialValue: insBaseInfo.profile
              })(
                <TextArea style={{ resize: 'none', height: '150px', overflow: 'auto' }} placeholder={`请输入${insName}简介`}
                  className='ins-input' onChange={this.handleTextareaChange} maxLength={500} />
              )}
              <span className='text-number'>{textareaVal.length || (insBaseInfo.profile && insBaseInfo.profile.length) || '0'}/{textareaLimitedNum}</span>
            </Form.Item>
          </div>
          <Row type='flex' align='middle' justify='start' className='signature-box'>
            <Col span={18}>
              <Form.Item
                label={`一句话描述`}
                className='single-column'
                extra={this.renderModifyTip('signature')}
              >
                {getFieldDecorator('signature', {
                  rules: [{
                    validator: this.signatureValidate
                  }],
                  initialValue: insBaseInfo.signature
                })(
                  <Input type='text' className='ins-input' placeholder='不超过20个汉字或者40个字符' />
                )}
              </Form.Item>
              <div className='signature-input single-column'>
                <span className='text-number'>{signaturelen || (insBaseInfo.signature && insBaseInfo.signature.length) || '0'}/{signatureLimitedNum}</span>
              </div>
            </Col>
            <Col span={6}></Col>
          </Row>
          {/* <Row type='flex' align='middle' justify='start' id='ins-tags'>
                        <Col span={18}>
                            <Form.Item label='机构标签' className='tag-form'>
                                {getFieldDecorator('tag', {
                                    initialValue: filterTagList
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

const WrappedInsDataFormForm = Form.create({ name: 'register' })(InsDataForm)

export default WrappedInsDataFormForm