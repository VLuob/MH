import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import qs from 'qs'
// import BraftEditor from 'braft-editor'
import Swiper from 'swiper'
import moment from 'moment'
import 'moment/locale/zh-cn'
import {
  Form,
  Row,
  Col,
  Select,
  Cascader,
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
  Tooltip,
  Popover,
} from 'antd'
import 'braft-editor/dist/index.css'
import { Router } from '@routes'
import CustomIcon from '@components/widget/common/Icon'
import EditableTagGroup from '@components/common/EditableTagGroup'
import CoverCrop from '@components/common/CoverCrop';
import UserIdentityComp from '@components/widget/common/UserIdentityComp'
import AuthorEditionTag from '@components/author/AuthorEditionTag'
import AuthorAuthenticationIcon from '@components/author/AuthorAuthenticationIcon'
import ImportModal from './ImportModal'
import SelectShotsListModal from './SelectShotsListModal'

import {
  DownloadAuthTypes,
  DownloadAuthStatus,
  CompositionStatus,
  CompositionTypes,
  UploadFileTypes,
  AuthorType,
  EditionType,
} from '@base/enums'
import { user, composition } from '@base/system'
import { config, utils, helper, session } from '@utils'
import { spawn } from 'child_process';


// const BraftEditor = dynamic(import('braft-editor'), {ssr: false})

moment.locale('zh-cn')

const FormItem = Form.Item
const { Option } = Select
const AutoOption = AutoComplete.Option
const TextArea = Input.TextArea
const { MonthPicker } = DatePicker

const controls = [
  'headings', 'font-size', 'font-family', 'text-color',
  'bold', 'italic', 'underline', 'blockquote',
  'list-ul', 'list-ol', 'text-align', 'text-indent',
  'link', 'separator', 'media',
  'hr', 'undo', 'redo', 'remove-styles', 'fullscreen',
]

const SESSION_SELECT_AUTHOR_ID = 'mh_sel_author_id'
const uploadFileApi = `${config.API_MEIHUA}/zuul/sys/common/file`

const monthFormat = 'YYYY-MM';


const hooks = {
  'toggle-link': ({ href, target }) => {
    href = href.indexOf('http') === 0 ? href : `http://${href}`
    //   console.log(href)
    return { href, target }
  },
  'remove-medias': (params) => {
    // console.log(params)
    return params
  },
}

// 记录表单是否有数据，当有数据时为true
let hasFormData = false



function getBase64(img, callback) {
  const reader = new FileReader()
  reader.addEventListener('load', () => callback(reader.result))
  reader.readAsDataURL(img)
}

function beforeUpload(file) {
  // console.log(file)
  // const isJPG = file.type === 'image/jpeg' 
  const isPic = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'].some(v => v === file.type.toLowerCase())
  if (!isPic) {
    message.error('仅支持上传 PNG,JPG,GIF 格式文件!')
  }
  const isLt2M = file.size / 1024 / 1024 < 10
  if (!isLt2M) {
    message.error('图片不得超过10MB!')
  }
  return isPic && isLt2M
}

@inject(stores => {
  const { compositionStore, accountStore, globalStore } = stores.store
  return {
    globalStore,
    compositionStore,
    accountStore,
    qiniuToken: globalStore.qiniuToken,
    currentUser: accountStore.userClientInfo || {},
    authors: compositionStore.authors,
    memberSuggestion: compositionStore.memberSuggestion,
    tagSuggestion: compositionStore.tagSuggestion,
    brandSuggestion: compositionStore.brandSuggestion,
    classifications: compositionStore.classifications,
    categories: compositionStore.categories,
    forms: compositionStore.forms,
    detail: compositionStore.compositionEdit.composition || {},
  }
})
@observer
@Form.create()
export default class ArticleContainer extends Component {

