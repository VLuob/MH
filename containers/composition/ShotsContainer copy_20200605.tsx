import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import qs from 'qs'
import 'moment/locale/zh-cn'
import {
  Form,
  Row,
  Col,
  Select,
  Upload,
  Icon,
  Input,
  AutoComplete,
  Button,
  Checkbox,
  Avatar,
  message,
  Tag,
  DatePicker,
  Progress,
  Tooltip,
  Modal,
} from 'antd'
import { Router } from '@routes'
import EditableTagGroup from '@components/common/EditableTagGroup'
import CoverCrop from '@components/common/CoverCrop';
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import PictureCardList from './PictureCardList'
import ShotsGallery from '../shots/ShotsGallery'

import { DownloadAuthTypes, DownloadAuthStatus, CompositionTypes, AuthorType, UploadFileTypes, CompositionStatus, EditionType, AddedServiceType } from '@base/enums'
import { config, utils, helper } from '@utils'
import { user } from '@base/system'
import sysOrder from '@base/system/order'

import datePickerLocale from 'antd/lib/date-picker/locale/zh_CN';

import './ShotsContainer.less'

moment.locale('zh-cn')

const iconUploadImage = '/static/images/icon/icon_image.svg'
const iconUploadVideo = '/static/images/icon/icon_video.svg'
const iconUpload = '/static/images/icon/icon_upload.svg'


const FormItem = Form.Item
const { Option } = Select
const TextArea = Input.TextArea
const AutoOption = AutoComplete.Option
const Dragger = Upload.Dragger
const { MonthPicker } = DatePicker

const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

const monthFormat = 'YYYY-MM';
const COOKIE_SELECT_AUTHOR_TIP = 'mh_sel_author_tip'

const editionDatas = sysOrder.filters.editionDatas
const serviceDatas = sysOrder.filters.serviceDatas

function getBase64(img, callback) {
  const reader = new FileReader();
  reader.addEventListener('load', () => callback(reader.result));
  reader.readAsDataURL(img);
}

function checkFileIsVideo(file) {
  const isTypeVideo = file.type.toLowerCase().indexOf('video/') === 0;
  const isSuffixVideo = /\.(mp4|mkv|flv|m2v|rmvb|avi|wmv|3gp|amv|dmv)$/.test(file.name.toLowerCase())
  return isTypeVideo || isSuffixVideo
}

function getWidthHeight(file, minWidth, minHeight) {
  let isAllow = false
    //读取图片数据
    const reader = new FileReader();
    reader.onload = function (e) {
        const data = e.target.result;
        //加载图片获取图片真实宽度和高度
        const image = new Image();
        image.onload=function(){
          const width = image.width;
          const height = image.height;
          // console.log(width, height);
          if (width < minWidth) {
            message.success(`图片宽度不得小于${minWidth}px`)
          } else if (height < minHeight) {
            message.success(`图片高度不得小于${minHeight}px`)
          }
          // resolve({width, height});
        };
      image.src= data;
    };
    reader.readAsDataURL(file);
}

function getVideoMeta(file) {
  return new Promise((resolve, reject) => {
    try {
      //获取视频或者音频时长
      var fileurl = URL.createObjectURL(file);
      //经测试，发现audio也可获取视频的时长
      // var audioElement = new Audio(fileurl);
      var videoElement = document.createElement('video')
      videoElement.src = fileurl
      videoElement.addEventListener("loadedmetadata", function (_event) {
          // console.log('duration', videoElement.duration);//单位：秒
          // console.log('width:',videoElement.videoWidth,'height:',videoElement.videoHeight)
          resolve({width: videoElement.videoWidth, height: videoElement.videoHeight, duration: videoElement.duration})
      });
      
    } catch (error) {
      reject(error)
    }
  })
  
}

function beforeUpload(file) {
  // const isJPG = file.type === 'image/jpeg';
  const isPic = ['image/jpeg','image/jpg','image/png','image/gif'].some(v => v === file.type.toLowerCase())
  if (!isPic) {
    message.error('仅支持上传 PNG,JPG,GIF 格式文件!');
  }
  const isLt2M = file.size / 1024 / 1024 < 10;
  if (!isLt2M) {
    message.error('图片不得超过10MB!');
  }
  return isPic && isLt2M;
}



// function shotsBeforeUpload(file) {
//   // const isVideo = file.type.toLowerCase().indexOf('video/') === 0;
//   const isVideo = checkFileIsVideo(file);
//   const isImage = file.type.toLowerCase().indexOf('image/') === 0;
//   const maxImageSize = 10
//   const maxVideoSize = 500
//   message.destroy()
//   if (isImage) {
//     const isPic = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].some(
//       v => v === file.type.toLowerCase()
//     );
//     if (!isPic) {
//       message.error('仅支持上传 PNG,JPG,GIF 格式图片!');
//     }
//     const isImageMax = file.size / 1024 / 1024 <= maxImageSize;
//     if (!isImageMax) {
//       message.error(`图片不得超过${maxImageSize}MB!`);
//     }
//     return isPic && isImageMax;
//   } else if (isVideo) {
//     const isVideoMax = file.size / 1024 / 1024 <= 500;
//     if (!isVideoMax) {
//       message.error(`视频不得超过${maxVideoSize}MB!`);
//     }
//     return isVideoMax;
//   } else {
//     message.error(`仅支持上传 PNG,JPG,GIF 格式图片和任意格式不超过${maxVideoSize}M视频！`);
//     return false;
//   }
// }

function shotsBeforeUpload(file) {
  // const isVideo = file.type.toLowerCase().indexOf('video/') === 0;
  const isVideo = checkFileIsVideo(file);
  const isImage = file.type.toLowerCase().indexOf('image/') === 0;
  // const maxImageSize = 10
  // const maxVideoSize = 500
  message.destroy()
  if (isImage) {
    const isPic = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].some(v => v === file.type.toLowerCase());
    if (!isPic) {
      message.error('仅支持上传 PNG,JPG,GIF 格式图片!');
    }
    return isPic
  } if (isVideo) {
    return isVideo
  } else {
    message.error(`仅支持上传 PNG,JPG,GIF 格式图片和任意格式视频！`);
    return false;
  }
}


