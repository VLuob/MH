import { Component } from 'react'
import dynamic from 'next/dynamic'
import classNames from 'classnames'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import {
  Form, Input, Avatar, Tooltip,
  Cascader, message, Icon, Upload, Select,
  Row, Col, Checkbox, Button, AutoComplete, Modal,
} from 'antd'

import area from '@base/system/area'
import { Router } from '@routes'
import { config, utils, helper } from '@utils'
import { AuthorType } from '@base/enums'
import { userCenterApi } from '@api'

import Geetest from '@components/features/Geetest'
import TitleHeader from '@containers/creator/TitleHeader'
import ClassLine from '@containers/creator/ClassLine'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

const CoverCrop = dynamic(() => import('@components/common/CoverCrop'), { ssr: false })

let seconds = 60
const { Option } = Select
const TextArea = Input.TextArea
const AutoCompleteOption = AutoComplete.Option

let textareaLimitedNum = 500
let signatureLimitedNum = 20
const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

let provinceData = []
let cityData = {}
let cityIdData = []
let provinceIdData = []

let timeout
let currentValue

let testData = ['昵称1', '昵称2', '昵称3']
let isExisted = false

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

  if (!isLt10M) {
    message.destroy()
    message.error('PNG,JPG,GIF不得超过10MB!')
  }

  return isLt10M
}

// function fetch(value, callback) {
//     if (timeout) {
//         clearTimeout(timeout);
//         timeout = null;
//     }
//     currentValue = value;

//     function fake() {
//         let data = [];
//         isExisted = false
//         const result = await userCenterApi.getCreatorNickName({nickname: value})
//         if (result.success && value !== '') {
//             data.push({
//                 value: value,
//                 text: value
//             })
//             result.data.map(item => {
//                 if (value !== item) {
//                     data.push({
//                         value: item,
//                         text: item
//                     })
//                 } else {
//                     isExisted = true
//                 }
//             })
//         }
//         callback(data)
//     }
//     timeout = setTimeout(fake, 300);
// }

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
  const { accountStore, userCenterStore, globalStore } = stores.store
  const { qiniuToken, isMobileScreen } = globalStore
  const { phoneInfo, GTVInfo, fetchGTVerifyCode, fetchPhoneBind, showCreatorClaim,
    updateCreatorClaim } = accountStore
  const { fetchSetSetting, fetchGetCreatorNickName, fetchCreateSetBaseInfo,
    fetchGetSettingBaseInfo, creatorBaseInfo, fetchGetCreatorBaseInfo,
    personBaseInfo, phoneVerifyPassed, updatePhoneVerifyPassed,
    fetchCreatorPhoneVerify, isExisted, fetchGetPersonalId } = userCenterStore

  return {
    globalStore,
    qiniuToken,
    isMobileScreen,
    phoneInfo,
    GTVInfo,
    fetchGTVerifyCode,
    fetchPhoneBind,
    fetchSetSetting,
    fetchGetCreatorNickName,
    fetchCreateSetBaseInfo,
    showCreatorClaim,
    updateCreatorClaim,
    fetchGetSettingBaseInfo,
    creatorBaseInfo,
    fetchGetCreatorBaseInfo,
    personBaseInfo,
    phoneVerifyPassed,
    updatePhoneVerifyPassed,
    fetchCreatorPhoneVerify,
    isExisted,
    fetchGetPersonalId
  }
})

@observer
class CreatorCreateForm extends Component {
  constructor(props) {
    super(props)
    const { creatorBaseInfo } = props
    this.state = {
      tags: [],
      nickData: [],
      nickValue: undefined,
      loading: false,
      vNickName: '',
      phoneNum: '',
      signaturelen: 0,
      textareaVal: '',
      phoneVisible: false,
      gtNewResult: null,
      gtResult: null,
      phoneVal: '',
      verifyVal: '',
      isDownCount: false,
      downCount: seconds,
      newPhoneNum: true,
      isPhoneVerified: false,
      cities: '',

      showAvatarCropModal: false,
      avatarUploading: false,
      tmpAvatarUrl: '',
      avatarUrl: creatorBaseInfo.avatar,
    }
  }

