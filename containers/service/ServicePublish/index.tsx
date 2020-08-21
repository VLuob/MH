import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import isEqual from 'lodash/isEqual'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import md5 from 'md5'
import qs from 'qs'
import axios from 'axios'
import 'moment/locale/zh-cn'
import {
  Form,
  Row,
  Col,
  Select,
  Icon,
  Input,
  Button,
  Checkbox,
  Avatar,
  message,
  Tooltip,
  Modal,
  Popover,
} from 'antd'
import { Router } from '@routes'
import UserIdentityComp from '@components/widget/common/UserIdentityComp'

import CustomIcon from '@components/widget/common/Icon'

import SelectShotsModal from '../SelectShotsModal'
import ServiceShotsView from './ServiceShotsView'
import ServiceBrandField from './ServiceBrandField'
import ServiceContentField from './ServiceContentField'

import { DownloadAuthTypes, CompositionTypes, AuthorType, UploadFileTypes, ServiceStatus, EditionType } from '@base/enums'
import { config, utils, helper, session } from '@utils'
import { user } from '@base/system'
import sysOrder from '@base/system/order'


import './index.less'

moment.locale('zh-cn')


const FormItem = Form.Item
const { Option } = Select
const TextArea = Input.TextArea

const monthFormat = 'YYYY-MM';
const COOKIE_SELECT_AUTHOR_TIP = 'mh_sel_author_tip'
const SESSION_SELECT_AUTHOR_ID = 'mh_sel_author_id'

const editionDatas = sysOrder.filters.editionDatas
const serviceDatas = sysOrder.filters.serviceDatas


@inject(stores => {
  const { compositionStore, accountStore, globalStore, serviceStore } = stores.store
  const { qiniuToken } = globalStore
  const { currentUser } = accountStore
  const { authors, forms } = compositionStore
  const { serviceEdit } = serviceStore
  return {
    compositionStore,
    serviceStore,
    accountStore,
    globalStore,
    currentUser,
    authors,
    forms,
    detail: serviceEdit || {},
  }
})
@observer
@Form.create()
export default class ServiceContainer extends Component {
  state = {
    loading: false,
    submitting: false,

    authorId: null,

    title: '',
    summary: '',

    titleMax: 32,
    summaryMax: 500,
    titleCurrent: 0,
    summaryCurrent: 0,

    currentAuthorId: '',

    toPublish: false,
    toPreview: false,

    // 阅读并同意
    isAgree: false,
    // 同步梅花创新奖
    isSyncMawards: false,

    showGalleryFullscreen: false,
    galleryIndex: 0,

    prevFormValues: {},

    showSelectAuthorTip: false,

    selectShotsVisible: false,
    addShots: [],
    brands: [],
    // serviceItems: [{ name: '', price: null, content: '' }],
    serviceItems: [],
  }

  // 多字段是否进行及时验证
  isImmediateVerify = false

  componentDidMount() {
    this.initData()
    this.requestServiceEdit()
    this.requestAuthors()
    this.requestClassifications()
    this.initEvents()
    this.initSelectAuthorTip()
  }

  componentWillUnmount() {
    this.removeEvents()
  }