  state = {
    loading: false,
    submitging: false,
    compositionId: '',

    coverUrl: '',
    members: [],
    tags: [],
    brandItem: {},
    memberText: '',

    // editorStatus: BraftEditor.createEditorState(null),
    content: '',

    title: '',
    summary: '',

    titleMax: 32,
    summaryMax: 150,
    titleCurrent: 0,
    summaryCurrent: 0,

    currentAuthorId: '',

    toPublish: false,
    toPreview: false,

    worksFileList: [],
    attachFileList: [],

    prevFormValues: {},

    exportModal: false,
    importLoading: false,

    coverUploading: false,
    showCoverCropModal: false,
    tmpCoverUrl: '',

    selectShotsModalVisible: false,
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
      if (info.file.status === 'done') {
        message.destroy()
        message.success(`${info.file.name} 文件上传成功`)
      } else if (info.file.status === 'error') {
        message.destroy()
        message.error(`${info.file.name} 文件上传失败`)
      }
    },
    onRemove: (file) => {

    },
  }

  componentDidMount() {
    this.initData()
    // this.initCompositionDetail()
    this.requestCurrent()
    this.requestComposition()
    this.requestAuthors()
    this.requestClassifications()
    // this.initCurrentAuthor()
    // this.initAutoSave()

    this.initEditor()
    this.initEvents()
    this.initQiniuToken()
  }

  componentWillUnmount() {
    this.chearTimers()
    this.removeEvents()
  }

  chearTimers() {
    if (this.autoSaveTimer) clearInterval(this.autoSaveTimer);
    if (this.brandTimer) clearInterval(this.brandTimer);
  }

  // UNSAFE_componentWillReceiveProps(nextProps) {
  //   const { detail: nextDetail } = nextProps
  //   const { detail } = this.props
  //   if (!isEqual(nextDetail.tags, detail.tags)) {
  //     const tags = (nextDetail.tags || []).map(tag => tag.tagName)
  //     this.setState({ tags })
  //   }
  //   if (!isEqual(nextDetail.members, detail.members)) {
  //     this.setState({ members: nextDetail.members || [] })
  //   }
  //   if (nextDetail.cover !== detail.cover) {
  //     this.setState({ coverUrl: nextDetail.cover })
  //   }
  //   if (nextDetail.brandId !== detail.brandId) {
  //     this.setState({ brandItem: { id: nextDetail.brandId, chName: nextDetail.brandName } })
  //   }
  //   if (nextDetail.content !== detail.content) {
  //     const content = nextDetail.content
  //     this.setState({ content });
  //     if (this.editor) {
  //       this.editor.$txt.html(content)
  //     }
  //   }
  //   if (!isEqual(nextDetail.attachFiles, detail.attachFiles)) {
  //     const attachFileList = (nextDetail.attachFiles || []).map(item => ({ uid: -(item.id), name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url }));
  //     this.setState({ attachFileList });
  //   }
  //   // if (!isEqual(nextDetail.currentUser, detail.currentUser)) {
  //   //   console.log(nextDetail.currentUser)
  //   //   const currentUser = nextDetail.currentUser || {}
  //   //   const currentAuthor = currentUser.author
  //   //   if (currentAuthor) {
  //   //     const currentAuthorId = currentAuthor.id
  //   //     this.setState({currentAuthorId})
  //   //     this.props.form.setFieldsValue({author: currentAuthorId})
  //   //   }
  //   // }
  //   if (nextDetail.authorId !== detail.authorId) {
  //     this.props.form.setFieldsValue({
  //       author: nextDetail.authorId ? String(nextDetail.authorId) : undefined,
  //     })
  //   }
  // }

  initEvents() {
    window.addEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  removeEvents() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  handleBeforeUnload = (e) => {
    const event = window.event || e
    const values = this.props.form.getFieldsValue();
    // console.log(hasFormData, values)
    if (!values.author || !values.title) {
      event.returnValue = "您正在编辑作品，确定要关闭网页并保存草稿吗？"
    }
  }

  initData() {
    const sessionAuthorId = session.get(SESSION_SELECT_AUTHOR_ID)
    if (sessionAuthorId) {
      this.setState({ authorId: sessionAuthorId })
    }
  }

  initEditor() {
    const self = this
    const JEditor = window.JEditor
    const editor = new JEditor(self.JEditorRef)
    this.editor = editor

    // console.log(self.JEditorRef)

    // editor = new JEditor('editor-trigger');

    // 上传图片
    // editor.config.uploadImgUrl = "http://apin.meihua.info/file";
    // editor.config.uploadImgUrl = "http://rest.meihua.info/zuul/sys/common/file";
    editor.config.uploadImgUrl = uploadFileApi;
    editor.config.uploadParams = {
      type: 0
    };
    editor.config.uploadParamsVideo = {
      type: 1
    };

    // 自定义上传函数
    editor.config.uploadCustomFn = ({ file, base64, filename, onSuccess, onError, onProgress }) => {
      if (file) {
        this.customRequest({ file, filename, onSuccess, onError, onProgress });
      } else if (base64) {
        this.customBase64Request({ base64, onSuccess, onError });
      }
    }

    // // onchange 事件
    editor.onchange = function () {
      // console.log(this.$txt.html());
      // G.setCookie("latest_content" + self.id, this.$txt.html());
      // localStorage.clear();
      // localStorage.setItem("latest_content" + self.id, this.$txt.html());

      self.setState({
        content: this.$txt.html()
      })
    };

    editor.config.menus = [
      'source',
      '|',
      'head',
      'fontsize',
      'forecolor',
      'bold',
      'italic',
      '|',
      'quote',
      '|',
      'unorderlist',
      'orderlist',
      'alignleft',
      'aligncenter',
      'alignright',
      '|',
      'img',
      'video',
      '|',
      // 'link',
      // 'unlink',
      'undo',
      'redo',
      'fullscreen',
      '|',
      'insertshots',
    ];

    JEditor.fn.insertShotsFn = (e) => {
      this.handleSelectShotsModalVisible(true);
    }


    editor.create();

    // console.log(editor.xhrUploadImg)

    // var arcontent = localStorage.getItem("latest_content" + self.id);
    // if (arcontent) {
    //     editor.$txt.html(arcontent);
    // }
    // editor.$txt.html(this.$el.find('form .article_content').val());
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

  initCompositionDetail() {
    const { compositionStore, resultCompositionDetail } = this.props
    // console.log('resultCompositionDetail',resultCompositionDetail)
    if (resultCompositionDetail) {
      compositionStore.resetCompositionDetail(resultCompositionDetail, 1)
    }
  }

  initSwiper() {
    this.mySwiper = new Swiper('.swiper-container', {
      slidesPerView: 2,
      spaceBetween: 30,
      slidesPerGroup: 2,
      // loop: true,
      // loopFillGroupWithBlank: true,
      navigation: {
        nextEl: '.swiper-button-next',
        prevEl: '.swiper-button-prev',
      },
    })
  }

  initInnerShots = () => {
    const contentEl = document.querySelector('.JEditor-txt')
    if (!contentEl) {
      return
    }
    const innerShotsEls = contentEl.querySelectorAll('.inner-shots-placeholder')
    // console.log(innerShotsEls)
    for (let k in innerShotsEls) {
      const innerShotsEl = innerShotsEls[k]
      if (innerShotsEl.nodeType === 1) {
        const idsStr = innerShotsEl.getAttribute('data-ids')
        if (idsStr && idsStr.trim()) {
          const idsArr = JSON.parse(idsStr)
          this.requestInnerShots(idsArr, (res) => {
            if (res.success) {
              const list = res.data.list || []
              this.appendInnerShots(list, innerShotsEl)
            }
          })
        }
      }
    }
  }

  async requestInnerShots(idsArr, callback) {
    const { compositionStore } = this.props;
    const response = await compositionStore.fetchInnerShots({
      terms: {
        term: {
          compositionIds: idsArr,
        },
        page: 1,
        limit: idsArr.length,
      }
    })
    if (callback) callback(response)
  }

  appendInnerShots(shots, innerShotsEl) {
    const innerShotsString = composition.getInnerShotsString(shots)

    innerShotsEl.innerHTML = innerShotsString

    this.initSwiper();
  }

  insertShotsToEditor = (shots) => {
    const editor = this.editor;
    const idsArr = shots.map(item => item.compositionId);

    const innerShotsString = composition.getInnerShotsString(shots)
    const html = `
    <div class="inner-shots-placeholder" contenteditable="false" data-ids="${JSON.stringify(idsArr)}">
      ${innerShotsString}
    </div>
    `;

    editor.command(null, 'insertHtml', html);

    this.initSwiper();
  }

  handleSelectShotsModalVisible = (flag) => {
    this.setState({ selectShotsModalVisible: !!flag });
  }

  handleSelectShotsConfirm = (values) => {
    // console.log('select ids',values)
    if (values.length === 0) {
      message.error('请选择作品');
      return
    }
    this.requestInnerShots(values, (res) => {
      if (res.success) {
        this.handleSelectShotsModalVisible(false);
        this.insertShotsToEditor(res.data.list || []);
      }
    })
  }





  requestCurrent() {
    const { accountStore } = this.props
    accountStore.fetchGetClientCurrent({})
  }

  async requestComposition() {
    const { compositionStore, query } = this.props
    if (!query.id) {
      return
    }
    // const orgId = utils.getQueryString('orgId')
    const orgId = query.orgId
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const compositionId = query.id
    const params = { compositionId, token, client, op: 1, orgId }
    const response = await compositionStore.fetchComposition(params)
    if (response.success) {
      const data = response.data || {}
      const detail = data.composition || {}
      this.initialDetail(detail)
      this.initInnerShots()
    }
    // compositionStore.fetchComposition(params, (res) => {
    //   if (res.success) {
    //     this.initInnerShots()
    //   }
    // })
  }

  // requestAuthors() {
  //   const { compositionStore } = this.props
  //   compositionStore.fetchAuthors()
  // }
  async requestAuthors() {
    const { compositionStore, query, form } = this.props
    const response = await compositionStore.fetchAuthors()
    const sessionAuthorId = session.get(SESSION_SELECT_AUTHOR_ID)
    // 新增默认选择第一个创作者
    if (response.success && !query.id && !sessionAuthorId) {
      const author = (response.data || [])[0] || {}
      const authorId = author.id
      // form.setFieldsValue({ author: authorId })
      this.setState({ authorId })
    }
  }

  requestClassifications() {
    const { compositionStore } = this.props
    compositionStore.fetchClassifications({})
  }

  initialDetail(detail) {
    const authorId = String(detail.authorId)
    const tags = (detail.tags || []).map(tag => tag.tagName)
    const members = detail.members || []
    const coverUrl = detail.cover
    const brandItem = { id: detail.brandId, chName: detail.brandName }
    // const worksFileList = (toJS(detail.files) || []).sort((a, b) => a.position - b.position).map(item => ({ uid: -(item.id), name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url }));
    const attachFileList = (toJS(detail.attachFiles) || []).map(item => ({ uid: -(item.id), name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url }));
    const content = detail.content
    const nextState = {
      authorId,
      tags,
      members,
      coverUrl,
      brandItem,
      // worksFileList,
      attachFileList,
      content,
    }
    const sessionAuthorId = session.get(SESSION_SELECT_AUTHOR_ID)
    if (sessionAuthorId) {
      nextState.authorId = String(sessionAuthorId)
    }
    if (this.editor) {
      this.editor.$txt.html(content)
    }
    this.setState(nextState)
  }

  initCurrentAuthor() {
    const currAuthor = user.getCookieUser()
    if (currAuthor) {
      const currentAuthorId = currAuthor.author && currAuthor.author.id
      this.setState({ currentAuthorId })
      this.props.form.setFieldsValue({ author: currentAuthorId })
    }
  }

  handleAuthorSelect = (authorId, option) => {
    const authorItem = option.props.author || {}
    this.setState({ authorId, authorItem })
    session.set(SESSION_SELECT_AUTHOR_ID, authorId)
  }

  checkFormDataChange(values) {
    const { prevFormValues } = this.state;
    let isChange = false
    // if (values.author !== prevFormValues.author) {
    //   isChange = true
    // }
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
    const { form, query } = this.props;
    const { prevFormValues } = this.state;
    const values = form.getFieldsValue();
    values.status = CompositionStatus.DRAFT;
    // console.log('prev',prevFormValues)
    // console.log('value',values)
    this.setState({ submitStatus: 'save' })

    if (this.checkFormDataChange(values)) {
      this.simpleAutoSave(values, (res) => {
        // console.log(res)
        if (res.success) {
          this.setState({ prevFormValues: { ...values } })
          message.success('保存成功');
          if (!query.id) {
            // location.href = `/article/edit/${res.data}`
            Router.pushRoute(`/article/edit/${res.data}`)
          }
        }
      });
    }
  }


  handleSubmit = (e) => {
    const { form, query } = this.props
    const { isAgree, authorId } = this.state
    e.preventDefault()
    if (!isAgree) {
      message.error('请勾选并阅读发布协议')
      return
    } else {

      form.validateFieldsAndScroll((err, values) => {
        if (!err) {
          const status = CompositionStatus.AUDITING
          values.status = status
          const params = this.arragementSubmitFields(values)
          this.setState({ submitging: true })
          this.submitSave(params, (res) => {
            this.setState({ submitging: false })
            if (res.success) {
              const compositionId = query.id || res.data
              const orgId = authorId
              Router.pushRoute(`/composition/success/${CompositionTypes.ARTICLE}-${compositionId}-${orgId}`)
            } else {
              message.error(res.data.msg)
            }
          })
        }
      })
    }

  }

  handleSave = e => {
    const { form, query, authors } = this.props;
    e.preventDefault();
    const values = form.getFieldsValue();
    values.status = CompositionStatus.DRAFT;
    // console.log('save value',values)
    this.setState({ submitStatus: 'save' });
    this.simpleSave(values, (res) => {
      if (res.success) {
        this.setState({ prevFormValues: { ...values } })
        // console.log('query.id',query.id)
        message.success('保存成功');
        const compositionId = query.id || res.data
        const orgId = values.author
        const urlParam = {
          ...query,
          orgId,
        }
        delete urlParam.id
        Router.pushRoute(`/article/edit/${compositionId}?${qs.stringify(urlParam)}`)
        // if (!query.id) {
        //   // location.href = `/article/edit/${res.data}`
        //   const author = authors.find(item => item.id === values.author)
        //   const orgParam = author.type === AuthorType.PERSONAL ? '' : '?orgId=' + values.author
        //   Router.pushRoute(`/article/edit/${res.data}${orgParam}`)
        // }
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
        this.setState({ toPreview: false });
        if (res.success) {
          const compositionId = query.id || res.data
          // console.log('preview btn ', compositionId)
          compositionStore.fetchCompositionPreviewCode({ compositionId }, (res) => {
            if (res.success) {
              window.open(`/article/preview/${res.data}`)
              const compositionId = query.id || res.data
              const orgId = values.author
              const urlParam = {
                ...query,
                orgId,
              }
              delete urlParam.id
              Router.pushRoute(`/article/edit/${compositionId}?${qs.stringify(urlParam)}`)
              // if (!query.id) {
              //   // location.href = `/article/edit/${compositionId}`
              //   const author = authors.find(item => item.id === values.author)
              //   const orgParam = author.type === AuthorType.PERSONAL ? '' : '?orgId=' + values.author
              //   Router.pushRoute(`/article/edit/${compositionId}${orgParam}`)
              // }
            }
          })
        } else {
          message.error(res.data.msg)
        }
      });
    });

  };

  simpleAutoSave(values, callback) {
    const { form } = this.props;
    let isOk = true
    let setFields = {}
    if (!values.author) {
      isOk = false;
    }
    if (!values.title || values.title.trim() === '') {
      isOk = false
    }

    if (isOk) {
      const params = this.arragementSubmitFields(values);
      this.submitSave(params, callback);
    }
  }

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
        errors: [new Error('标题不可为空')],
      }
      if (isOk) {
        message.error('请填写标题')
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
    const { authors } = this.props
    const { toPublish, toPreview, attachFileList, members, tags, compositionId, authorItem, brandItem, coverUrl } = this.state
    const authorityType = values.authType ? DownloadAuthTypes.GENERAL : DownloadAuthTypes.VIP
    const status = toPublish ? CompositionStatus.AUDITING : values.status || CompositionStatus.DRAFT
    // const attachment = values.attachment || {} 
    const filterAttachFiles = (attachFileList || []).filter(item => item.status === 'done')
    const attachFiles = filterAttachFiles.map(item => {
      let url = item.url || item.response.data.url
      return { type: UploadFileTypes.ATTACHMENT, title: item.name, url }
    })
    const worksFiles = values.worksFiles || {}
    const filterWorksFiles = (worksFiles.fileList || []).filter(item => item.status === 'done')
    const files = filterWorksFiles.map(item => {
      const url = item.url || item.response.data.url
      return { type: UploadFileTypes.WORKS_IMAGE, title: item.name, url }
    })
    const memberArr = members.map(item => ({ email: item.email, authorId: item.authorId }))
    // const cover = values.cover.file.url || values.cover.file.response.data.url 
    // const cover = values.cover ? (values.cover.file.url || values.cover.file.response.data.url) : '';
    const cover = coverUrl

    const author = authors.find(item => item.id === values.author)

    const gmtFirstRelease = values.gmtFirstRelease ? values.gmtFirstRelease.valueOf() : undefined


    let content = this.editor ? this.editor.$txt.html() : this.state.content;

    // ==========清除插入作品html内容==========
    let wrapNode = document.createElement('div');
    wrapNode.innerHTML = content;
    const $wrap = $(wrapNode);
    $wrap.find('.inner-shots-placeholder').empty();
    content = $wrap.html();
    // ====================================


    const params = {
      type: CompositionTypes.ARTICLE,
      title: values.title,
      cover,
      summary: values.summary,
      content,
      authority: JSON.stringify({ download_limit_type: authorityType, download_limit_setting: 1 }),
      status,
      classificationId: values.classification,
      categoryId: values.category,
      formId: values.form,
      brandId: brandItem.id,
      productName: values.productName,
      gmtFirstRelease,
    }

    if (files.length > 0) {
      params.filesStr = JSON.stringify(files)
    }

    if (attachFiles.length > 0) {
      params.attachFilesStr = JSON.stringify(attachFiles)
    }
    if (memberArr.length > 0) {
      params.membersStr = JSON.stringify(memberArr)
    }
    if (tags.length > 0) {
      params.tagsStr = JSON.stringify(tags)
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

    this.setState({ toPublish: false, toPreview: false })

    return params
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


  customBase64Request({ base64, onError, onSuccess }) {
    const { qiniuToken } = this.props;
    const token = qiniuToken;
    helper.qiniuPutb64({ base64, token }).then((res) => {
      const ret = {
        data: {
          url: `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`,
        }
      }
      onSuccess && onSuccess(ret)
    }).catch((e) => {
      onError && onError(e)
    })
  }

  handleTitleChange = (e) => {
    let title = e.target.value.trim()
    const length = utils.getStringLength(title)
    let titleCurrent = Math.ceil(length / 2)

    this.setState({ titleCurrent })
  }

  handleSummaryChange = (e) => {
    let summary = e.target.value.trim()
    const length = utils.getStringLength(summary)
    let summaryCurrent = Math.ceil(length / 2)
    this.setState({ summaryCurrent })
  }

  handleBeforeUpload = () => {

  }

  handleCoverChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true })
      return
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const coverUrl = info.file.response.data.url;
      this.setState({ coverUrl, loading: false })

      // getBase64(info.file.originFileObj, coverUrl => this.setState({
      //   coverUrl,
      //   loading: false,
      // })) 
    }
  }

  handleWorksChange = (info) => {
    this.setState({ worksFileList: info.fileList })
  }

  handleBrandSelect = (value, option) => {
    this.setState({ brandItem: option.props.item })
  }

  handleBrandSearch = (keywords) => {
    const { compositionStore } = this.props
    this.brandTimer && clearTimeout(this.brandTimer)
    if (keywords.trim().length === 0) {
      compositionStore.setBrandSuggestion([])
      this.setState({ brandItem: {} })
      return
    }

    this.brandTimer = setTimeout(() => {
      compositionStore.fetchBrandSuggestion({ keywords })
    }, 500)
  }


  handleBrandFocus = () => {

  }

  handleAgreeChange = e => {
    const { isAgree } = this.state
    this.setState({ isAgree: !isAgree })
  }


  handleInviteMember = () => {
    const { memberText, members } = this.state
    if (!utils.isEmail(memberText)) {
      message.info('邀请人邮箱格式不正确')
      return
    }
    if (members.some(item => item.email.trim() === memberText.trim())) {
      message.info('已经存在邀请人列表中')
      return
    }

    this.setState({ members: [...members, { email: memberText.trim() }] })
  }

  handleRemoveMember = (member, e) => {
    e.preventDefault()
    const { members } = this.state
    const filterMembers = members.filter(m => m.email !== member.email)
    this.setState({ members: filterMembers })
  }

  handleTagChange = (tags) => {
    this.setState({ tags })
  }

  handleMemberSearch = (email) => {
    const { compositionStore } = this.props
    this.memberTimer && clearTimeout(this.memberTimer)
    if (email.trim().length === 0) {
      compositionStore.setMemberSuggestion([])
      return
    }
    this.memberTimer = setTimeout(() => {
      compositionStore.fetchMemberSuggestion({ email })
    }, 500)
  }

  handleMemberSelect = (memberText, option) => {
    const memberItem = option.props.item;
    this.setState({ memberText, memberItem });

  }

  handleImportModal = (status) => {
    this.setState({ importModal: !!status })
  }

  handleSubmitImport = (url) => {
    // if (!utils.isDomain(url)) {
    //   message.error('请输入正确的网址')
    //   return
    // }
    const { compositionStore, form } = this.props
    this.setState({ importLoading: true })
    compositionStore.fetchCompositionByUrl({ url: encodeURI(url) }, (data) => {
      this.setState({ importLoading: false })
      if (!data) {
        message.error('无法获取原地址信息请重试或者手动填写')
        return
      }
      // const editorStatus = BraftEditor.createEditorState(data.content)
      form.setFieldsValue({
        title: data.title,
        summary: data.summary,
        // content: editorStatus,
      })
      const content = data.content
      this.editor.$txt.html(content)

      this.setState({ content, importModal: false })
      message.success('导入成功')
    }).catch(err => {
      this.setState({ importLoading: false })
    })
  }


  handleCoverCropVisible = (flag, url) => {
    this.setState({ showCoverCropModal: !!flag, tmpCoverUrl: url || '' })
  }

  handleCoverCropConfirm = (base64) => {
    // const { globalStore } = this.props;
    // const token = globalStore.qiniuToken;
    // this.setState({coverUploading: true});
    // helper.qiniuPutb64({base64, token}).then((res) => {
    //   // console.log(res)
    //   const coverUrl = `${config.RESOURCE_QINIU_DOMAIN}/${res.hash}`
    //   // console.log(coverUrl)
    //   this.setState({coverUrl, showCoverCropModal: false, coverUploading: false})
    // }).catch((e) => {
    //   this.setState({coverUploading: false});
    //   message.error('上传失败：', e)
    // })

    this.customBase64Request({
      base64,
      onSuccess: (res) => {
        // const coverUrl = `${RESOURCE_QINIU_DOMAIN}/${res.hash}`
        const coverUrl = res.data.url;
        this.setState({ coverUrl, showCoverCropModal: false, coverUploading: false })
      },
      onError: (e) => {
        this.setState({ coverUploading: false });
        message.error('上传失败：', e)
      }
    })
  }

  getAttachFileList(attachFiles) {
    const attachFileList = attachFiles.map(file => ({
      uid: -(file.id),
      name: file.title,
      fileType: file.type,
      status: 'done',
      url: file.url,
    }))
    return attachFileList
  }

  handleAttachmentChange = (attachFiles) => {
    this.setState({ attachFileList: attachFiles.fileList })
  }

  memberFilterOption = (inputValue, option) => {
    return !!option.key && option.key !== 'null' && option.key !== 'undefined'
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
    const labelText = `${item.chName}（${item.spellCode}）`
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
      classifications,
      categories,
      forms,
      memberSuggestion,
      brandSuggestion,
      currentUser,
    } = this.props

    const { getFieldDecorator } = form

    const {
      submitging,
      authorId,
      members,
      coverUrl,
      tags,
      isAgree,
      titleMax,
      summaryMax,
      titleCurrent,
      summaryCurrent,
      editorStatus,
      importModal,
      importLoading,
      attachFileList,
      currentAuthorId,
      coverUploading,
      showCoverCropModal,
      tmpCoverUrl,
      selectShotsModalVisible,
    } = this.state

    const isEdit = !!query.id

    const memberOptions = memberSuggestion.map(this.renderMemberOption)
    const brandOptions = brandSuggestion.map(this.renderBrandOption)

    const downloadAuthStr = `{"download_limit_type":${DownloadAuthTypes.VIP},"download_limit_setting":${DownloadAuthStatus.OPENED}}`
    const downloadAuth = JSON.parse(detail.authority || downloadAuthStr)

    // const attachFileList = this.getAttachFileList(detail.attachFiles || [])

    const defaultCoverFiles = coverUrl ? { file: { uid: -(new Date().getTime()), status: 'done', url: coverUrl } } : null;

    const creationUrl = `/teams/${authorId}/creation?type=article&status=1`
    const statisticsUrl = `/teams/${authorId}/statistics?type=2`

    const uploadButton = (
      <div>
        <Icon className="cover-upload-icon" type={this.state.loading ? 'loading' : 'cloud-upload'} />
        <div className="cover-upload-text">上传封面</div>
        <div className="cover-upload-intro">PNG,JPG,GIF不得超过10MB</div>
      </div>
    )

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


    return (
      <div className='form-container'>
        <div className="shots-publish-menu-box" style={{top: 0}}>
          <div className="publish-menu-item active">
            <a className="btn-normal"><CustomIcon name="upload" /> <span className="text">发布文章</span></a>
            <Popover
              placement="right"
              content={<span className="text">发布作品</span>}
            >
              <a className="btn-mini"><CustomIcon name="upload" /></a>
            </Popover>
          </div>
          <div className="publish-menu-item">
            <a className="btn-normal" href={creationUrl} target="_blank"><CustomIcon name="management" /> <span className="text">文章管理</span></a>
            <Popover
              placement="right"
              content={<span className="text">文章管理</span>}
            >
              <a className="btn-mini" href={creationUrl} target="_blank"><CustomIcon name="management" /></a>
            </Popover>
          </div>
          <div className="publish-menu-item">
            <a className="btn-normal" href={statisticsUrl} target="_blank"><CustomIcon name="statistics" /> <span className="text">文章统计</span></a>
            <Popover
              placement="right"
              content={<span className="text">文章统计</span>}
            >
              <a className="btn-mini" href={statisticsUrl} target="_blank"><CustomIcon name="statistics" /></a>
            </Popover>
          </div>
        </div>
        <Form onSubmit={this.handleSubmit} hideRequiredMark={false}>
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label="创作者">
                {getFieldDecorator('author', {
                  rules: [
                    {
                      required: true,
                      message: '请输选择创作者',
                    },
                  ],
                  initialValue: authorId ? String(authorId) : undefined,
                })(<Select
                  suffixIcon={<Icon type="caret-down" />}
                  showArrow
                  className="author-select"
                  placeholder="请选择创作者"
                  //disabled={isEdit}
                  onSelect={this.handleAuthorSelect}
                >{
                    authors.map((item, i) => {
                      const currentAuthorEdition = item.edition || { editionType: EditionType.FREE }
                      const currentAuthorIsFree = currentAuthorEdition.editionType === EditionType.FREE
                      return (
                        <Option key={i} value={item.id} author={item} className="select-author-option">
                          <div className="select-author-item">
                            <div className="item-avatar">
                              <Avatar icon="user" src={item.avatar} size={40} />
                            </div>
                            <div className="item-info">
                              <div className="nick">
                                <span>{item.nickname}</span>
                                {/* <AuthorAuthenticationIcon hide={currentAuthorIsFree} style={{marginLeft: '6px'}} /> */}
                                {/* <AuthorEditionTag editionType={currentAuthorEdition.editionType} mini style={{marginLeft: '6px'}} /> */}
                              </div>
                              <div className="domain"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType} /> {item.name}</div>
                            </div>
                          </div>
                        </Option>
                      )
                    })
                  }
                </Select>)}
              </FormItem>
            </Col>
            <Col span={1}></Col>
            <Col span={17}>
              <FormItem {...formItemLayout} label="">
                <div className="article-import">
                  <span onClick={e => this.handleImportModal(true)} ><Icon type="import" /> 导入外部文章</span>
                </div>
              </FormItem>
            </Col>
          </Row>
          <Row>
            {/* Left */}
            <Col span={6}>
              <FormItem {...formItemLayout} label="封面">
                {getFieldDecorator('cover', {
                  rules: [
                    {
                      required: true,
                      message: '请上传封面',
                    },
                  ],
                  initialValue: defaultCoverFiles,
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
                    <img src={coverUrl + '?imageMogr2/thumbnail/!504x360r/gravity/center/crop/504x360'} />
                    <span className="cover-edit-text">更换封面</span>
                  </span> : uploadButton}
                </Upload>)}
                <div className="field-desc">尺寸504*360 px，支持png、gif、jpg图片</div>
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                  分类
                  {' '}
                  <Tooltip title="分类说明">
                    <a href="/rule/article" target="_blank"><Icon type="question-circle" /></a>
                  </Tooltip>
                </span>
              }>
                {getFieldDecorator('classification', {
                  rules: [
                    {
                      required: true,
                      message: '请输入分类',
                    },
                  ],
                  initialValue: detail.classificationId || undefined,
                })(<Select
                  className="select-left"
                  placeholder="请选择分类"
                >
                  {classifications.map(c => (
                    <Option key={c.id} value={c.id}>{c.name}</Option>
                  ))}
                </Select>)}
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                  品类
                    {' '}
                  <Tooltip title="品类说明">
                    <a href="/rule/article" target="_blank"><Icon type="question-circle" /></a>
                  </Tooltip>
                </span>
              }>
                {getFieldDecorator('category', {
                  rules: [
                  ],
                  initialValue: detail.categoryId || 0,
                })(<Select
                  className="select-left"
                  placeholder="请选择品类"
                >
                  <Option key={0} value={0}>无</Option>
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
                    <a href="/rule/article" target="_blank"><Icon type="question-circle" /></a>
                  </Tooltip>
                </span>
              }>
                {getFieldDecorator('form', {
                  rules: [
                  ],
                  initialValue: detail.formId || 0,
                })(<Select
                  className="select-left"
                  placeholder="请选择形式"
                >
                  <Option key={0} value={0}>无</Option>
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
            <Col span={17}>
              <FormItem {...formItemLayout} label="标题" className="has-length-tips">
                {getFieldDecorator('title', {
                  rules: [
                    {
                      required: true,
                      message: '请输入文章标题',
                    },
                  ],
                  initialValue: detail.title || '',
                })(<Input onChange={this.handleTitleChange} />)}
                <span className={classnames('length-tips', { error: titleCurrent >= titleMax })}>{titleCurrent}/{titleMax}</span>
                <a className="publish-know" href="/rule/article" target="_brank">梅花网文章收录规范</a>
              </FormItem>

              <FormItem {...formItemLayout} label="摘要" className="has-length-tips">
                {getFieldDecorator('summary', {
                  rules: [
                    {
                      required: true,
                      message: '请输入摘要',
                    },
                  ],
                  initialValue: detail.summary || '',
                })(
                  <TextArea
                    style={{ minHeight: 32 }}
                    rows={4}
                    onChange={this.handleSummaryChange}
                  />
                )}
                <span className={classnames('length-tips', { error: summaryCurrent >= summaryMax })}>{summaryCurrent}/{summaryMax}</span>
              </FormItem>
              <FormItem {...formItemLayout} label="正文">
                {getFieldDecorator('content', {
                  validateTrigger: 'onBlur',
                  rules: [
                    {
                      required: true,
                      validator: (_, value, callback) => {
                        const html = this.editor.$txt.html()
                        const mediaReg = /img|video|iframe/
                        // console.log(mediaReg.test(html))
                        // console.log(html)
                        if (this.editor.$txt.text().trim() === '' && !mediaReg.test(html)) {
                          callback('请输入正文')
                        } else {
                          callback()
                        }
                      },
                    },
                  ],
                })(
                  <div ref={el => this.JEditorRef = el} style={{ textAlign: 'left', height: '500px' }}></div>
                )}
              </FormItem>

              <FormItem {...formItemLayout} label="附件">
                {getFieldDecorator('attachment', {
                  rules: [
                  ],
                  initialValue: { fileList: attachFileList }
                })(
                  <Upload
                    {...this.attachUploadProps}
                    fileList={attachFileList}
                    className="attach-file"
                    customRequest={this.customRequest}
                    onChange={this.handleAttachmentChange}
                  >
                    <Button>
                      <Icon type="paper-clip" /> 点击上传附件（如：PDF等）
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
                    <Col span={22} style={{paddingRight: '30px'}}>
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
                  <FormItem {...formItemLayout} label="品牌" style={{ paddingRight: '20px' }}>
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
                        placeholder="请输入关键字，并选择对应品牌"
                        optionLabelProp="text"
                      >
                      </AutoComplete>
                    )}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem {...formItemLayout} label="产品" style={{ paddingLeft: '10px', paddingRight: '10px' }}>
                    {getFieldDecorator('productName', {
                      rules: [
                      ],
                      initialValue: detail.productName,
                    })(<Input placeholder="请输入具体产品，例如iPhone 8" />)}
                  </FormItem>
                </Col>
                <Col span={8}>
                  <FormItem {...formItemLayout} label="发表月度" style={{ paddingLeft: '20px' }}>
                    {getFieldDecorator('gmtFirstRelease', {
                      rules: [
                      ],
                      initialValue: detail.gmtFirstRelease ? moment(moment(detail.gmtFirstRelease).format('YYYY-MM'), monthFormat) : null,
                    })(
                      <MonthPicker
                        format={monthFormat}
                        placeholder="选择文章出街的年份-月度"
                        style={{ width: '100%' }}
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>

              <FormItem {...formItemLayout}>
                <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意 <a href="/agreement/article" className="copyright-link" target="_blank">《梅花网文章发布协议》</a></Checkbox>
              </FormItem>
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }} className="form-item-submit">
                <Button loading={saveLoading} ref={el => this.submitRef = el} onClick={this.handleSave}>保存至草稿</Button>
                <span className="publish-btns">
                  <Button onClick={this.handlePreview} style={{ marginLeft: 8 }}>预览</Button>
                  <Button htmlType="submit" type="primary" style={{ marginLeft: 8 }} loading={submitging} >发布</Button>
                </span>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <ImportModal
          loading={importLoading}
          visible={importModal}
          onCancel={e => this.handleImportModal(false)}
          onOk={this.handleSubmitImport}
        />
        {showCoverCropModal &&
          <CoverCrop
            loading={coverUploading}
            visible={showCoverCropModal}
            url={tmpCoverUrl}
            onCancel={e => this.handleCoverCropVisible(false)}
            onConfirm={this.handleCoverCropConfirm}
          />}
        {selectShotsModalVisible && <SelectShotsListModal
          visible={selectShotsModalVisible}
          onCancel={e => this.handleSelectShotsModalVisible(false)}
          onConfirm={this.handleSelectShotsConfirm}
        />}
      </div>
    )
  }
}