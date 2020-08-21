import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import BraftEditor from 'braft-editor'
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
} from 'antd'
import 'braft-editor/dist/index.css'
import { Router } from '@routes'
import EditableTagGroup from '@components/common/EditableTagGroup'
import ImportModal from './ImportModal'

import { 
  DownloadAuthTypes, 
  DownloadAuthStatus, 
  CompositionStatus, 
  CompositionTypes, 
  AuthorType, 
  UploadFileTypes,
} from '@base/enums'
import { user } from '@base/system'
import { config, utils } from '@utils'
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



function getBase64(img, callback) {
  const reader = new FileReader() 
  reader.addEventListener('load', () => callback(reader.result)) 
  reader.readAsDataURL(img) 
}

function beforeUpload(file) {
  // console.log(file)
  // const isJPG = file.type === 'image/jpeg' 
  message.destroy()
  const isPic = ['image/jpeg','image/jpg','image/png','image/gif'].some(v => v === file.type.toLowerCase())
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
  const { compositionStore, accountStore } = stores.store
  return {
      compositionStore,
      accountStore,
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
    compositionId: '',

    coverUrl: '',
    members: [],
    tags: [],
    brandItem: {},
    memberText: '',

    editorStatus: BraftEditor.createEditorState(null),

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
      // this.initCompositionDetail()
      this.requestCurrent()
      this.requestComposition()
      this.requestAuthors()
      this.requestClassifications()
      this.initCurrentAuthor()
      // this.initAutoSave()

  }


  componentWillUnmount() {
    this.chearTimers();
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
      this.setState({members: nextDetail.members || []}) 
    }
    if (nextDetail.cover !== detail.cover) {
      this.setState({coverUrl: nextDetail.cover}) 
    }
    if (nextDetail.brandId !== detail.brandId) {
      this.setState({brandItem: {id: nextDetail.brandId, chName: nextDetail.brandName}}) 
    }
    if (nextDetail.content !== detail.content) {
      const editorStatus = BraftEditor.createEditorState(nextDetail.content);
      this.setState({content: nextDetail.content, editorStatus});
      this.props.form.setFieldsValue({
        content: editorStatus,
      });
    }
    if (!isEqual(nextDetail.attachFiles, detail.attachFiles)) {
      const attachFileList = (nextDetail.attachFiles || []).map(item => ({uid: -(item.id),name: item.title, fileType: item.type, position: item.position, status: 'done', url: item.url}));
      this.setState({attachFileList});
    }
    // if (!isEqual(nextDetail.currentUser, detail.currentUser)) {
    //   console.log(nextDetail.currentUser)
    //   const currentUser = nextDetail.currentUser || {}
    //   const currentAuthor = currentUser.author
    //   if (currentAuthor) {
    //     const currentAuthorId = currentAuthor.id
    //     this.setState({currentAuthorId})
    //     this.props.form.setFieldsValue({author: currentAuthorId})
    //   }
    // }
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
    const client = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const compositionId = query.id
    const params = { compositionId, token, client, op: 1}
    compositionStore.fetchComposition(params)
  }

  requestAuthors() {
      const { compositionStore } = this.props
      compositionStore.fetchAuthors()
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
    this.setState({submitStatus: 'save'})
    
    if (this.checkFormDataChange(values)) {
      this.simpleAutoSave(values, (res) => {
        // console.log(res)
        if (res.success) {
          this.setState({prevFormValues: {...values}})
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
    e.preventDefault() 
    form.validateFieldsAndScroll((err, values) => {
      if (!err) {
        const status = CompositionStatus.AUDITING
        values.status = status
        const params = this.arragementSubmitFields(values) 
        this.submitSave(params, (res) => {
          if (res.success) {
            const compositionId = query.id || res.data
            // location.href = `/composition/success/${CompositionTypes.ARTICLE}-${compositionId}`
            Router.pushRoute(`/composition/success/${CompositionTypes.ARTICLE}-${compositionId}`)
          } else {
            message.error(res.data.msg)
          }
        }) 
      }
    })
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
        // console.log('query.id',query.id)
        message.success('保存成功');
        if (!query.id) {
          // location.href = `/article/edit/${res.data}`
          Router.pushRoute(`/article/edit/${res.data}`)
        } 
      } else {
        message.error(res.data.msg);
      }
    });
  }

  handlePreview = (e) => {
    this.setState({ toPreview: true }, () => {
      const { form, query } = this.props;
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
          window.open(`/article/preview/${compositionId}`)
          if (!query.id) {
            // location.href = `/article/edit/${compositionId}`
            Router.pushRoute(`/article/edit/${compositionId}`)
          } 
        }else {
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
    }
    if (!values.title || values.title.trim() === '') {
      isOk = false
      setFields.title = {
        value: '',
        errors: [new Error('作品标题不可为空')],
      }
    }

    if (!isOk) {
      message.error('标题不可空')
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
      return {type: UploadFileTypes.ATTACHMENT, title: item.name, url }
    }) 
    const worksFiles = values.worksFiles || {} 
    const filterWorksFiles = (worksFiles.fileList || []).filter(item => item.status === 'done') 
    const files = filterWorksFiles.map(item => {
      const url = item.url || item.response.data.url 
      return {type: UploadFileTypes.WORKS_IMAGE, title: item.name, url}
    }) 
    const memberArr = members.map(item => ({email: item.email, authorId: item.authorId})) 
    // const cover = values.cover.file.url || values.cover.file.response.data.url 
    // const cover = values.cover ? (values.cover.file.url || values.cover.file.response.data.url) : '';
    const cover = coverUrl

    const author = authors.find(item => item.id === values.author)
    
    const gmtFirstRelease = values.gmtFirstRelease ? values.gmtFirstRelease.valueOf() : undefined
    
    
    const params = {
      type: CompositionTypes.ARTICLE,
      title: values.title,
      cover,
      summary: values.summary,
      content: values.content.toHTML(),
      authority: JSON.stringify({download_limit_type: authorityType, download_limit_setting: 1}),
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

    if (author && author.type === AuthorType.INSTITUTION) {
        params.orgId = author.id
        params.orgName = author.name
    }

    if (toPreview) {
      params.toPreview = toPreview
    }

    this.setState({toPublish: false, toPreview: false})
    
    return params 
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

  handleCoverChange = (info) => {
    if (info.file.status === 'uploading') {
      this.setState({ loading: true }) 
      return 
    }
    if (info.file.status === 'done') {
      // Get this url from response in real world.
      const coverUrl = info.file.response.data.url;
      this.setState({coverUrl, loading: false}) 

      // getBase64(info.file.originFileObj, coverUrl => this.setState({
      //   coverUrl,
      //   loading: false,
      // })) 
    }
  }

  handleWorksChange = (info) => {
    this.setState({worksFileList: info.fileList}) 
  }

  handleBrandSelect = (value, option) => {
    this.setState({brandItem: option.props.item})
  }

  handleBrandSearch = (keywords) => {
    const { compositionStore } = this.props 
    this.brandTimer && clearTimeout(this.brandTimer) 
    if (keywords.trim().length === 0) {
      compositionStore.setBrandSuggestion([])
      this.setState({brandItem: {}})
      return 
    } 

    this.brandTimer = setTimeout(() => {
      compositionStore.fetchBrandSuggestion({keywords})
    }, 500) 
  }


  handleBrandFocus = () => {

  }

  handleAgreeChange = e => {
    const { isAgree } = this.state
    this.setState({isAgree: !isAgree})
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

    this.setState({members: [...members, {email: memberText.trim()}]}) 
  }

  handleRemoveMember = (member, e) => {
    e.preventDefault() 
    const { members } = this.state 
    const filterMembers = members.filter(m => m.email !== member.email) 
    this.setState({ members: filterMembers }) 
  }

  handleTagChange = (tags) => {
    this.setState({tags}) 
  }

  handleMemberSearch = (email) => {
    const { compositionStore } = this.props
    this.memberTimer && clearTimeout(this.memberTimer) 
    if (email.trim().length === 0) {
        compositionStore.setMemberSuggestion([])
      return 
    } 
    this.memberTimer = setTimeout(() => {
      compositionStore.fetchMemberSuggestion({email})
    }, 500) 
  }

  handleMemberSelect = (memberText, option) => {
    const memberItem = option.props.item;
    this.setState({memberText, memberItem});

  }

  handleImportModal = (status) => {
    this.setState({importModal: !!status})
  }

  handleSubmitImport = (url) => {
    if (!utils.isDomain(url)) {
      message.error('请输入正确的网址')
      return
    }
    const { compositionStore, form } = this.props
    compositionStore.fetchCompositionByUrl({url}, (data) => {
      if (!data) {
        message.error('无法获取原地址信息请重试或者手动填写')
        return
      }
      const editorStatus = BraftEditor.createEditorState(data.content)
        form.setFieldsValue({
          title: data.title,
          summary: data.summary,
          content: editorStatus,
        })

        this.setState({editorStatus, importModal: false})
        message.success('导入成功')
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
    this.setState({attachFileList: attachFiles.fileList})
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
          <span className="global-search-item-email">{item.email}</span>
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
    attachFileList,
    currentAuthorId,
  } = this.state

  const memberOptions = memberSuggestion.map(this.renderMemberOption)
  const brandOptions = brandSuggestion.map(this.renderBrandOption)

  const downloadAuthStr = `{"download_limit_type":${DownloadAuthTypes.VIP},"download_limit_setting":${DownloadAuthStatus.OPENED}}` 
  const downloadAuth = JSON.parse(detail.authority || downloadAuthStr) 

  // const attachFileList = this.getAttachFileList(detail.attachFiles || [])

  const defaultCoverFiles = coverUrl ? {file:{uid: -(new Date().getTime()), status: 'done', url: coverUrl}} : null;

  const uploadButton = (
    <div>
      <Icon className="cover-upload-icon" type={this.state.loading ? 'loading' : 'cloud-upload'} />
      <div className="cover-upload-text">上传封面</div>
      <div className="cover-upload-intro">PNG,JPG,GIF不得超过10MB</div>
    </div>
  ) 

  // const currentAuthor = currentUser.author || {}
  // const currentAuthorId = currentAuthor.id

  const submitting = false

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
        <Form onSubmit={this.handleSubmit} hideRequiredMark={false}>
          <Row>
            <Col span={6}>
              <FormItem {...formItemLayout} label="">
                {getFieldDecorator('author', {
                  rules: [
                  {
                    required: true,
                    message: '请输选择创作者',
                  },
                  ],
                  initialValue: detail.authorId || currentAuthorId,
                })(<Select
                    suffixIcon={<Icon type="caret-down" />}
                    showArrow
                    className="author-select"
                  >{
                    authors.map(item => (
                        <Option key={item.id} value={item.id} className="select-author-option">
                          <div className="select-author-item">
                            <div className="item-avatar">
                              <Avatar icon="user" src={item.avatar} size={40} />
                            </div>
                            <div className="item-info">
                              <div className="nick">{item.nickname} {item.type !== AuthorType.INSTITUTION && <Tag color="#000">机构</Tag>}</div>
                              <div className="domain">meihua.info/author/{item.code}</div>
                            </div>
                          </div>
                        </Option>
                    ))
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
                    onChange={this.handleCoverChange}
                  >
                    {/* {coverUrl ? <span className="cover-image" style={{backgroundImage: `url(${coverUrl})`}}></span> : uploadButton} */}
                    {coverUrl ? <span className="cover-image"><img src={coverUrl + '?imageView2/1/w/252/h/180'}/></span> : uploadButton}
                  </Upload>)}
                  <div className="field-desc">尺寸252*180 px，支持png、gif、jpg图片</div>
              </FormItem>
              <FormItem {...formItemLayout} label={
                <span>
                  分类
                  {' '}
                  <Tooltip title="分类说明">
                      <a href="/rule" target="_blank"><Icon type="question-circle" /></a>
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
                    initialValue: detail.classificationId || '',
                  })(<Select>
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
                      <a href="/rule" target="_blank"><Icon type="question-circle" /></a>
                    </Tooltip>
                  </span>
                }>
                  {getFieldDecorator('category', {
                    rules: [
                    ],
                    initialValue: detail.categoryId || 0,
                  })(<Select>
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
                      <a href="/rule" target="_blank"><Icon type="question-circle" /></a>
                    </Tooltip>
                  </span>
                }>
                  {getFieldDecorator('form', {
                    rules: [
                    ],
                    initialValue: detail.formId || 0,
                  })(<Select>
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
                <span className={classnames('length-tips', {error: titleCurrent >= titleMax})}>{titleCurrent}/{titleMax}</span>
                <a className="publish-know" href="/rule" target="_brank">梅花网作品库收录规范和编辑规范</a>
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
                <span className={classnames('length-tips', {error: summaryCurrent >= summaryMax})}>{summaryCurrent}/{summaryMax}</span>
              </FormItem>
                <FormItem {...formItemLayout} label="正文">
                  {getFieldDecorator('content', {
                    validateTrigger: 'onBlur',
                    rules: [
                      {
                        required: true,
                        validator: (_, value, callback) => {
                          if (value.isEmpty()) {
                            callback('请输入正文')
                          } else {
                            callback()
                          }
                        },
                      },
                    ],
                    initialValue: editorStatus,
                  })(
                      <BraftEditor
                        className="mh-braft-editor"
                        controls={controls}
                        media={{
                          uploadFn: utils.braftEditorUploadFn,
                          externals: {
                            image: false,
                            audio: false,
                            video: true,
                            embed: true,
                          },
                          pasteImage: true,
                        }}
                        placeholder="请输入正文"
                        style={{border: '1px solid #d9d9d9', borderRadius: '4px'}}
                      />
                  )}
              </FormItem>

              <FormItem {...formItemLayout} label="附件">
                {getFieldDecorator('attachment', {
                  rules: [
                  ],
                  initialValue: {fileList: attachFileList}
                })(
                  <Upload 
                    {...this.attachUploadProps} 
                    fileList={attachFileList}
                    className="attach-file"
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
                        placeholder="请输入服务客户名称或品牌"
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
                        placeholder="选择发表月度" 
                        style={{width: '100%'}} 
                      />
                    )}
                  </FormItem>
                </Col>
              </Row>

              <FormItem {...formItemLayout}>
                <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意 <a href="/agreement" className="copyright-link" target="_blank">《梅花网作品库发布协议》</a></Checkbox>
              </FormItem>
              <FormItem {...submitFormLayout} style={{ marginTop: 32 }} className="form-item-submit">
                <Button loading={submitting} ref={el => this.submitRef = el} onClick={this.handleSave}>保存至草稿</Button>
                <span className="publish-btns">
                  <Button onClick={this.handlePreview} style={{ marginLeft: 8 }}>预览</Button>
                  <Button htmlType="submit" className="themes" style={{ marginLeft: 8 }} disabled={!isAgree}>发布</Button>
                </span>
              </FormItem>
            </Col>
          </Row>
        </Form>
        <ImportModal
          visible={importModal}
          onCancel={e => this.handleImportModal()}
          onOk={this.handleSubmitImport}
        />
      </div>
    )
  }
}