@inject(stores => {
    const { compositionStore, accountStore, globalStore } = stores.store
    return {
        compositionStore,
        accountStore,
        globalStore,
        qiniuToken: globalStore.qiniuToken,
        currentUser: accountStore.userClientInfo || {},
        authors: compositionStore.authors,
        memberSuggestion: compositionStore.memberSuggestion,
        tagSuggestion: compositionStore.tagSuggestion,
        brandSuggestion: compositionStore.brandSuggestion,
        categories: compositionStore.categories,
        forms: compositionStore.forms,
        detail: compositionStore.compositionEdit.composition || {},
    }
})
@observer
@Form.create()
export default class ShotsContainer extends Component {
  state = {
    loading: false,
    submitting: false,
    compositionId: '',

    authorId: '',
    coverUrl: '',
    members: [],
    tags: [],
    brandItem: {},


    title: '',
    summary: '',

    titleMax: 32, 
    summaryMax: 300,
    titleCurrent: 0,
    summaryCurrent: 0,

    currentAuthorId: '',

    worksFileList: [],
    attachFileList: [],


    toPublish: false,
    toPreview: false,

    // 阅读并同意
    isAgree: false,
    // 同步梅花创新奖
    isSyncMawards: false,

    showGalleryFullscreen: false,
    galleryIndex: 0,

    prevFormValues: {},
    
    coverUploading: false,
    showCoverCropModal: false,
    tmpCoverUrl: '',

    showSelectAuthorTip: false,
  }

  attachUploadProps = {
    name: 'file',
    action: uploadFileApi,
    headers: {
      authorization: 'authorization-text',
    },
    onChange: (info) => {
      if (info.file.status !== 'uploading') {
        // console.log(info.file, info.fileList);
      }
      if (info.file.status === 'done') {
        message.success(`${info.file.name} 文件上传成功`);
      } else if (info.file.status === 'error') {
        message.error(`${info.file.name} 文件上传失败`);
      }
    },
    onRemove: (file) => {
      
    },
  };

  isFileUploading = false

  componentDidMount() {
      // this.initCompositionDetail()
      this.requestCurrent()
      this.requestComposition()
      this.requestAuthors()
      this.requestClassifications()
      // this.initCurrentAuthor()
      // this.initAutoSave()
      this.initEvents()
      this.initQiniuToken()
      this.initSelectAuthorTip()
  }

  componentWillUnmount() {
    this.chearTimers()
    this.removeEvents()
  }