  componentDidMount() {
    const { fetchGTVerifyCode, fetchGetSettingBaseInfo, fetchGetCreatorBaseInfo,
      modifyID, fetchGetPersonalId } = this.props

    // fetchGetPersonalId({}, id => {
    //     fetchGetSettingBaseInfo({ type: 1, org_id: id })
    // })
    fetchGetPersonalId(callback => { })
    if (modifyID !== -1) {
      fetchGetCreatorBaseInfo({ org_id: modifyID }, res => {
        if (res.success) {
          this.setState({ avatarUrl: res.data.avatar })
        }
      })
    }
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


  handleSubmit = e => {
    const { avatarUrl, isPhoneVerified } = this.state
    const { fetchSetSetting, fetchCreateSetBaseInfo, personBaseInfo, creatorType, modifyID, creatorBaseInfo } = this.props

    e.preventDefault()

    this.props.form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const { tags } = this.state
        const name = (values.name || '').replace(/\s+/g, '')
        const nickname = (values.nickname || '').replace(/\s+/g, '')
        let params = {
          ...values,
          name,
          nickname,
          avatar:
            creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.avatar :
              avatarUrl ? avatarUrl : creatorBaseInfo.avatar,
          tagList: JSON.stringify(tags)
        }
        const city = values.areaCity
        const province = values.areaProvince

        let type
        let org_id
        if (modifyID === -1) {
          // type = creatorType === 1 ? 1 : creatorType === 2 ? 3 : 2
          type = creatorType
        } else {
          type = creatorType
          org_id = modifyID
        }

        params = {
          ...params,
          orgContact: JSON.stringify({
            name: values.contact,
            job: values.job,
            web: values.web,
            qq: values.qq,
            wx: values.wx,
            email: values.email,
            phone: values.phone,
          }),
          type: type,
          city: city,
          province: province,
          org_id: org_id
        }

        if (!this.checkFieldsChange(values)) {
          message.info('您的资料未有变动，请修改后再提交')
          return
        }

        if (!creatorBaseInfo.phone && !isPhoneVerified && !personBaseInfo.mobileBind) {
          message.destroy()
          message.warning(`手机号未验证!`)
        } else {
          // console.log(params)
          fetchCreateSetBaseInfo({ ...params, city, province, creatorType })
        }
      }
    })
  }

  checkFieldsChange(values) {
    const { avatarUrl } = this.state
    const { creatorBaseInfo, creatorType } = this.props
    const orgContact = creatorBaseInfo.orgContact || {}
    const isPersonal = creatorType === AuthorType.PERSONAL
    let isChange = false
    // console.log(creatorBaseInfo.avatar !== avatarUrl
    //     , creatorBaseInfo.nickname !== values.nickname 
    //     , creatorBaseInfo.name !== values.name
    //     , creatorBaseInfo.province !== values.areaProvince
    //     , creatorBaseInfo.city !== values.areaCity
    //     , (!isPersonal && creatorBaseInfo.staffSize !== values.staffSize)
    //     // , creatorBaseInfo.address !== values.address
    //     , creatorBaseInfo.profile !== values.profile
    //     , creatorBaseInfo.signature !== values.signature
    //     , (!isPersonal && orgContact.name !== values.contact)
    //     , orgContact.job !== values.job
    //     , orgContact.phone !== values.phone
    //     , orgContact.email !== values.email
    //     , orgContact.wx !== values.wx
    //     , orgContact.qq !== values.qq
    //     , (!isPersonal && orgContact.web !== values.web)
    //     )

    if (creatorBaseInfo.avatar !== avatarUrl
      || creatorBaseInfo.nickname !== values.nickname
      || creatorBaseInfo.name !== values.name
      || creatorBaseInfo.province !== values.areaProvince
      || creatorBaseInfo.city !== values.areaCity
      || (!isPersonal && creatorBaseInfo.staffSize !== values.staffSize)
      // || creatorBaseInfo.address !== values.address
      || creatorBaseInfo.profile !== values.profile
      || creatorBaseInfo.signature !== values.signature
      || (!isPersonal && orgContact.name !== values.contact)
      || orgContact.job !== values.job
      || orgContact.phone !== values.phone
      || orgContact.email !== values.email
      || orgContact.wx !== values.wx
      || orgContact.qq !== values.qq
      || (!isPersonal && orgContact.web !== values.web)
    ) {
      isChange = true
    }
    return isChange
  }

  handleChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true })

      return
    }
    if (info.file.status === 'done') {
      this.setState({ avatarUrl: info.file.response.data.url })
      getBase64(info.file.originFileObj, avatarUrl => {
        this.setState({
          avatarUrl,
          loading: false,
        })
      })
    }
  }

  handlePhoneChange = e => {
    this.setState({
      phoneNum: e.target.value
    })
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

  handleInputChange = e => {
    const { signaturelen } = this.state
    if (e.target.value.length <= signatureLimitedNum) {
      this.setState({ signaturelen: e.target.value.length })
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

  customRequest = ({ action, data, file, filename, onProgress, onError, onSuccess }) => {
    const { qiniuToken } = this.props;
    const token = qiniuToken;

    helper.qiniuUpload({
      file,
      token,
      next: (res) => {
        // console.log(res)
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
            url: `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`,
          }
        }
        onSuccess(ret, file)
      },
    })
  }

  validateAvatar = (rule, value, callback) => {
    const { avatarUrl, loading } = this.state
    const { insBaseInfo, fetchSetSetting, creatorType, creatorBaseInfo, personBaseInfo } = this.props

    if (!(avatarUrl || creatorBaseInfo.avatar || (creatorType === 1 && personBaseInfo.avatar))) {
      const warningText = loading ? `LOGO上传中` :
        creatorType === 1 ? `请上传头像` :
          creatorType === 2 ? `请上传LOGO` : `请上传创作者LOGO`
      callback(warningText)
    }

    callback()
  }

  validateNickName = (rule, value, callback) => {
    const { creatorType } = this.props
    this.setState({ vNickName: value })

    if (!value) {
      const warningText = creatorType === 2 ? `请输入服务商简称` : `请输入品牌主简称`
      callback(warningText)
    }
    callback()
  }

  // checkNameRegexp(str) {
  //     const reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
  //     if (reg.test(str)) {
  //         const len = str.replace(/[^\x00-\xff]/g,"aa").length;
  //         if (len < 4 || len > 32) {
  //             return false;
  //         }

  //         return true;
  //     }

  //     return false;
  // }
  checkNameRegexp(str) {
    // const reg = /^[\u4e00-\u9fa5a-z\d_]{2,}$/gi;
    // const reg = /^(.){2,}$/gi;
    const reg = /^[\u4e00-\u9fa5a-z\d_（）().]{2,}$/gi;
    if (reg.test(str)) {
      const len = str.replace(/[^\x00-\xff]/g, "aa").length;
      if (len < 4 || len > 32) {
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

  checkNameRegexpPersonal(str) {
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

  checkNameRulePersonal = (rule, value, callback) => {
    if (!this.checkNameRegexpPersonal(value)) {
      callback('2-8个汉字（4-16个字符）')
    }
    callback()
  }



  showPhoneModal = e => {
    const { phoneNum, newPhoneNum } = this.state
    const { personBaseInfo, creatorBaseInfo } = this.props
    this.setState({
      phoneVisible: true,
      phoneVal: newPhoneNum ? (!phoneNum ? (creatorBaseInfo.phone ? creatorBaseInfo.phone : personBaseInfo.mobilePhone) : phoneNum) : ''
    })
  }

  handlePhoneCancel = e => {
    this.setState({
      phoneVisible: false,
      verifyVal: ''
    })
  }

  handlePhoneOk = e => {
    const { gtResult, phoneVal, verifyVal } = this.state
    const { phoneVerifyPassed, fetchCreatorPhoneVerify, phoneInfo } = this.props
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
      fetchCreatorPhoneVerify({ phone: encodeURIComponent(this.state.phoneVal), code: verifyVal, type: 2, verify_token: token || phoneInfo.token }, callback => {
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
      // Geetest.reset()
    } else {
      message.destroy()
      message.error(`请先完成验证`)
    }
  }

  handleGeetest = gtResult => this.setState({ gtResult })

  handleNewPhoneChange = e => {
    this.setState({
      phoneVal: e.target.value
    })
  }

  handleVerifyChange = e => {
    this.setState({
      verifyVal: e.target.value
    })
  }

  // 发送验证码
  handleDownCount = () => {
    const { gtResult, phoneVal } = this.state

    if (!utils.isMobile(phoneVal)) {
      message.destroy()
      message.error(`请输入正确的手机号`)
      return
    }
    if (!!gtResult && gtResult.geetest_challenge && gtResult.geetest_seccode && gtResult.geetest_validate) {
      this.setState(prevState => ({ isDownCount: !prevState.isDownCount }))
      this.calculateDownCount()
      this.props.fetchPhoneBind({ type: 2, phone: encodeURIComponent(this.state.phoneVal), ...gtResult })
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

  handleNickSearch = value => {
    const { fetchGetCreatorNickName } = this.props

    // fetch(value, nickData => {
    //     console.log(nickData)
    //     this.setState({ nickData: nickData })
    // });

    fetchGetCreatorNickName(value, nickData => {
      this.setState({ nickData: nickData })
    })
  }

  handleNickChange = value => {
    const { showCreatorClaim, updateCreatorClaim, isExisted } = this.props

    this.setState({ nickValue: value });

    if (value !== this.state.nickData[0].value || isExisted) {
      updateCreatorClaim(true)
    } else {
      updateCreatorClaim(false)
    }
  }

  handleNickBlur = value => {
    // console.log(value)
    if (value) {
      this.handleNickChange(value)
    }
  }

  handleArea = value => {
    this.setState({
      cities: value
    });
    this.props.form.setFieldsValue({
      areaProvince: value,
      areaCity: ''
    });
  }

  handleCity = value => {
    this.props.form.setFieldsValue({
      areaCity: value
    });
  }

  render() {
    const {
      loading,
      textareaVal,
      signaturelen,
      phoneVisible,
      phoneVal,
      verifyVal,
      isDownCount,
      downCount,
      phoneNum,
      newPhoneNum,
      gtResult,
      vNickName,
      cities,
      avatarUrl,
      tmpAvatarUrl,
      avatarUploading,
      showAvatarCropModal,
    } = this.state
    const {
      isMobileScreen,
      titleInfo,
      creatorType,
      GTVInfo,
      showCreatorClaim,
      personBaseInfo,
      creatorBaseInfo,
      modifyID,
    } = this.props
    const { getFieldDecorator } = this.props.form
    const formItemLayout = {}
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
        {loading && <Icon type='loading' />}
      </div>
    )
    // const image = avatarUrl ? avatarUrl : creatorBaseInfo.avatar
    // const image = creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.avatar : avatarUrl ? avatarUrl : creatorBaseInfo.avatar
    const image = avatarUrl || creatorBaseInfo.avatar || (creatorType === AuthorType.PERSONAL ? personBaseInfo.avatar : undefined)
    const { city, province } = creatorBaseInfo

    return (
      <>
        {isMobileScreen && <MbNavigatorBar
          showTitle
          title={titleInfo}
        />}
        {!isMobileScreen && <TitleHeader name={titleInfo} />}
        <div className='institution-container creator-container'>
          <div className='create-ins-content creator-content'>
            <Form {...formItemLayout} onSubmit={this.handleSubmit}>
              <ClassLine name={creatorType === AuthorType.PERSONAL ? '创作者头像' : '创作者LOGO'} />

              <div className='row-wrap clearfix'>
                <Form.Item className='avatar-item' label={<span className='avatar-symbols'>{creatorType === AuthorType.PERSONAL ? '头像' : creatorType === AuthorType.SERVER ? 'LOGO' : '创作者LOGO'}</span>}>
                  <div className="form-item-avatar-wrapper">
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
                        customRequest={this.handleAvatarCustomRequest}
                        onChange={this.handleChange}>
                        {image ? <img src={image} alt='' className='upload-img' /> : uploadButton}
                      </Upload>
                    )}

                    <div className='suggest-wrap'>
                      <span className='suggest'>建议尺寸</span>
                      <span className='suggest'>200*200px</span>
                    </div>
                  </div>
                </Form.Item>
              </div>


              <ClassLine name='基本资料' />
              {creatorType === AuthorType.PERSONAL ?
                <div className='row-wrap clearfix'>
                  <Form.Item className='double-columns' label={<span className='avatar-symbol'>昵称</span>}>
                    {getFieldDecorator('nickname', {
                      rules: [{
                        validator: this.checkNameRulePersonal
                      }],
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.nickName : creatorBaseInfo.nickname
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' />
                    )}
                  </Form.Item>
                  <div className='split-block'></div>
                  <Form.Item className='double-columns' label='姓名'>
                    {getFieldDecorator('name', {
                      rules: [{
                        validator: this.checkNameRulePersonal
                      }],
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.realName : creatorBaseInfo.name
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' />
                    )}
                  </Form.Item>
                </div>
                : creatorType === AuthorType.SERVER ?
                  <div className='row-wrap clearfix'>
                    <Form.Item className='double-columns nickName-columns' label={<span className='avatar-symbol'>服务商简称 </span>}>
                      {getFieldDecorator('nickname', {
                        rules: [{
                          validator: this.checkNameRule
                        }],
                        initialValue: creatorBaseInfo.nickname
                      })(
                        <AutoComplete
                          dataSource={this.state.nickData}
                          style={{ width: 370 }}
                          onSearch={this.handleNickSearch}
                          onSelect={this.handleNickChange}
                          onBlur={this.handleNickBlur}
                        />
                      )}
                      {showCreatorClaim && vNickName !== '' && <div className='creatorClaim'>服务商简称已经存在</div>}
                      {/* 争议认领好了之后下面这行要打开 */}
                      {/* {showCreatorClaim && vNickName !== '' && <div className='creatorClaim'>服务商简称已经存在，<a href={`/claim`}>点此提交争议认领</a></div>} */}
                    </Form.Item>
                    <div className='split-block'></div>
                    <Form.Item className='double-columns' label='服务商公司名称'>
                      {getFieldDecorator('name', {
                        rules: [{
                          validator: this.checkNameRule
                        }],
                        initialValue: creatorBaseInfo.name
                      })(
                        <Input type='text' className='ins-input' autoComplete='off' />
                      )}
                    </Form.Item>
                  </div>
                  :
                  <div className='row-wrap clearfix'>
                    <Form.Item className='double-columns nickName-columns' label={<span className='avatar-symbol'>品牌主简称 </span>}>
                      {getFieldDecorator('nickname', {
                        rules: [{
                          validator: this.checkNameRule
                        }],
                        initialValue: creatorBaseInfo.nickname
                      })(
                        <AutoComplete
                          dataSource={this.state.nickData}
                          style={{ width: 370 }}
                          onSearch={this.handleNickSearch}
                          onSelect={this.handleNickChange}
                          onBlur={this.handleNickBlur}
                        />
                      )}
                      {showCreatorClaim && vNickName !== '' && <div className='creatorClaim'>品牌主简称已经存在</div>}
                      {/* 争议认领好了之后下面这行要打开 */}
                      {/* {showCreatorClaim && vNickName !== '' && <div className='creatorClaim'>品牌主简称已经存在，<a href={`/claim`}>点此提交争议认领</a></div>} */}
                    </Form.Item>
                    <div className='split-block'></div>
                    <Form.Item className='double-columns' label='品牌主公司名称'>
                      {getFieldDecorator('name', {
                        rules: [{
                          validator: this.checkNameRule
                        }],
                        initialValue: creatorBaseInfo.name
                      })(
                        <Input type='text' className='ins-input' autoComplete='off' />
                      )}
                    </Form.Item>
                  </div>
              }


              {creatorType === AuthorType.PERSONAL ?
                <div className='row-wrap clearfix' id='cascader'>
                  <Form.Item className='double-columns columns-bg creator-area-province' label={<span className='avatar-symbol'>所在地</span>}>
                    {getFieldDecorator('areaProvince', {
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.province : creatorBaseInfo.province ? Number(province) : ''
                    })(
                      <Select
                        style={{ width: 170, height: 38 }}
                        onChange={this.handleArea}>
                        {options.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item className='double-columns columns-bg creator-area-city'>
                    {getFieldDecorator('areaCity', {
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.city : creatorBaseInfo.city ? Number(city) : ''
                    })(
                      <Select
                        style={{ width: 170, height: 38, marginTop: 47 }}
                        onChange={this.handleCity}>
                        {creatorBaseInfo.province && creatorBaseInfo.city && !cities ? ((cityIdData[personBaseInfo.province] || {}).cities || []).map(item => {
                          return (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )
                        }) : cities ? ((cityIdData[cities] || {}).cities || []).map(item => {
                          return (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )
                        }) : creatorType === AuthorType.PERSONAL && modifyID === -1 && personBaseInfo.city && personBaseInfo.province && ((cityIdData[personBaseInfo.province] || {}).cities || []).map(item => {
                          return (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </Form.Item>
                  <div className='split-block'></div>
                  {/* <Form.Item className='double-columns columns-bg staff-size' label='详细地址'>
                                        {getFieldDecorator('address', {
                                            initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.address : creatorBaseInfo.address
                                        })(
                                            <Input type='text' className='ins-input' autoComplete='off' />
                                        )}
                                    </Form.Item> */}
                </div>
                :
                <div className='row-wrap clearfix' id='cascader'>
                  <Form.Item className='double-columns columns-bg creator-area-province' label={<span className='avatar-symbol'>所在地</span>}>
                    {getFieldDecorator('areaProvince', {
                      rules: [{ required: true, message: '请选择所在地' }],
                      initialValue: creatorBaseInfo.province ? Number(province) : ''
                    })(
                      <Select
                        style={{ width: 170, height: 38 }}
                        onChange={this.handleArea}>
                        {options.map(item => {
                          return (
                            <Option key={item.value} value={item.value}>{item.label}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </Form.Item>
                  <Form.Item className='double-columns columns-bg creator-area-city'>
                    {getFieldDecorator('areaCity', {
                      rules: [{ required: true, message: '请选择所在地' }],
                      initialValue: creatorBaseInfo.city ? Number(city) : ''
                    })(
                      <Select
                        style={{ width: 170, height: 38, marginTop: 47 }}
                        onChange={this.handleCity}>
                        {creatorBaseInfo.province && creatorBaseInfo.city && !cities ? ((cityIdData[creatorBaseInfo.province] || {}).cities || []).map(item => {
                          return (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )
                        }) : cities && cityIdData[cities].cities.map(item => {
                          return (
                            <Option key={item.id} value={item.id}>{item.name}</Option>
                          )
                        })}
                      </Select>
                    )}
                  </Form.Item>
                  <div className='split-block'></div>
                  <Form.Item className='double-columns columns-bg staff-size' label='人员规模'>
                    {getFieldDecorator('staffSize', {
                      rules: [{ required: true, message: '请选择人员规模' }],
                      initialValue: creatorBaseInfo.staffSize
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
              }

              {creatorType === AuthorType.PERSONAL ?
                <div className='row-wrap clearfix'>
                  <Form.Item className='double-columns' label={<span className='avatar-symbol'>公司 </span>}>
                    {getFieldDecorator('company', {
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.company : creatorBaseInfo.company
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' />
                    )}
                  </Form.Item>
                  <div className='split-block'></div>
                  <Form.Item className='double-columns' label='职位'>
                    {getFieldDecorator('job', {
                      initialValue: creatorType === AuthorType.PERSONAL && modifyID === -1 ? personBaseInfo.jobTitle : creatorBaseInfo.jobTitle
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' />
                    )}
                  </Form.Item>
                </div>
                :
                <div className='row-wrap clearfix'>
                  <Form.Item className='single-column' label='官网' style={{ marginBottom: '50px' }}>
                    {getFieldDecorator('web', {
                      initialValue: creatorBaseInfo.orgContact ? creatorBaseInfo.orgContact.web : ''
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' style={{ width: '770px' }} />
                    )}
                  </Form.Item>
                </div>
              }

              <ClassLine name='联系资料' />
              {creatorType !== AuthorType.PERSONAL && <div className='row-wrap clearfix'>
                <Form.Item className='double-columns' label={<span className='avatar-symbol'>联系人</span>}>
                  {getFieldDecorator('contact', {
                    rules: [{
                      required: true, message: '请输入联系人'
                    }],
                    initialValue: modifyID === -1 ? personBaseInfo.realName : creatorBaseInfo.orgContact ? creatorBaseInfo.orgContact.name : ''
                  })(
                    <Input type='text' className='ins-input' autoComplete='off' />
                  )}
                </Form.Item>
                <div className='split-block'></div>
                <Form.Item className='double-columns' label='职务'>
                  {getFieldDecorator('job', {
                    initialValue: modifyID === -1 ? personBaseInfo.jobTitle : creatorBaseInfo.orgContact ? creatorBaseInfo.orgContact.job : ''
                  })(
                    <Input type='text' className='ins-input' autoComplete='off' />
                  )}
                </Form.Item>
              </div>}
              <div className='row-wrap three-columns'>
                <Form.Item label={<span className='avatar-symbol'>手机号码</span>}>
                  {getFieldDecorator('phone', {
                    rules: [{
                      required: true, message: '请输入手机号码'
                    }, {
                      pattern: new RegExp(/^1[3456789]\d{9}$/, 'gi'), message: '手机号格式不正确!'
                    }],
                    initialValue: modifyID === -1 ? personBaseInfo.mobilePhone : creatorBaseInfo.phone
                  })(
                    <Input type='text' className='ins-input input-phone' autoComplete='off' style={{ width: 267 }} onChange={this.handlePhoneChange} disabled={personBaseInfo.mobileBind || creatorBaseInfo.phone || !newPhoneNum ? true : false} />
                  )}
                </Form.Item>
                <Button className="btn-phone-modify" style={{ marginLeft: 12, marginTop: 47, marginRight: 30, width: 91, height: 38 }}
                  onClick={this.showPhoneModal}>{(personBaseInfo.mobileBind || creatorBaseInfo.phone || !newPhoneNum) ? `修改` : `验证`}
                </Button>
                <Form.Item label={<span className='avatar-symbol'>电子邮件</span>}>
                  {getFieldDecorator('email', {
                    rules: [{
                      required: true, message: '请输入电子邮箱'
                    }, {
                      type: 'email', message: '邮箱格式不正确!'
                    }],
                    initialValue: modifyID === -1 ? personBaseInfo.email : creatorBaseInfo.email
                  })(
                    <Input type='text' className='ins-input'
                      autoComplete='off' style={{ width: 370 }}
                    // disabled={creatorType === AuthorType.PERSONAL ? true : false} 
                    />
                  )}
                </Form.Item>
              </div>
              <div className='row-wrap clearfix'>
                <Form.Item className='double-columns' label={<span className='avatar-symbol'>QQ</span>}>
                  {getFieldDecorator('qq', {
                    initialValue: modifyID === -1 ? personBaseInfo.qq : creatorBaseInfo.orgContact ? creatorBaseInfo.orgContact.qq : ''
                  })(
                    <Input type='text' className='ins-input' autoComplete='off' />
                  )}
                </Form.Item>
                <div className='split-block'></div>
                <Form.Item className='double-columns' label='微信'>
                  {getFieldDecorator('wx', {
                    initialValue: modifyID === -1 ? personBaseInfo.weiXin : creatorBaseInfo.orgContact ? creatorBaseInfo.orgContact.wx : ''
                  })(
                    <Input type='text' className='ins-input' autoComplete='off' />
                  )}
                </Form.Item>
              </div>

              <ClassLine name='更多资料' />
              <div className='creator-textarea-box'>
                <div className='text-number-box'>
                  <span className='text-number'>{textareaVal.length}/{textareaLimitedNum}</span>
                </div>
                <Form.Item label={<span className='avatar-symbol'>{creatorType === AuthorType.PERSONAL ? `个人简介` : creatorType === AuthorType.SERVER ? `服务商简介` : `品牌主简介`}</span>}>
                  {getFieldDecorator('profile', {
                    rules: [{ required: true, message: creatorType === AuthorType.PERSONAL ? '请输入个人简介' : creatorType === AuthorType.SERVER ? `请输入服务商简介` : `请输入品牌主简介` }],
                    initialValue: creatorBaseInfo.profile
                  })(
                    <TextArea style={{ resize: 'none', height: '150px', overflow: 'hidden' }}
                      placeholder={creatorType === AuthorType.PERSONAL ? '请输入个人简介' : creatorType === AuthorType.SERVER ? `请输入服务商简介` : `请输入品牌主简介`}
                      className='ins-input' onChange={this.handleTextareaChange} maxLength={500} />
                  )}
                </Form.Item>
              </div>
              <Row type='flex' align='middle' justify='start' className='single-column signature-box'>
                <Col span={18}>
                  <Form.Item label='一句话描述' className='single-column'>
                    {getFieldDecorator('signature', {
                      initialValue: creatorBaseInfo.signature
                    })(
                      <Input type='text' className='ins-input' autoComplete='off' style={{ width: 770 }} maxLength={20} onChange={this.handleInputChange} />
                    )}
                  </Form.Item>
                  <div className='signature-input single-column'>
                    <span className='text-number'>{signaturelen}/{signatureLimitedNum}</span>
                  </div>
                </Col>
                <Col span={6}></Col>
              </Row>

              <Row type='flex' align='middle' justify='start'>
                <Form.Item {...tailFormItemLayout} className="form-item-submit">
                  <Button type='primary' htmlType='submit' style={{ borderRadius: '3px', border: 'none', outline: 'none', height: 38, width: 100, marginTop: 56 }}>提交</Button>
                </Form.Item>
              </Row>
            </Form>
          </div>
          <Modal
            className='safe-container-modal creator-VerCode-modal'
            title={newPhoneNum ? `验证手机号` : `修改手机号`}
            visible={phoneVisible}
            okText={`确定`}
            cancelText={`取消`}
            //style={{ padding: '0 50px' }}
            width={420}
            maskClosable={false}
            forceRender={true}
            onOk={this.handlePhoneOk}
            onCancel={this.handlePhoneCancel}>
            <Row>
              <Col>
                <Input type='text' value={phoneVal}
                  placeholder={`请输入新手机号`} className='new-border-input'
                  onChange={this.handleNewPhoneChange} style={{ width: `100%`, height: 38 }} />
              </Col>
              <Col>
                {!gtResult &&
                  <>
                    {!GTVInfo.success &&
                      <div className='gt-loading'>
                        <i className='m1-loading'><i></i></i> 正在加载验证码...
                                            </div>}
                    {GTVInfo.success &&
                      <Geetest
                        {...GTVInfo}
                        onSuccess={this.handleGeetest}
                        width="100%" />}
                  </>
                }
                {gtResult &&
                  <div className='zhanwei'></div>}
              </Col>
              <Col>
                <div className="phone-verify-code-wrapper">
                  <Input type='text' value={verifyVal} placeholder={`请输入验证码`} className='new-verify-input' onChange={this.handleVerifyChange} style={{ width: 250, height: 38, marginRight: 0 }} />
                  {!isDownCount ? <Button className='send-verify' onClick={this.handleDownCount} style={{ height: 38 }}>获取验证码</Button> :
                    <Button className='send-verify' style={{ height: 38 }} disabled>重新发送({downCount})S</Button>}

                </div>
              </Col>
            </Row>
          </Modal>
        </div>
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
      </>
    )
  }

}

const WrappedInsDataFormForm = Form.create({ name: 'register' })(CreatorCreateForm)

export default WrappedInsDataFormForm