  initEvents() {
    window.addEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  removeEvents() {
    window.removeEventListener('beforeunload', this.handleBeforeUnload, false)
  }

  initSelectAuthorTip() {
    const cookieTip = jsCookie.get(COOKIE_SELECT_AUTHOR_TIP)
    this.setState({ showSelectAuthorTip: !cookieTip })
  }

  handleBeforeUnload = (e) => {
    const event = window.event || e
    const values = this.props.form.getFieldsValue()
    if (!values.author || !values.name) {
      event.returnValue = "您正在编辑服务，确定要关闭网页并保存草稿吗？"
    }
  }

  initData() {
    const { query } = this.props
    const sessionAuthorId = session.get(SESSION_SELECT_AUTHOR_ID)
    if (sessionAuthorId) {
      this.setState({ authorId: sessionAuthorId })
      if (!query.id) {
        this.requestServiceBrands(sessionAuthorId)
      }
    }
  }

  async requestServiceEdit() {
    const { serviceStore, query } = this.props
    if (!query.id) {
      const serviceItems = [{ name: '', price: null, content: '' }]
      this.setState({ serviceItems })
      return
    }
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const serviceId = query.id
    const status = query.s
    const params = { serviceId, status, token }
    const response = await serviceStore.fetchServiceEdit(params)
    if (response.success) {
      const data = response.data || {}
      const authorId = data.authorId
      const authorItem = {id: authorId, nickname: data.authorNickName}
      const brands = (data.authorServiceBrands || []).map(item => ({ ...item, chName: item.brandName }))
      const addShots = (data.authorServiceCompositions || []).map(item => ({ ...item, title: item.compositionTitle, cover: item.compositionCover }))
      const serviceItems = data.items ? JSON.parse(data.items) : [{ name: '', price: null, content: '' }]
      const nextState = { authorId, authorItem, brands, addShots, serviceItems }
      const sessionAuthorId = session.get(SESSION_SELECT_AUTHOR_ID)
      if (sessionAuthorId) {
        nextState.authorId = String(sessionAuthorId)
      }
      this.setState(nextState)
    }
  }

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
      if (!query.id) {
        this.requestServiceBrands(authorId)
      }
    }
  }

  async requestServiceBrands(authorId) {
    const { serviceStore } = this.props
    const { brands } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const param = { token, authorId }
    const response = await serviceStore.fetchServiceBrands(param)
    if (response.success) {
      const brandDatas = (response.data || []).map(item => ({...item, brandId: item.id}))
      const newBrands = [...brands]
      brandDatas.forEach(item => {
        if (!brands.some(b => b.brandId === item.brandId)) {
          newBrands.push({ ...item })
        }
      })
      this.setState({ brands: newBrands })
    }
  }

  requestClassifications() {
    const { compositionStore } = this.props
    compositionStore.fetchClassifications({})
  }

  handleSubmit = (e) => {
    e.preventDefault()
    const { form, query } = this.props
    const { isAgree } = this.state
    if (!isAgree) {
      message.error('请勾选并阅读发布协议')
      return
    } else {
      this.isImmediateVerify = true
      form.validateFields(['serviceItems','brands', 'shots'], { force: true })
      // form.validateFields(['serviceItems'], { force: true })
      form.validateFieldsAndScroll((err, values) => {
        if (err) {
          return false
        }

        this.handlePublish(values)
      })
    }
  }

  async handlePublish(values) {
    const { query, form, currentUser = {}, detail = {}, } = this.props
    const status = ServiceStatus.AUDITING
    values.status = status
    const params = this.arragementSubmitFields(values)

    this.setState({ submitting: true })
    const res = await this.submitSave(params)
    const { authorId, edition } = this.getCurrentAuthorEdition()
    let param: any = {
      v: edition.editionType,
      expire: edition.gmtExpire,
      authorId: authorId,
      id: query.id,
    }
    if (res.success) {
      session.remove(SESSION_SELECT_AUTHOR_ID)
      const serviceId = query.id || res.data
      param.id = serviceId
      param.code = 'S100000'
      this.setState({ submitting: false })
      location.href = `/composition/service/result?${qs.stringify(param)}`
    } else {
      this.setState({ submitting: false })
      if (res.data.code === 'E100006') {
        const serviceId = query.id || res.data.msg
        param.id = serviceId
        param.code = res.data.code
        location.href = `/composition/service/result?${qs.stringify(param)}`
      } else {
        message.error(res.data.msg)
      }
    }
  }

  handleSave = async (e) => {
    const { form, query } = this.props;
    e.preventDefault();
    const values = form.getFieldsValue();
    values.status = ServiceStatus.DRAFT;
    // console.log(values)
    if (!this.checkSimpoeSave(values)) {
      return
    }
    this.setState({ submitStatus: 'save' });
    const params = this.arragementSubmitFields(values);
    const res = await this.submitSave(params);
    if (res.success) {
      this.setState({ prevFormValues: { ...values } })
      message.success('保存成功');
      session.remove(SESSION_SELECT_AUTHOR_ID)
      if (!query.id) {
        const param = {
          ...query,
          s: ServiceStatus.DRAFT,
        }
        Router.pushRoute(`/service/edit/${res.data}?${qs.stringify(param)}`)
      }
    } else {
      message.error(res.data.msg);
    }
  }

  handlePreview = async (e) => {
    this.setState({ toPreview: true }, async () => {
      const { form, query, authors, serviceStore } = this.props;
      e.preventDefault();
      const values = form.getFieldsValue();
      values.status = ServiceStatus.DRAFT;
      //   console.log(values)
      if (!this.checkSimpoeSave(values)) {
        return
      }
      const params = this.arragementSubmitFields(values);
      const res = await this.submitSave(params);
      this.setState({ toPreview: false });
      if (res.success) {
        session.remove(SESSION_SELECT_AUTHOR_ID)
        const serviceId = query.id || res.data
        serviceStore.fetchServicePreviewCode({ serviceId }).then((res) => {
          if (res.success) {
            window.open(`/service/preview/${res.data}`)
            if (!query.id) {
              const param = {
                ...query,
                s: ServiceStatus.DRAFT,
              }
              Router.pushRoute(`/service/edit/${serviceId}?${qs.stringify(param)}`)
            }
          }
        })
      } else {
        message.error(res.data.msg)
      }
    });
  };

  checkSimpoeSave(values) {
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
    if (!values.name || values.name.trim() === '') {
      setFields.name = {
        value: '',
        errors: [new Error('服务名称不可为空')],
      }
      if (isOk) {
        message.error('请填写服务名称')
      }
      isOk = false
    }
    if (!isOk) {
      form.setFields(setFields)
    }
    return isOk
  }

  async submitSave(params) {
    const { serviceStore, query } = this.props
    if (query.id) {
      params.serviceId = query.id
      return await serviceStore.editService(params)
    } else {
      return await serviceStore.addService(params)
    }
  }

  arragementSubmitFields(values) {
    const { query } = this.props
    const { brands, addShots, serviceItems, authorItem, toPublish, toPreview, } = this.state;
    const status = toPublish ? ServiceStatus.AUDITING : values.status || ServiceStatus.DRAFT
    // const author = authors.find(item => item.id === values.author)
    const brandIds = brands.map(item => item.brandId).join(',')
    const compositionIds = addShots.map(item => item.compositionId).join(',')
    const params = {
      authorId: values.author,
      name: values.name,
      description: values.description,
      status,
      formId: values.form,
      brandIds,
      compositionIds,
      items: JSON.stringify(serviceItems),
    }

    if (toPreview) {
      params.toPreview = toPreview
    }

    this.setState({ toPublish, toPreview })

    return params;
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

  handleAuthorSelect = (authorId, option) => {
    const { query } = this.props
    const authorItem = option.props.author || {}
    this.setState({ authorId, authorItem })
    session.set(SESSION_SELECT_AUTHOR_ID, authorId)
    if (!query.id) {
      this.requestServiceBrands(authorId)
    }
  }

  handleAgreeChange = e => {
    const { isAgree } = this.state
    this.setState({ isAgree: !isAgree })
  }

  handleAuthorSelectTipClose = () => {
    this.setState({ showSelectAuthorTip: false })
    jsCookie.set(COOKIE_SELECT_AUTHOR_TIP, '1', { expires: 7, path: '/' })
  }

  handleSelectShotsVisible = (flag) => {
    this.setState({ selectShotsVisible: !!flag })
  }

  handleSelectShotsConfirm = (records) => {
    const { addShots } = this.state
    const newShots = [...addShots]
    records.forEach(item => {
      if (!addShots.some(r => r.compositionId === item.compositionId)) {
        newShots.push(item)
      }
    })
    this.setState({ addShots: newShots }, () => {
      this.props.form.validateFields(['shots'], { force: true })
    })
    this.handleSelectShotsVisible(false)
  }

  handleShotsRemove = (record) => {
    const { addShots } = this.state
    const newShots = addShots.filter(item => item.compositionId !== record.compositionId)
    this.setState({ addShots: newShots }, () => {
      this.props.form.validateFields(['shots'], { force: true })
    })
  }

  handleBrandsChange = (brands) => {
    this.setState({ brands }, () => {
      this.props.form.validateFields(['brands'], { force: true })
    })
  }

  handleAddService = () => {
    const { serviceItems } = this.state
    if (serviceItems.length >= 3) {
      message.info('服务内容清单最多可以添加3个')
      return
    }
    const item = { name: '', price: null, content: '' }
    const newServiceItems = [...serviceItems, item]
    this.setState({ serviceItems: newServiceItems })
  }

  handleServiceContentChange = (value, serviceIndex) => {
    const { serviceItems } = this.state
    const newServiceItems = serviceItems.map((item, index) => {
      if (index === serviceIndex) {
        return { ...value }
      }
      return item
    })
    // console.log('content change', newServiceItems)
    this.setState({ serviceItems: newServiceItems }, () => {
      if (this.isImmediateVerify) {
        this.props.form.validateFields(['serviceItems'], { force: true })
      }
    })
  }

  handleServoceContentRemove = (removeIndex) => {
    const { serviceItems } = this.state
    const newServiceItems = serviceItems.filter((item, index) => index !== removeIndex)
    this.setState({serviceItems: newServiceItems}, () => {
      this.props.form.validateFields(['serviceItems'], { force: true })
    })
  }

  getCurrentAuthorEdition() {
    const { authorId } = this.state
    const { authors } = this.props
    // console.log('author',toJS(authors), authorId)
    const authorItem = authors.find(item => item.id === authorId) || {}
    const edition = authorItem.edition || (authorId ? { editionType: EditionType.FREE } : {})
    const extraService = authorItem.extraService || []
    const extraServiceTypes = extraService.map(item => item.editionType)
    const editionIntro = editionDatas.find(item => item.id === edition.editionType) || (authorId ? editionDatas[0] : {})
    const extraServiceIntro = serviceDatas.filter(item => extraService.some(ex => ex.editionType === item.id))
    return { authorId, authorItem, edition, extraService, extraServiceTypes, editionIntro, extraServiceIntro }
  }

  render() {
    const {
      query,
      form,
      detail,
      authors,
      forms,
      currentUser,
    } = this.props
    const {
      submitting,
      authorId,
      isAgree,
      titleMax,
      summaryMax,
      titleCurrent,
      summaryCurrent,
      showSelectAuthorTip,

      selectShotsVisible,
      addShots,
      brands,
      serviceItems,
    } = this.state
    const { getFieldDecorator } = form
    const isEdit = !!query.id
    const { authorItem, edition, editionIntro, extraService, extraServiceIntro } = this.getCurrentAuthorEdition()
    const isFreeEdition = edition.editionType === EditionType.FREE
    const isAdvancedEdition = edition.editionType === EditionType.ADVANCED
    const expireFormatLabel = isFreeEdition ? '免费' : (edition.gmtExpire ? moment(edition.gmtExpire).format('YYYY-MM-DD') : '')
    // console.log('detail', toJS(detail))
    const serviceUrl = `/teams/${authorId}/service`
    const statisticsUrl = `/teams/${authorId}/statistics`
    const saveLoading = false
    const formItemLayout = null
    const submitFormLayout = null

    return (
      <Form onSubmit={this.handleSubmit} colon={false}>
        <div className="shots-edit-top">
          <div className="shots-publish-menu-box">
            <div className="publish-menu-item active">
              <a className="btn-normal"><CustomIcon name="upload" /> <span className="text">发布服务</span></a>
              <Popover
                placement="right"
                content={<span className="text">发布服务</span>}
              >
                <a className="btn-mini"><CustomIcon name="upload" /></a>
              </Popover>
            </div>
            <div className="publish-menu-item">
              <a className="btn-normal" href={serviceUrl} target="_blank"><CustomIcon name="management" /> <span className="text">服务管理</span></a>
              <Popover
                placement="right"
                content={<span className="text">服务管理</span>}
              >
                <a className="btn-mini" href={serviceUrl} target="_blank"><CustomIcon name="management" /></a>
              </Popover>
            </div>
          </div>
          <div className="top-item top-left">
            <div>
              <FormItem {...formItemLayout}>
                {getFieldDecorator('author', {
                  rules: [{
                    required: true,
                    message: '请输选择创作者',
                  }],
                  initialValue: authorId ? String(authorId) : undefined,
                })(<Select
                  suffixIcon={<Icon type="caret-down" />}
                  className="author-select author-select-shots"
                  placeholder="请选择创作者"
                  // disabled={isEdit}
                  onSelect={this.handleAuthorSelect}
                >{
                    authors.map(item => {
                      const currentAuthorEdition = item.edition || { editionType: EditionType.FREE }
                      const currentAuthorIsFree = currentAuthorEdition.editionType === EditionType.FREE
                      const showAuthorType = currentAuthorIsFree || item.type === AuthorType.BRANDER || item.type === AuthorType.EDITOR
                      return (
                        <Option key={item.id} value={item.id} author={item} className="select-author-option">
                          <div className="select-author-item select-author-item-shots">
                            <div className="item-avatar">
                              <Avatar icon="user" src={item.avatar} size={40} />
                            </div>
                            <div className="item-info">
                              <div className="nick">{item.nickname}</div>
                              <div className="domain"><UserIdentityComp currentType={item.type} editionType={currentAuthorEdition.editionType} /> {item.name}</div>
                            </div>
                          </div>
                        </Option>
                      )
                    })
                  }
                </Select>)}
                {showSelectAuthorTip && <div className="nav-tip-box">这里可以切换发布服务的创作者  <Icon type="close" className="nav-tip-close" onClick={this.handleAuthorSelectTipClose} /></div>}
              </FormItem>
            </div>
          </div>
          {authorId && <div className="top-item top-right">
            <div className="top-info-item">
              <span style={{ marginRight: '20px', marginLeft: '20px' }}>版本：{editionIntro.name}</span>
              {!isFreeEdition && <span style={{ marginRight: '20px' }}>到期时间：{expireFormatLabel}</span>}
              <a
                href={`/pricing?v=${isFreeEdition ? EditionType.STANDARD : edition.editionType}&aid=${authorId}`}
                target="_blank"
                style={{ color: '#168dd7' }}
              >
                {isFreeEdition ? '升级' : '续费'}
              </a>
            </div>
            <div className="top-info-item">
              {/* {!isAdvancedEdition && <span>本月剩余发布量：{authorItem.monthLeftPublishedQuantity || 0} 条</span>} */}
            </div>
          </div>}
        </div>

        <div className='form-container shots-edit-form-box' style={{ marginTop: '0px' }}>
          <div className="service-publish-form-wrapper">
            <FormItem {...formItemLayout} label="服务名称" className="has-length-tips">
              {getFieldDecorator('name', {
                rules: [
                  {
                    required: true,
                    message: '请输入服务名称',
                  },
                ],
                initialValue: detail.name,
              })(
                <Input
                  className="input-title"
                  placeholder=""
                  onChange={this.handleTitleChange}
                />
              )}
              <span className={classnames('length-tips', { error: titleCurrent >= titleMax })}>{titleCurrent}/{titleMax}</span>
            </FormItem>

            <FormItem {...formItemLayout} label="服务描述" className="has-length-tips">
              {getFieldDecorator('description', {
                rules: [
                  {
                    required: true,
                    message: '请输入服务描述',
                  },
                ],
                initialValue: detail.description,
              })(
                <TextArea
                  className="textarea-summary"
                  placeholder=""
                  onChange={this.handleSummaryChange}
                />
              )}
              <span className={classnames('length-tips', { error: summaryCurrent >= summaryMax })}>{summaryCurrent}/{summaryMax}</span>
            </FormItem>
            <FormItem {...formItemLayout} label="服务内容清单">
              {getFieldDecorator(`serviceItems`, {
                rules: [
                  {
                    required: true,
                    // message: '请输入服务内容清单',
                    validator: (_, value, callback) => {
                      console.log('verify items', serviceItems)
                      // console.log('value', value)
                      const isSomeError = serviceItems.some(item => (item.name.trim() === '' || item.price.trim() === '' || item.content.trim() === ''))
                      if (isSomeError) {
                        callback('请完善服务内容清单')
                      } else {
                        callback()
                      }
                    },
                  },
                ],
              })(
                <div></div>
              )}
              <div className="service-content-box">
                {serviceItems.map((serviceItem, serviceIndex) => {
                  return (
                    <ServiceContentField
                      key={serviceIndex}
                      {...serviceItem}
                      removeable={serviceIndex > 0}
                      onRemove={e => this.handleServoceContentRemove(serviceIndex)}
                      onChange={value => this.handleServiceContentChange(value, serviceIndex)}
                    />
                  )
                })}
                <div className="service-content-bottom">
                  <Button onClick={this.handleAddService} disabled={serviceItems.length >= 3}>+ 添加服务内容清单</Button>
                </div>
              </div>
            </FormItem>
            <Row>
              <Col span={12}>
                <FormItem {...formItemLayout} label="形式">
                  {getFieldDecorator('form', {
                    rules: [
                      {
                        required: true,
                        message: '请选择形式',
                      },
                    ],
                    initialValue: detail.formId,
                  })(<Select
                    placeholder="请选择形式"
                  >
                    {forms.map(c => (
                      <Option key={c.id} value={c.id}>{c.name}</Option>
                    ))}
                  </Select>)}
                </FormItem>
                <FormItem {...formItemLayout} label="服务过品牌">
                  {getFieldDecorator('brands', {
                    rules: [
                      {
                        required: true,
                        // message: '请输入并选择服务过得品牌',
                        validator: (_, value, callback) => {
                          if (brands.length === 0) {
                            callback('请添加服务过的品牌')
                          } else {
                            callback()
                          }
                        },
                      }
                    ],
                    initialValue: detail.brandName,
                  })(
                    <div>
                      <ServiceBrandField
                        brands={brands}
                        onChange={this.handleBrandsChange}
                      />
                    </div>
                  )}
                </FormItem>
              </Col>
            </Row>
            <FormItem {...formItemLayout} label="代表作品">
              {getFieldDecorator('shots', {
                rules: [
                  {
                    required: true,
                    // message: '请选择代表作品',
                    validator: (_, value, callback) => {
                      if (addShots.length === 0) {
                        callback('请添加代表作品')
                      } else {
                        callback()
                      }
                    },
                  },
                ],
              })(
                <div>
                  <ServiceShotsView
                    list={addShots}
                    onAdd={e => this.handleSelectShotsVisible(true)}
                    onRemove={this.handleShotsRemove}
                  />
                </div>
              )}
            </FormItem>
          </div>

        </div>
        <div className="shots-edit-bottom">
          <div className="bottom-handle-wrapper">
            <div className="bottom-handle-intro">
              <div className="bottom-handle-item">
                <a href="/rule/shots" target="_brank">梅花网服务收录规范和编辑规范</a>
              </div>
            </div>
            <div className="bottom-handle-list">
              <div className="bottom-handle-item">
                <Checkbox checked={isAgree} onClick={this.handleAgreeChange}>勾选表示阅读并同意</Checkbox> <a href="/agreement/shots" className="copyright-link" target="_blank">《梅花网服务发布协议》</a>
              </div>
            </div>
          </div>
          <div className="buttom-btns">
            <Button className="btn-draft" loading={saveLoading} ref={el => this.submitRef = el} onClick={this.handleSave}>保存至草稿</Button>
            <span className="publish-btns">
              <Button onClick={this.handlePreview} style={{ marginLeft: 8 }}>预览</Button>
              <Button htmlType="submit" type="primary" style={{ marginLeft: 8 }} loading={submitting}>发布</Button>
            </span>
          </div>
        </div>
        {selectShotsVisible && <SelectShotsModal
          authorId={authorId}
          visible={selectShotsVisible}
          onCancel={e => this.handleSelectShotsVisible(false)}
          onConfirm={this.handleSelectShotsConfirm}
        />}
      </Form>
    )
  }
}