  chearTimers() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    if (this.brandTimer) clearInterval(this.brandTimer);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const { detail: nextDetail } = nextProps
    const { detail } = this.props
    if (!isEqual(nextDetail.tags, detail.tags)) {
      const tags = (nextDetail.tags || []).map(tag => tag.tagName)
      this.setState({tags})
    }
    if (!isEqual(nextDetail.members, detail.members)) {
      this.setState({members: nextDetail.members || []});
    }
    if (nextDetail.cover !== detail.cover) {
      this.setState({coverUrl: nextDetail.cover});
    }
    if (nextDetail.brandId !== detail.brandId) {
      this.setState({brandItem: {id: nextDetail.brandId, chName: nextDetail.brandName}});
    }
    if (!isEqual(nextDetail.files, detail.files)) {
      const worksFileList = (toJS(nextDetail.files) || []).sort((a,b) => a.position - b.position).map(item => ({uid: -(item.id),name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url}));
      this.setState({worksFileList});
    }
    if (!isEqual(nextDetail.attachFiles, detail.attachFiles)) {
      const attachFileList = (toJS(nextDetail.attachFiles) || []).map(item => ({uid: -(item.id),name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url}));
      this.setState({attachFileList});
      // this.props.form.setFieldsValue({
      //   attachment: {fileList: attachFileList}
      // })
    }
    if (nextDetail.authorId !== detail.authorId) {
      const authorId = String(nextDetail.authorId)
      this.props.form.setFieldsValue({
        author: authorId ? authorId : undefined,
      })
      this.setState({authorId})
    }
  }

  initEvents() {
    window.addEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  removeEvents() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload, false)
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

  initSelectAuthorTip() {
    const cookieTip = jsCookie.get(COOKIE_SELECT_AUTHOR_TIP)
    this.setState({showSelectAuthorTip: !cookieTip })
  }

  handleBeforeUnload = (e) => {
    const event = window.event || e
    const values = this.props.form.getFieldsValue()
    if (!values.author || !values.title) {
      event.returnValue = "您正在编辑作品，确定要关闭网页并保存草稿吗？"
    }
  }

  initCompositionDetail() {
    const { compositionStore, resultCompositionDetail } = this.props
    // console.log('resultCompositionDetail',resultCompositionDetail)
    if (resultCompositionDetail) {
      compositionStore.resetCompositionDetail(resultCompositionDetail, 1)
    }
  }

  requestCurrent() {
    const { accountStore } = this.props
    accountStore.fetchGetClientCurrent({})
  }

  requestComposition() {
    const { compositionStore, query } = this.props
    if (!query.id) {
      return
    }
    const orgId = utils.getQueryString('orgId')
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const compositionId = query.id
    const params = { compositionId, token, client, op: 1, orgId}
    compositionStore.fetchComposition(params)
  }

  async requestAuthors() {
      const { compositionStore, query, form } = this.props
      const response = await compositionStore.fetchAuthors()

      // 新增默认选择第一个创作者
      if (response.success && !query.id) {
        const author = (response.data || [])[0] || {}
        const authorId = author.id
        form.setFieldsValue({author: authorId})
        this.setState({authorId})
      }
  }

  requestClassifications() {
      const { compositionStore } = this.props
      compositionStore.fetchClassifications({})
  }

  initCurrentAuthor() {
    const currAuthor = user.getCookieUser()
    if (currAuthor) {
      const currentAuthorId = currAuthor.author && currAuthor.author.id
      this.setState({currentAuthorId})
      this.props.form.setFieldsValue({author: currentAuthorId})
    }
  }

  checkFormDataChange(values) {
    const { prevFormValues  } = this.state;
    let isChange = false
    if (values.author !== prevFormValues.author) {
      isChange = true
    }
    if (values.title !== prevFormValues.title) {
      isChange = true
    }
    const prevContentStr = prevFormValues.content ? prevFormValues.content.toHTML() : '';
    const contentStr = values.content ? values.content.toHTML() : '';
    if (prevContentStr !== contentStr) {
      isChange = true
    }

    return isChange
  }

  initAutoSave = () => {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer)
    this.autoSaveTimer = setInterval(() => {
      this.autoSave();
    }, 1000 * 30);
  }


  autoSave = () => {
    const { form } = this.props;
    const { prevFormValues } = this.state;
    const values = form.getFieldsValue();
    values.status = CompositionStatus.DRAFT;
    // console.log('prev',prevFormValues)
    // console.log('value',values)
    this.setState({submitStatus: 'save'})
    
    if (this.checkFormDataChange(values)) {
      this.simpleAutoSave(values, (res) => {
        // console.log(res)
        if (res.success) {
          this.setState({prevFormValues: {...values}})
          message.success('保存成功');
          if (!query.id) {
            // location.href = `/shots/edit/${res.data}`
            Router.pushRoute(`/shots/edit/${res.data}`)
          } 
        }
      });
    }
  }

  handleSubmit = (e) => {
    e.preventDefault() 
    const { form, query } = this.props 
    const { isAgree, worksFileList } = this.state
    if (!isAgree) {
      message.error('请勾选并阅读发布协议')
      return
    } else {
      const { authorId, edition } = this.getCurrentAuthorEdition()
      form.validateFieldsAndScroll((err, values) => {
        const filterWorksFiles = worksFileList.filter(item => item.status === 'done')
        const hasUploadingWorks = worksFileList.some(item => item.status === 'uploading')
        const setFields = {}
        if (hasUploadingWorks) {
          message.error('您有作品正在上传，请上传完成后再提交')
          setFields.worksFiles = {
            value: '',
            errors: [new Error('您有作品正在上传，请上传完成后再提交')],
          }
          form.setFields(setFields)
          return false
        } else if (filterWorksFiles.length === 0) {
          message.error('请上传作品内容')
          setFields.worksFiles = {
            value: '',
            errors: [new Error('请上传作品内容')],
          }
          form.setFields(setFields)
          return false
        }

        if (!err) {
          const status = CompositionStatus.AUDITING
          values.status = status
          const params = this.arragementSubmitFields(values) 
          this.setState({submitting: true})
          this.submitSave(params, (res) => {
            this.setState({submitting: false})
            let param: any = {
              v: edition.editionType,
              expire: edition.gmtExpire,
              aid: authorId,
              id: query.id,
              orgId: params.orgId || 0,
            }
            if (res.success) {
              const compositionId = query.id || res.data
              // const orgId = params.orgId || 0
              // location.href = `/composition/success/${CompositionTypes.SHOTS}-${compositionId}`
              // Router.pushRoute(`/composition/success/${CompositionTypes.SHOTS}-${compositionId}-${orgId}`)
              // Router.pushRoute(`/composition/shots/result?v=${edition.editionType}&id=${compositionId}&orgId=${orgId}&code=${res.data.code}`)
              param.id = compositionId
              param.code = 'S100000'
              // Router.pushRoute(`/composition/shots/result?${qs.stringify(param)}`)
              location.href = `/composition/shots/result?${qs.stringify(param)}`
            } else {
              if (res.data.code === 'E100006') {
                const compositionId = query.id || res.data.msg
                param.id = compositionId
                param.code = res.data.code 
                // Router.pushRoute(`/composition/shots/result?${qs.stringify(param)}`)
                location.href = `/composition/shots/result?${qs.stringify(param)}`
              } else {
                message.error(res.data.msg)
              }
            }
          }) 
        }
      })
    }
  }

  handleSave = e => {
    const { form, query } = this.props;
    e.preventDefault();
    const values = form.getFieldsValue();
    values.status = CompositionStatus.DRAFT;
    // console.log(values)
    this.setState({submitStatus: 'save'});
    this.simpleSave(values, (res) => {
      if (res.success) {
        this.setState({prevFormValues: {...values}})
        message.success('保存成功');
        if (!query.id) {
          // location.href = `/shots/edit/${res.data}`
          Router.pushRoute(`/shots/edit/${res.data}`)
        } 
      } else {
        message.error(res.data.msg);
      }
    });
  }

  handlePreview = (e) => {
    this.setState({ toPreview: true }, () => {
      const { form, query, authors, compositionStore } = this.props;
      e.preventDefault();
  
      // console.log(form.isFieldValidating('title'))
      const values = form.getFieldsValue();
      const nextStatus = CompositionStatus.DRAFT;
      values.status = nextStatus
    //   console.log(values)
      this.simpleSave(values, (res) => {
        this.setState({toPreview: false});
        if (res.success) {
          const compositionId = query.id || res.data
          compositionStore.fetchCompositionPreviewCode({compositionId}, (res) => {
            if (res.success) {
              window.open(`/shots/preview/${res.data}`)
              if (!query.id) {
                // location.href = `/shots/edit/${compositionId}`
                const author = authors.find(item => item.id === values.author)
                const orgParam = author.type === AuthorType.PERSONAL ? '' : '?orgId=' + values.author
                Router.pushRoute(`/shots/edit/${compositionId}${orgParam}`)
              } 
            }
          })
        }else {
          message.error(res.data.msg)
        }
      });
    });

  };

  simpleSave(values, callback) {
    const { form } = this.props;
    let isOk = true
    let setFields = {}
    if (!values.author) {
      isOk = false;
      setFields.author = {
        errors: [new Error('创作者不可为空')]
      }
      message.error('请选择创作者')
    }
    if (!values.title || values.title.trim() === '') {
      setFields.title = {
        value: '',
        errors: [new Error('作品标题不可为空')],
      }
      if (isOk) {
        message.error('请填写作品标题')
      }
      isOk = false
    }

    if (!isOk) {
      form.setFields(setFields)
    } else {
      const params = this.arragementSubmitFields(values);
      this.submitSave(params, callback);
    }
  }

  submitSave(params, callback) {
    const { compositionStore, query } = this.props
    if (query.id) {
      params.compositionId = query.id
      compositionStore.editComposition(params, callback)
    } else {
      compositionStore.addComposition(params, callback)
    }
  }

  arragementSubmitFields(values) {
    const { authors, query } = this.props
    const { members, tags, id, authorItem, brandItem, toPublish, toPreview, worksFileList, attachFileList, coverUrl } = this.state;
    // const authorityType = values.authType ? DownloadAuthTypes.GENERAL : DownloadAuthTypes.VIP;
    const authorityType = DownloadAuthTypes.GENERAL;
    const status = toPublish ? CompositionStatus.AUDITING : values.status || CompositionStatus.DRAFT
    // const attachment = values.attachment || {};
    const filterAttachFiles = (attachFileList || []).filter(item => item.status === 'done');
    const attachFiles = filterAttachFiles.map(item => {
      let url = item.url || item.response.data.url;
      return {type: UploadFileTypes.ATTACHMENT, title: item.name, url }
    });
    // const worksFiles = values.worksFiles || {};
    const filterWorksFiles = (worksFileList || []).filter(item => item.status === 'done');
    const files = filterWorksFiles.map((item, index) => {
      const url = item.url || item.response.data.url;
      const type = item.fileType || (item.type.indexOf('image/') >= 0 ? UploadFileTypes.WORKS_IMAGE : UploadFileTypes.WORKS_VIDEO)
      return {type, title: item.name, position: index, url}
    });
    const memberArr = members.map(item => ({email: item.email, authorId: item.authorId}));
    // const cover = values.cover.file.url || values.cover.file.response.data.url;
    // const cover = values.cover ? (values.cover.file.url || values.cover.file.response.data.url) : '';
    const cover = coverUrl

    const author = authors.find(item => item.id === values.author)

    const gmtFirstRelease = values.gmtFirstRelease ? values.gmtFirstRelease.valueOf() : undefined
    
    
    const params = {
      type: CompositionTypes.SHOTS,
      filesStr: JSON.stringify(files),
      title: values.title,
      cover,
      summary: values.summary,
      authority: JSON.stringify({download_limit_type: authorityType, download_limit_setting: 1}),
      status,
      categoryId: values.category,
      formId: values.form,
      brandId: brandItem.id,
      productName: values.productName,
      gmtFirstRelease,
    }

    if (attachFiles.length > 0) {
      params.attachFilesStr = JSON.stringify(attachFiles);
    }
    if (memberArr.length > 0) {
      params.membersStr = JSON.stringify(memberArr);
    }
    if (tags.length > 0) {
      params.tagsStr = JSON.stringify(tags);
    }

    if (author 
      && author.type !== AuthorType.PERSONAL
      ) {
        params.orgId = author.id
        params.orgName = author.name
    }

    if (toPreview) {
      params.toPreview = toPreview
    }

    this.setState({toPublish, toPreview})
    
    return params;
  }

  handleCoverCustomRequest = (option) => {
    const file = option.file
    if (file.type === 'image/gif') {
      this.customRequest(option);
    } else {
      getBase64(file, tmpCoverUrl => {
        this.handleCoverCropVisible(true, tmpCoverUrl);
      })
    }
  }

  handleShotsBeforeUpload = (file) => {
    const { authorId } = this.state
   
    return new Promise((resolve, reject) => {

      message.destroy()
      if (!authorId) {
        message.error('请先选择创作者')
        return false
      }
      
      const isVideo = checkFileIsVideo(file)
      if (!isVideo) {
        // return await getWidthHeight(file, 200,200)
        if (shotsBeforeUpload(file)) {
          resolve(file)
        } else {
          reject()
        }
        return
      } 

      getVideoMeta(file).then((meta: any) => {
        const { authorItem, edition, extraService, extraServiceTypes } = this.getCurrentAuthorEdition()
        const isHorizontal = meta.width >= meta.height
        // if (meta.width < 1280 && meta.height < 720 || meta.width < 720 && meta.height < 1280) {
        if (isHorizontal && (meta.width < 1280 || meta.height < 720) || !isHorizontal && (meta.width < 720 || meta.height < 1280)) {
          Modal.warning({
            title: '温馨提示',
            content: '作品视频需上传720P或更高分辨率，高分辨率图片和视频会获得更多推荐曝光。',
            okText: '返回修改',
            okButtonProps: {className: 'themes'},
          })
          reject()
        // } else if (edition.editionType === EditionType.FREE && (meta.width >= 1920 && meta.height >= 1080 || meta.width >= 1080 && meta.height >= 1920)) {
        } else if (
          edition.editionType === EditionType.FREE && (
            isHorizontal && (meta.width >= 1920 || meta.height >= 1080) || !isHorizontal && (meta.width >= 1080 || meta.height >= 1920)
          )) {
          // const is4K = (meta.width >= 3840 && meta.height >= 2160 || meta.width >= 2160 && meta.height >= 3840)
          const is4K = (isHorizontal && (meta.width >= 3840 || meta.height >= 2160) || !isHorizontal && (meta.width >= 2160 || meta.height >= 3840))
          const powerTip = is4K ? '4k' : '1080P'
          const upgradeEditionType = is4K ? EditionType.ADVANCED : EditionType.STANDARD
          Modal.confirm({
            title: '温馨提示',
            content: `您的创作者版本不支持${powerTip}分辨率的视频，继续上传将压缩到720P分辨率播放，您可以选择升级或者压缩后提交`,
            cancelText: '在线升级',
            okText: '压缩视频',
            cancelButtonProps: {className: 'themes'},
            okButtonProps: {type:"default"},
            onOk: () => {
              resolve(file)
            },
            onCancel: () => {
              window.open(`/pricing?v=${upgradeEditionType}&aid=${authorId}`)
              reject()
            }
          })
          
        // } else if (edition.editionType === EditionType.STANDARD 
        //   && !extraServiceTypes.includes(AddedServiceType.UPLOAD_EXTEND)
        //   && (meta.width >= 3840 && meta.height >= 2160 || meta.width >= 2160 && meta.height >= 3840)) {
        } else if (edition.editionType === EditionType.STANDARD 
          && !extraServiceTypes.includes(AddedServiceType.UPLOAD_EXTEND)
          && (isHorizontal && (meta.width >= 3840 || meta.height >= 2160) || !isHorizontal && (meta.width >= 2160 || meta.height >= 3840))) {
          Modal.confirm({
            title: '温馨提示',
            content: '您的创作者版本不支持4K分辨率的视频，继续上传将压缩到1080分辨率播放，您可以选择升级或者压缩后提交',
            cancelText: '在线升级',
            okText: '压缩视频',
            cancelButtonProps: {className: 'themes'},
            okButtonProps: {type:"default"},
            onOk: () => {
              resolve(file)
            },
            onCancel: () => {
              window.open(`/pricing?v=${EditionType.ADVANCED}&aid=${authorId}`)
              reject()
            }
          })
        } else {
          resolve(file)
        }
      }).catch(err => {
        reject(err)
      })
      
    })

  }

  customRequest = ({action, data, file, filename, onProgress, onError, onSuccess}) => {
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

  handleTitleChange = (e) => {
    let title = e.target.value.trim()
    const length = utils.getStringLength(title)
    let titleCurrent = Math.ceil(length / 2)

    this.setState({titleCurrent})
  }

  handleSummaryChange = (e) => {
    let summary = e.target.value.trim()
    const length = utils.getStringLength(summary)
    let summaryCurrent = Math.ceil(length / 2)
    this.setState({summaryCurrent})
  }

  handleBeforeUpload = () => {

  }

  handleDeleteShots = (uid) => {
    const { worksFileList } = this.state
    const fileList = worksFileList.filter(item => item.uid !== uid)
    this.setState({worksFileList: fileList}, () => {
      // 删除后需触发验证，否则容易跳过验证，出错
      this.props.form.validateFields(['worksFiles'], {force: true})
    })
  }

  handleSetCover = (uid) => {
    const { worksFileList } = this.state
    const currFile = worksFileList.find(item => item.uid === uid)
    if (currFile) {
      let coverUrl = ''
      if (currFile.fileType === 3 || (currFile.type && currFile.type.indexOf('video/') >= 0)) {
        coverUrl = (currFile.url || currFile.response.data.url) + '?vframe/jpg/offset/7/w/318'
      } else {
        coverUrl = currFile.url || currFile.response.data.url
      }
      
      this.handleCoverCropVisible(true, coverUrl);
      // this.setState({coverUrl})
    }
  }

  handleMoveCard = (worksFileList) => {
    this.setState({worksFileList})
    this.props.form.setFieldsValue({
      worksFiles: {fileList: worksFileList}
    })
  }

  handleCoverChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true });
      return;
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const coverUrl = info.file.response.data.url;
      this.setState({coverUrl, loading: false});

      // getBase64(info.file.originFileObj, coverUrl => this.setState({
      //   coverUrl,
      //   loading: false,
      // }));
    }
  }

  handleShotsChange = (info) => {

    const status = info.file.status;
    if (status !== 'uploading') {
      this.isFileUploading = false
    //   console.log(info.file, info.fileList);
    }
    if (status === 'done') {
      message.success(`${info.file.name} 文件上传成功.`);
    } else if (status === 'error') {
      message.error(`${info.file.name} 文件上传失败.`);
    }
    // if (shotsBeforeUpload(info.file)) {
    //   this.setState({worksFileList: info.fileList});
    // }
    // if (this.handleShotsBeforeUpload(info.file)) {
    //   this.setState({worksFileList: info.fileList});
    // }
    if (status === 'uploading') {
      this.isFileUploading = true
      // console.log(JSON.stringify(info.fileList))
      this.setState({worksFileList: info.fileList});
    }
  }

  handleAuthorSelect = (authorId, option) => {
    const authorItem = option.props.author || {}
    this.setState({authorId, authorItem})
  }

  handleBrandSelect = (value, option) => {
    this.setState({brandItem: option.props.item})
  }

  handleBrandSearch = (keywords) => {
    const { compositionStore } = this.props;
    this.authorTimer && clearTimeout(this.authorTimer);
    if (keywords.trim().length === 0) {
      compositionStore.setBrandSuggestion([])
      this.setState({brandItem: {}})
      return;
    } 

    this.authorTimer = setTimeout(() => {
      compositionStore.fetchBrandSuggestion({keywords})
    }, 500);
  }

  handleBrandFocus = () => {

  }

  memberFilterOption = (inputValue, option) => {
    return !!option.key && option.key !== 'null' && option.key !== 'undefined'
  }

  handleMemberSelect = (memberText) => {
    this.setState({memberText});
  }

  handleInviteMember = () => {
    const { memberText, members } = this.state;
    if (!utils.isEmail(memberText)) {
      message.info('邀请人邮箱格式不正确');
      return;
    }
    if (members.some(item => item.email.trim() === memberText.trim())) {
      message.info('已经存在邀请人列表中');
      return;
    }

    this.setState({members: [...members, {email: memberText.trim()}]});
  }

  handleRemoveMember = (member, e) => {
    e.preventDefault();
    const { members } = this.state;
    const filterMembers = members.filter(m => m.email !== member.email);
    this.setState({ members: filterMembers });
  }

  handleTagChange = (tags) => {
    this.setState({tags});
  }

  handleMemberSearch = (email) => {
    const { compositionStore } = this.props
    this.memberTimer && clearTimeout(this.memberTimer);
    if (email.trim().length === 0) {
        compositionStore.setMemberSuggestion([])
      return;
    } 
    this.memberTimer = setTimeout(() => {
      compositionStore.fetchMemberSuggestion({email})
    }, 500);
  }

  handleAgreeChange = e => {
    const { isAgree } = this.state
    this.setState({isAgree: !isAgree})
  }

  handleSyncMawardsChange = e => {
    const { isSyncMawards } = this.state
    this.setState({isSyncMawards: !isSyncMawards})
  }

  handleGalleryFullscreen = (flag, index) => {
    this.setState({showGalleryFullscreen: !!flag, galleryIndex: (index || 0)})
  }


  handleCoverCropVisible = (flag, url) => {
    this.setState({ showCoverCropModal: !!flag, tmpCoverUrl: url || ''})
  }

  handleCoverCropConfirm = (base64) => {
    const { globalStore, form } = this.props;
    const token = globalStore.qiniuToken;
    this.setState({coverUploading: true});
    helper.qiniuPutb64({base64, token}).then((res) => {
      // console.log(res)
      const coverUrl = `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
      // console.log(coverUrl)
      this.setState({coverUrl, showCoverCropModal: false, coverUploading: false}, () => {
        // 删除后需触发验证，否则容易跳过验证，出错
        form.validateFields(['cover'], {force: true})
      })
    }).catch((e) => {
      this.setState({coverUploading: false});
      message.error('上传失败：', e)
    })
  }

  handleAuthorSelectTipClose = () => {
    this.setState({showSelectAuthorTip: false})
    jsCookie.set(COOKIE_SELECT_AUTHOR_TIP, '1', {expires: 7, path: '/'})
  }

  getAttachFileList(attachFiles) {
    const attachFileList = attachFiles.map(file => ({
      uid: -(file.id),
      name: file.title,
      fileType: file.type,
      status: 'done',
      url: file.url,
    }));
    return attachFileList;
  }

  handleAttachmentChange = (attachFiles) => {
    this.setState({attachFileList: attachFiles.fileList})
  }

  getCurrentAuthorEdition() {
    const { authorId } = this.state
    const { authors } = this.props
    // console.log('author',toJS(authors), authorId)
    const authorItem = authors.find(item => item.id === authorId) || {}
    const edition = authorItem.edition || (authorId ? {editionType: EditionType.FREE} : {})
    const extraService = authorItem.extraService || []
    const extraServiceTypes = extraService.map(item => item.editionType)
    const editionIntro = editionDatas.find(item => item.id === edition.editionType) || (authorId ? editionDatas[0] : {})
    const extraServiceIntro = serviceDatas.filter(item => extraService.some(ex => ex.editionType === item.id))

    return { authorId, authorItem, edition, extraService, extraServiceTypes , editionIntro, extraServiceIntro }
  }

  renderMemberOption(item) {
    return (
      <AutoOption key={item.email} text={item.email}>
        <div className="global-search-item">
          <span className="global-search-item-avatar">
            <Avatar src={item.avatar} size={20} />
          </span>
          <span className="global-search-item-name">{item.nickname}</span>
          <span className="global-search-item-email">({item.email})</span>
        </div>
      </AutoOption>
    )
  }

  renderAuthorOption(item) {
    return (
      <AutoOption key={item.author_id} item={item} text={item.nickname || ''}>
        <div className="global-search-item">
          <span className="global-search-item-avatar">
            <Avatar src={item.avatar} />
          </span>
          <div className="global-search-item-content">
            <span className="global-search-item-name">{item.nickname}</span>
            <span className="global-search-item-email">meihua.info/{item.code}</span>
          </div>
        </div>
      </AutoOption>
    )
  }

  renderBrandOption(item) {
    const labelText = `${item.chName}（${item.spellCode}）`;
    return (
      <AutoOption key={item.id} item={item} text={labelText}>
        <div className="global-search-item">
          <span className="global-search-item-name">
            {labelText}
          </span>
        </div>
      </AutoOption>
    )
  }

  render() {
    const { 
        query, 
        form, 
        detail,
        authors, 
        categories, 
        forms, 
        memberSuggestion,
        brandSuggestion,
        currentUser,
    } = this.props

    const { getFieldDecorator } = form

    const { 
      submitting,
      members, 
      worksFileList, 
      authorId,
      coverUrl, 
      tags, 
      isAgree, 
      isSyncMawards,
      titleMax, 
      summaryMax, 
      titleCurrent, 
      summaryCurrent, 
      showGalleryFullscreen,
      galleryIndex,
      attachFileList,
      currentAuthorId,
      coverUploading,
      showCoverCropModal,
      tmpCoverUrl,
      showSelectAuthorTip,
    } = this.state

    const isEdit = !!query.id

    const memberOptions = memberSuggestion.map(this.renderMemberOption)
    const brandOptions = brandSuggestion.map(this.renderBrandOption)

    const downloadAuthStr = `{"download_limit_type":${DownloadAuthTypes.VIP},"download_limit_setting":${DownloadAuthStatus.OPENED}}`;
    const downloadAuth = JSON.parse(detail.authority || downloadAuthStr);

    // const attachFileList = this.getAttachFileList(detail.attachFiles || [])

    const hasShots = worksFileList.length > 0

    const defaultCoverFiles = coverUrl ? {file:{uid: -(new Date().getTime()), status: 'done', url: coverUrl}} : null;

    // const authorItem = authors.find(item => item.id === authorId) || {}
    const { authorItem, edition, editionIntro, extraService, extraServiceIntro } = this.getCurrentAuthorEdition()
    const isFreeEdition = edition.editionType === EditionType.FREE 
    const isAdvancedEdition = edition.editionType === EditionType.ADVANCED
    const expireFormatLabel = isFreeEdition ? '免费' : (edition.gmtExpire ? moment(edition.gmtExpire).format('YYYY-MM-DD') : '')


    const creationUrl = `/teams/${authorId}/creation?type=shots&status=1`

    const uploadButton = (
      <div>
        {/* <Icon className="cover-upload-icon" type={this.state.loading ? 'loading' : 'cloud-upload'} /> */}
        <div className="cover-upload-img"><img src="/static/images/icon/icon_image.svg" alt=""/></div>
        <div className="cover-upload-text">添加图片</div>
        <div className="cover-upload-intro">PNG,JPG,GIF不得超过10MB</div>
        <div className="cover-upload-desc">可拖拽或点击上传</div>
      </div>
    );

    // const currentAuthor = currentUser.author || {}
    // const currentAuthorId = currentAuthor.id

    const saveLoading = false

    const formItemLayout = null
    const submitFormLayout = null
    // const submitFormLayout = {
    //   wrapperCol: {
    //     xs: { span: 24, offset: 0 },
    //     sm: { span: 10, offset: 7 },
    //   },
    // }

    const galleryFiles = showGalleryFullscreen ? worksFileList.filter(item => item.status === 'done').map(item => {
      return {
        id: item.uid,
        type: item.fileType || (item.type.indexOf('image/') >= 0 ? UploadFileTypes.WORKS_IMAGE : UploadFileTypes.WORKS_VIDEO),
        url: item.url || item.response.data.url,
        title: item.name,
        position: item.position,
      }
    }) : []

    // console.log(toJS(authors))

    return (
      <Form onSubmit={this.handleSubmit} >
      <div className="shots-edit-top">
        <div className="top-item top-left">
          <div style={{display: 'inline-block'}}>
          <FormItem {...formItemLayout}>
            {getFieldDecorator('author', {
              rules: [{
                required: true,
                message: '请输选择创作者',
              }],
              initialValue: detail.authorId ? String(detail.authorId) : undefined,
            })(<Select
                suffixIcon={<Icon type="caret-down" />}
                className="author-select author-select-shots"
                placeholder="请选择创作者"
                // disabled={isEdit}
                onSelect={this.handleAuthorSelect}
              >{
                authors.map(item => {
                  const currentAuthorEdition = item.edition ||{editionType: EditionType.FREE}
                  const currentAuthorIsFree = currentAuthorEdition.editionType === EditionType.FREE
                  const showAuthorType = currentAuthorIsFree || item.type === AuthorType.BRANDER || item.type === AuthorType.EDITOR
                  return (
                  <Option key={item.id} value={item.id} author={item} className="select-author-option">
                  <div className="select-author-item select-author-item-shots">
                    <div className="item-avatar">
                      <Avatar icon="user" src={item.avatar} size={30} />
                    </div>
                    <div className="item-info">
                      <UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType} />
                      {/* <AuthorEditionTag editionType={currentAuthorEdition.editionType} authorType={item.type} mini /> */}
                      <div className="nick">{item.nickname}</div>
                      {/* <AuthorAuthenticationIcon hide={currentAuthorIsFree} style={{marginLeft: '6px'}} /> */}
                        {/* <div className="domain"><UserIdentityComp currentType={item.type} /> {item.name}</div> */}
                    </div>
                  </div>
                </Option>
                )})
              }
            </Select>)}
          {showSelectAuthorTip && <div className="nav-tip-box">这里可以切换发布作品的创作者  <Icon type="close" className="nav-tip-close" onClick={this.handleAuthorSelectTipClose} /></div>}
          </FormItem>
          </div>
        {authorId && <>
        <span style={{marginRight: '20px', marginLeft: '20px'}}>创作者版本：{editionIntro.name}</span>
        {!isFreeEdition && <span style={{marginRight: '20px'}}>到期时间：{expireFormatLabel}</span> }   
        <a 
          href={`/pricing?v=${isFreeEdition ? EditionType.STANDARD : edition.editionType}&aid=${authorId}`} 
          target="_blank"
          style={{color: '#168dd7'}}
        >
          {isFreeEdition ? '升级' : '续费'}
        </a> 
        </>}
        </div>
        {authorId && <div className="top-item top-right">
          {/* {!isAdvancedEdition && <span>本月剩余发布量：{authorItem.monthLeftPublishedQuantity || 0} 条，账户累积剩余发布量：{authorItem.totalLeftPublishedQuantity || 0} 条，</span>} */}
          {!isAdvancedEdition && <span>本月剩余发布量：{authorItem.monthLeftPublishedQuantity || 0} 条，</span>}
          <a href={creationUrl} target="_blank" style={{color: '#168dd7'}}>发布作品管理</a>
        </div>}
      </div>
      <div className="form-container shots-upload-box">
        <FormItem {...formItemLayout} className="form-item-shots">
          <div className={classnames('shots-upload-area', {'update-has-list': hasShots})}>
            {getFieldDecorator('worksFiles', {
              rules: [
                {
                  required: true,
                  // message: '请上传作品',
                  validator: (_, value, callback) => {
                    // const filterWorksFiles = (worksFileList || []).filter(item => item.status === 'done');
                    // const hasUploading = (worksFileList || []).some(item => item.status === 'uploading')
                    // console.log('shots validate ', filterWorksFiles.length, this.isFileUploading)
                    // if (filterWorksFiles.length === 0 && !this.isFileUploading) {
                    if (worksFileList.length === 0) {
                      callback('请上传作品')
                    } else {
                      callback()
                    }
                  },
                },
              ],
              initialValue: {fileList: worksFileList},
            })(<Dragger
                name="file"
                multiple={true}
                listType="picture-card"
                action={uploadFileApi}
                showUploadList={false}
                //beforeUpload={shotsBeforeUpload}
                beforeUpload={this.handleShotsBeforeUpload}
                fileList={worksFileList}
                customRequest={this.customRequest}
                onChange={this.handleShotsChange}
                previewFile={(file) => {
                  // console.log('file preview', file)
                }}
            >
              <div className="shots-upload-icons">
                <div className="upload-icon-item">
                  <div className="upload-icon-img"><img src={iconUploadImage} alt=""/></div>
                  <div className="upload-icon-info">
                    <div className="info-title">一个或多个高清图片</div>
                    <div className="info-desc">支持PNG、GIF、JPG等格式图片</div>
                  </div>
                </div>
                <div className="upload-icon-item">
                  <div className="upload-icon-img"><img src={iconUploadVideo} alt=""/></div>
                  <div className="upload-icon-info">
                    <div className="info-title">一个或多个高清视频</div>
                    <div className="info-desc">支持主流格式高清视频</div>
                  </div>
                </div>
              </div>
              <div className={classnames('shots-upload-icon-area', {'has-shots': hasShots})}>
                <div className="upload-icon-area-box">
                  <div className="upload-bigicon-img">
                    <img src="/static/images/composition/upload_big.svg" alt=""/>
                  </div>
                  <div className="upload-bigicon-title">选择图片或视频</div>
                  <div className="upload-bigicon-text">可拖拽或点击上传</div>
                </div>
              </div>
              </Dragger>)}
            
              {hasShots > 0 && <PictureCardList
                fileList={worksFileList}
                onCover={this.handleSetCover}
                onFullscreen={index => this.handleGalleryFullscreen(true, index)}
                onDelete={this.handleDeleteShots}
                onMoveCard={this.handleMoveCard}
              />}
            <div className="shots-upload-bottom">
              <div className="publish-info-text">
                <a href="/rule/shots" target="_brank">梅花网作品库收录规范和编辑规范</a>
              </div>
              <div className="field-desc">作品视频需上传720P或更高分辨率，高分辨率图片和视频会获得更多推荐曝光。{!isAdvancedEdition && <span><a href={`/pricing?v=${edition.editionType}&aid=${authorId}`} target="_blank" style={{color: '#168dd6'}}>升级高版本</a>最高支持4K超清视频上传和展示。</span>}</div>
            </div>
          </div>
        </FormItem>
      </div>
      {hasShots && <div className='form-container shots-edit-form-box' style={{marginTop: '30px'}}>
          <Row>
            {/* Left */}
            <Col span={10} className="shots-publish-left">
            
              <FormItem {...formItemLayout} label="封面">
                {getFieldDecorator('cover', {
                  rules: [
                    {
                      required: true,
                      // message: '请上传封面',
                      validator: (_, value, callback) => {
                        if (!coverUrl) {
                          callback('请上传封面')
                        } else {
                          callback()
                        }
                      },
                    },
                  ],
                  initialValue: defaultCoverFiles || '',
                })(<Upload
                    name="file"
                    listType="picture-card"
                    className="cover-uploader"
                    showUploadList={false}
                    action={uploadFileApi}
                    beforeUpload={beforeUpload}
                    customRequest={this.handleCoverCustomRequest}
                    onChange={this.handleCoverChange}
                  >
                    {/* {coverUrl ? <span className="cover-image" style={{backgroundImage: `url(${coverUrl})`}}></span> : uploadButton} */}
                    {coverUrl ? <span className="cover-image">
                      <img src={coverUrl + '?imageMogr2/thumbnail/!504x360r/gravity/center/crop/504x360'}/>
                        <span className="cover-edit-text">更换封面</span>
                      </span> : uploadButton}
                  </Upload>)}
                  <div className="field-desc">尺寸504*360 px，支持png、gif、jpg图片</div>
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                品类
                  {' '}
                  <Tooltip title="品类说明">
                    <a href="/rule/shots" target="_blank"><Icon type="question-circle" /></a>
                  </Tooltip>
                </span>
              }>
                {getFieldDecorator('category', {
                  rules: [
                    {
                      required: true,
                      message: '请选择品类',
                    },
                  ],
                  initialValue: detail.categoryId,
                })(<Select 
                    className="select-left"
                  placeholder="请选择品类"
                    >
                    {categories.map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                  </Select>)}
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                形式
                  {' '}
                  <Tooltip title="形式说明">
                    <a href="/rule/shots" target="_blank"><Icon type="question-circle" /></a>
                  </Tooltip>
                </span>
              }>
                {getFieldDecorator('form', {
                  rules: [
                    {
                      required: true,
                      message: '请选择形式',
                    },
                  ],
                  initialValue: detail.formId,
                })(<Select 
                  className="select-left"
                  placeholder="请选择形式"
                >
                    {forms.map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                  </Select>)}
              </FormItem>
              <FormItem {...formItemLayout} label="标签">
                <div className="tags-box">
                  <EditableTagGroup
                    tags={tags}
                    onChange={this.handleTagChange}
                  />
                </div>
              </FormItem>
            </Col>
            <Col span={1}></Col>
            {/* Right */}
            <Col span={13}>
              <FormItem {...formItemLayout} label="作品标题" className="has-length-tips">
                {getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: '请输入作品标题',
                    },
                  ],
                  initialValue: detail.title,
                })(<Input 
                    className="input-title"
                    placeholder="须客观描述作品本身，可包含品牌、年份、主题等要素，如：淘宝2018年货节海报。"
                    onChange={this.handleTitleChange} />)}
                <span className={classnames('length-tips', {error: titleCurrent >= titleMax})}>{titleCurrent}/{titleMax}</span>
              </FormItem>

              <FormItem {...formItemLayout} label="作品描述" className="has-length-tips">
                {getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: '请输入作品描述',
                    },
                  ],
                  initialValue: detail.summary,
                })(
                  <TextArea
                    className="textarea-summary"
                    placeholder="对作品的内容、创作手法、创作背景做简要概括性描述。"
                    onChange={this.handleSummaryChange}
                  />
                )}
                <span className={classnames('length-tips', {error: summaryCurrent >= summaryMax})}>{summaryCurrent}/{summaryMax}</span>
              </FormItem>

              <FormItem {...formItemLayout} label="附件">
                {getFieldDecorator('attachment', {
                  rules: [
                  ],
                  initialValue: {fileList: attachFileList}
                })(
                  <Upload 
                    {...this.attachUploadProps} 
                    className="attach-file"
                    fileList={attachFileList}
                    customRequest={this.customRequest}
                    onChange={this.handleAttachmentChange}
                  >
                    <Button>
                      <Icon type="paper-clip" /> 点击上传作品源文件（如：设计PSD源文件等）
                    </Button>
                  </Upload>
                )}
                
                {/* {getFieldDecorator('authType', {
                    valuePropName: 'checked',
                    initialValue: downloadAuth.download_limit_type === DownloadAuthTypes.GENERAL,
                  })(
                    <Checkbox>仅允许关注我的用户免费下载附件</Checkbox>
                  )} */}
              </FormItem>

              {/* <FormItem {...formItemLayout} label="共同创作者">
                <div >
                  <Row>
                    <Col span={23}>
                      <AutoComplete
                        className="global-search"
                        style={{ width: '100%' }}
                        dataSource={memberOptions}
                        filterOption={this.memberFilterOption}
                        onSelect={this.handleMemberSelect}
                        onSearch={this.handleMemberSearch}
                        placeholder="请输入共同创作者名称"
                        optionLabelProp="text"
                      >
                      </AutoComplete>
                    </Col>
                    <Col span={1}>
                      <Button onClick={this.handleInviteMember}>邀请</Button>
                    </Col>
                  </Row>
                </div>
                  <div className="tags">
                  {members.map((member, index) => {
                    let visitLabel = ''
                    if (member.sent === false) {
                      visitLabel = '待邀请'
                    } else if (member.sent === true) {
                      if (member.visit === true) {
                        visitLabel = '邀请中'
                      } else {
                        visitLabel = '已确认'
                      }
                    }
                    const memberElem = (
                      <Tag key={index} closable onClose={(e) => this.handleRemoveMember(member, e)}>
                        {member.email}{visitLabel && `（${visitLabel}）`}
                      </Tag>
                    ) 
                    return memberElem 
                  })}
                  </div>
              </FormItem> */}

              <Row>
                <Col span={8}>
                  <FormItem {...formItemLayout} label="品牌" style={{paddingRight: '20px'}}>
                    {getFieldDecorator('brand', {
                      rules: [
                      ],
                      initialValue: detail.brandName,
                    })(
                      <AutoComplete
                        className="global-search"
                        style={{ width: '100%' }}
                        dataSource={brandOptions}
                        onSelect={this.handleBrandSelect}
                        onSearch={this.handleBrandSearch}
                        onFocus={this.handleBrandFocus}
                        placeholder="服务客户名称或品牌"
                        optionLabelProp="text"
                      >
                      </AutoComplete>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                <FormItem {...formItemLayout} label="产品" style={{paddingLeft: '10px', paddingRight: '10px'}}>
                    {getFieldDecorator('productName', {
                      rules: [
                      ],
                      initialValue: detail.productName,
                    })(<Input placeholder="请输入产品名称" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                <FormItem {...formItemLayout} label="发表月度" style={{paddingLeft: '20px'}}>
                    {getFieldDecorator('gmtFirstRelease', {
                      rules: [
                      ],
                      initialValue: detail.gmtFirstRelease ? moment(moment(detail.gmtFirstRelease).format('YYYY-MM'), monthFormat) : null,
                    })(
                      <MonthPicker 
                        format={monthFormat} 
                        locale={datePickerLocale}
                        placeholder="选择发表周期" 
                        style={{width: '100%'}} 
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>

              {/* <FormItem {...formItemLayout}>
                <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意 <a href="/agreement/shots" className="copyright-link" target="_blank">《梅花网作品库发布协议》</a></Checkbox>
              </FormItem> */}
              {/* <FormItem {...submitFormLayout} style={{ marginTop: 32 }}>
                <Button loading={saveLoading} ref={el => this.submitRef = el} onClick={this.handleSave}>保存至草稿</Button>
                <span className="publish-btns">
                  <Button onClick={this.handlePreview} style={{ marginLeft: 8 }}>预览</Button>
                  <Button htmlType="submit" type="primary" className="themes" style={{ marginLeft: 8 }} loading={submitting}>发布</Button>
                </span>
              </FormItem> */}
            </Col>
          </Row>
          {/* <Row style={{marginTop: '15px'}}>
            <Col>
                <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意 <a href="/agreement/shots" className="copyright-link" target="_blank">《梅花网作品库发布协议》</a></Checkbox>
            </Col>
          </Row> */}
        {showGalleryFullscreen &&
          <ShotsGallery
            isFullscreen
            isPreview
            index={galleryIndex}
            detail={detail}
            files={galleryFiles}
            onClose={e => this.handleGalleryFullscreen(false)}
          />}
         {showCoverCropModal &&
          <CoverCrop
            loading={coverUploading}
            visible={showCoverCropModal}
            url={tmpCoverUrl}
            onCancel={e => this.handleCoverCropVisible()}
            onConfirm={this.handleCoverCropConfirm}
          />}
      </div>}
      <div className="shots-edit-bottom">
        <div className="bottom-handle-wrapper">
          <div className="bottom-handle-list">
            <div className="bottom-handle-item">
              <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意</Checkbox> <a href="/agreement/shots" className="copyright-link" target="_blank">《梅花网作品库发布协议》</a>
            </div>
            {/* <div className="bottom-handle-item">
              <Checkbox checked={isSyncMawards} onClick={this.handleSyncMawardsChange}>用该作品报名</Checkbox> <a href="https://mawards.meihua.info" className="copyright-link" target="_blank">《2020梅花创新奖》</a>
            </div> */}
          </div>
        </div>
        <div className="buttom-btns">
          <Button className="btn-draft" loading={saveLoading} ref={el => this.submitRef = el} onClick={this.handleSave}>保存至草稿</Button>
          <span className="publish-btns">
            <Button onClick={this.handlePreview} style={{ marginLeft: 8 }}>预览</Button>
            <Button htmlType="submit" type="primary" className="themes" style={{ marginLeft: 8 }} loading={submitting}>发布</Button>
          </span>
        </div>
      </div>
      </Form>
    )
  }
}