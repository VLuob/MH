
import { Component } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { Button, Dropdown, Menu, Modal, Tooltip, message } from 'antd'
import { toJS } from 'mobx'

import { EditionType, LetterSendType, LetterReceiverTypes, LetterSenderTypes, LetterSources } from '@base/enums'
import { config, storage } from '@utils'
import enquirySys from '@base/system/enquiry'
import CustomIcon from '@components/widget/common/Icon'
import SelectAuthorModal from '@components/author/SelectAuthorModal'
import ShareBox from '@containers/common/ShareBox'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import EnquiryList from '../EnquiryList'
import EnquiryContactModal from '../EnquiryContactModal'
import VerifyCodeModal from '../VerifyCodeModal'
import DeleteResultModal from '../DeleteResultModal'
import DetailBottomActionBar from '../DetailBottomActionBar'

import './index.less'
import enquiry from 'dist/static/development/pages/enquiry'

const PhoneVerifyType = {
  EDIT: 'edit',
  DELETE: 'delete',
}

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

// 免费创作者查看联系人，所需发布作品数
const viewContactFreeAuthorShotsCount = 3

@inject(stores => {
  const { authorStore, enquiryStore, accountStore, letterStore, globalStore } = stores.store
  const { serverClientCode, isMobileScreen } = globalStore
  const { authors } = authorStore
  const { currentUser } = accountStore
  const { enquiryDetail, enquiryContact, enquiryRecommendData, fetchEnquiryContact, fetchEnquiryChatId, fetchRecommendEnquirys } = enquiryStore
  return {
    authorStore,
    letterStore,
    enquiryStore,
    serverClientCode,
    isMobileScreen,
    authors,
    currentUser,
    enquiryDetail,
    enquiryContact,
    enquiryRecommendData,
    fetchEnquiryContact,
    fetchEnquiryChatId,
    fetchRecommendEnquirys,
  }
})
@observer
class EnquiryDetailContainer extends Component {
  state = {
    freeVlsible: false,
    upgradeVlsible: false,
    contactVlsible: false,
    authorVisible: false,
    deleteVisible: false,
    deleteResultVisible: false,
    phoneVerifyVisible: false,
    phoneVerifyType: '',  // edit, delete

    authorFetching: false,
    isAuthorLoad: true,
    authorItem: {},
  }

  async requestAuthors() {
    const { authorStore, authors } = this.props
    if (authors.length === 0) {
      this.setState({ authorFetching: true })
      const response = await authorStore.fetchAuthors()
      this.setState({ authorFetching: false, isAuthorLoad: true })
      if (response.success) {
        return response.data || []
      } else {
        return []
      }
    }
    return authors
  }

  handleShowContact = async () => {
    const { currentUser } = this.props
    const { isAuthorLoad } = this.state
    const isLogin = !!currentUser.id
    if (!isLogin) {
      location.href = `/signin?c=${encodeURIComponent(location.href)}`
      return
    }
    const authors = await this.requestAuthors()
    if (authors.length === 0) {
      this.handleFreeVisible(true)
    } else if (authors.length === 1) {
      const authorItem = authors[0]
      this.setState({ authorItem })
      this.handleCurrentAuthorView(authorItem)
    } else {
      this.handleAuthorOpen()
    }
  }

  handleCurrentAuthorView = async (authorItem) => {
    const { fetchEnquiryContact, query, serverClientCode } = this.props
    const edition = authorItem.edition || {}
    const isFreeAuthor = !edition.editionType || edition.editionType === EditionType.FREE
    if (isFreeAuthor && authorItem.worksQuantity < viewContactFreeAuthorShotsCount) {
      this.handleUpgradeVisible(true)
    } else {
      const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
      const param = {
        token,
        enquiryId: query.id,
        authorId: authorItem.id,
        clientCode: serverClientCode,
      }
      const res = await fetchEnquiryContact(param)
      if (res.success) {
        this.handleContactVisible(true)
      } else {
        message.destroy()
        message.error(res.data.msg || '获取联系人信息失败')
      }
    }
  }

  handleAuthorOpen = () => {
    this.handleAuthorVisible(true)
    this.requestAuthors()
  }

  handleFreeVisible = (flag) => {
    this.setState({ freeVlsible: !!flag })
  }
  handleFreeSubmit = () => {
    window.open('/creator')
    this.handleFreeVisible(false)
  }
  handleUpgradeVisible = (flag) => {
    this.setState({ upgradeVlsible: !!flag })
  }
  handleShotsPublish = () => {
    window.open('/shots/new')
  }
  handleUpgradeSubmit = () => {
    window.open(`/pricing`)
  }

  handleContactVisible = (flag) => {
    this.setState({ contactVlsible: !!flag })
  }

  handleOnline = async () => {
    this.handleOnlineChat()
  }

  requestChatId = async () => {
    const { fetchEnquiryChatId, query } = this.props
    const { authorItem } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const enquiryId = query.id
    const authorId = authorItem.id
    return await fetchEnquiryChatId({ token, enquiryId, authorId })
  }

  handleOnlineChat = () => {
    const { letterStore, enquiryDetail, enquiryContact, currentUser, query } = this.props
    const { authorItem } = this.state
    const enquiryId = query.id
    const authorId = authorItem.id
    const receiverName = enquiryDetail.creator
    const receiverNickName = enquiryContact.realName
    const receiverType = enquiryDetail.senderType
    const receiverId = enquiryDetail.senderId
    const receiverAvatar = ''
    const senderId = authorId
    const senderType = LetterSenderTypes.AUTHOR
    const senderAvatar = authorItem.avatar

    letterStore.open({
      requestChatId: this.requestChatId,
      type: LetterSendType.REPLY, //回复私信
      authorId: authorId,
      // parentId: enquiryChatId,
      sourceId: enquiryId,
      source: LetterSources.PUBLIC_ENQUIRY,
      receiverName,
      receiverNickName,
      receiverType,
      receiverId,
      receiverAvatar,
      senderId,
      senderType,
      senderAvatar,
    })
  }
  // handleOnline = async () => {
  //   const { fetchEnquiryChatId, query } = this.props
  //   const { authorItem } = this.state
  //   const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
  //   const enquiryId = query.id
  //   const authorId = authorItem.id
  //   const response = await fetchEnquiryChatId({token, enquiryId, authorId})
  //   if (response.success) {
  //     const enquiryChatId = response.data
  //     this.handleOnlineChat(enquiryChatId)
  //   }
  // }

  // handleOnlineChat = (enquiryChatId) => {
  //   const { letterStore, enquiryDetail, enquiryContact, currentUser } = this.props
  //   const { authorItem } = this.state
  //   const authorId = authorItem.id
  //   const receiverName = enquiryDetail.creator
  //   const receiverNickName = enquiryContact.realName
  //   const receiverType = enquiryDetail.senderType
  //   const receiverId = enquiryDetail.senderId
  //   const receiverAvatar = ''
  //   const senderId = authorId
  //   const senderType = LetterSenderTypes.AUTHOR
  //   const senderAvatar = authorItem.avatar

  //   letterStore.open({
  //     type: LetterSendType.REPLY, //回复私信
  //     authorId: authorId,
  //     parentId: enquiryChatId,
  //     source: LetterSources.PUBLIC_ENQUIRY,
  //     receiverName,
  //     receiverNickName,
  //     receiverType,
  //     receiverId,
  //     receiverAvatar,
  //     senderId,
  //     senderType,
  //     senderAvatar,
  //   })
  // }

  handleAuthorVisible = (flag) => {
    this.setState({ authorVisible: !!flag })
  }
  handleAuthorConfirm = (authorItem) => {
    this.setState({ authorItem })
    this.handleAuthorVisible(false)
    this.handleCurrentAuthorView(authorItem)
  }

  handleSettingChange = (e) => {
    switch (e.key) {
      case 'edit':
        this.handleEdit()
        break
      case 'delete':
        this.handleDelete()
        break
    }
  }
  handleEdit = () => {
    const { query, enquiryDetail, currentUser } = this.props
    const isVisitor = enquiryDetail.senderType === LetterSenderTypes.VISTOR
    const enquiryId = query.id
    // this.handleEditSet({phone: '17621629109', code: '789663'})
    // return
    if (isVisitor) {
      if (enquirySys.checkVisitorPhoneVerify(enquiryId)) {
        window.open(`/enquiry/edit/${query.id}`)
      } else {
        this.handlePhoneVerifyVisible(true, PhoneVerifyType.EDIT)
      }
    } else {
      const isLogin = !!currentUser.id
      if (!isLogin) {
        location.href = `/signin?c=${encodeURIComponent(location.href)}`
      } else {
        const isCurrentUser = enquiryDetail.senderId === currentUser.id
        if (!isCurrentUser) {
          message.warn('您不是该询价的发布者，没有权限操作！')
        } else {
          window.open(`/enquiry/edit/${query.id}`)
        }
      }
    }
  }
  handleDelete = () => {
    const { enquiryDetail, currentUser, query } = this.props
    const isVisitor = enquiryDetail.senderType === LetterSenderTypes.VISTOR
    // console.log(toJS(enquiryDetail))
    if (isVisitor) {
      const enquiryId = query.id
      if (enquirySys.checkVisitorPhoneVerify(enquiryId)) {
        const phoneVerify = enquirySys.getVisitorPhoneVerify(enquiryId)
        const param = {
          phone: phoneVerify.phone,
        }
        if (phoneVerify.token) {
          param.verifyToken = phoneVerify.token
        }
        // else {
        //   param.code = phoneVerify.code
        // }
        Modal.confirm({
          title: '是否确认删除该询价？',
          okText: '确定',
          cancelText: '取消',
          onOk: () => {
            this.handleDeleteSave(param)
          }
        })
      } else {
        this.handlePhoneVerifyVisible(true, PhoneVerifyType.DELETE)
      }
    } else {
      const isLogin = !!currentUser.id
      if (!isLogin) {
        location.href = `/signin?c=${encodeURIComponent(location.href)}`
      } else {
        const isCurrentUser = enquiryDetail.senderId === currentUser.id
        if (!isCurrentUser) {
          message.warn('您不是该询价的发布者，没有权限操作！')
        } else {
          Modal.confirm({
            title: '您是否确认删除该询价？',
            cancelText: '取消',
            okText: '确定',
            onOk: () => {
              this.handleDeleteSave()
            }
          })
        }
      }
    }

  }

  handlePhoneVerifyConfirm = (option) => {
    const { phoneVerifyType } = this.state
    this.handlePhoneVerifyVisible(false)
    if (phoneVerifyType === PhoneVerifyType.DELETE) {
      this.handleDeleteSave(option)
    } else {
      this.handleEditSet(option)
    }
  }
  handleDeleteResultVisible = (flag) => {
    this.setState({ deleteResultVisible: !!flag })
  }

  handleDeleteSave = (option = {}) => {
    const { enquiryStore, query, enquiryDetail } = this.props
    const isVisitor = enquiryDetail.senderType === LetterSenderTypes.VISTOR
    const enquiryId = query.id
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const param = {
      enquiryId,
      ...option,
    }
    if (!isVisitor) {
      param.token = token
    }
    enquiryStore.deleteEnquiry(param).then(res => {
      if (res.success) {
        this.handleDeleteResultVisible(true)
        if (isVisitor) {
          const verifyToken = res.data
          const expire = moment().add(7, 'day').valueOf()
          enquirySys.updateVisitorPhoneVerify({ id: enquiryId, expire, token: verifyToken })
        }

      } else {
        if (res.data.msg === 'PERMISSION DENIED') {
          message.destroy()
          message.error('您无权进行操作')
        } else if (res.data.msg === '验证码错误') {
          enquirySys.removeVisitorPhoneVerify(enquiryId)
          this.handlePhoneVerifyVisible(true, PhoneVerifyType.DELETE)
        } else {
          message.destroy()
          message.error(res.data.msg || '删除失败')
        }


      }
    })
  }

  handleEditSet = async (option = {}) => {
    const { query, enquiryStore } = this.props
    const enquiryId = query.id
    const param = {
      enquiryId,
      verifyPhone: option.phone,
      verifyCode: option.code,
    }
    const response = await enquiryStore.fetchEnquiryEdit(param)

    if (response.success) {
      const resData = response.data || {}
      const verifyToken = resData.verifyToken
      const create = moment().valueOf()
      const expire = moment().add(7, 'days').valueOf()
      const storeParam = { id: enquiryId, verify: true, create, expire, token: verifyToken, ...option }
      // storage.set(config.STORAGE_VISITOR_ENQUIRY_EDIT_STATUS, storeParam)
      enquirySys.saveVisitorPhoneVerify(storeParam)
      location.href = `/enquiry/edit/${enquiryId}`
    } else {
      if (response.data.msg === 'PERMISSION DENIED') {
        message.destroy()
        message.error('您无权进行操作')
      } else {
        message.destroy()
        message.error(response.data.msg)
      }
    }

  }

  handlePhoneVerifyVisible = (flag = false, phoneVerifyType = '') => {
    this.setState({ phoneVerifyVisible: !!flag, phoneVerifyType })
  }

  handleLoadMore = () => {
    const { enquiryRecommendData, fetchRecommendEnquirys } = this.props
    const { terms } = enquiryRecommendData
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const param = {
      ...terms,
      token,
      pageIndex: terms.pageIndex + 1,
    }
    fetchRecommendEnquirys(param)
  }

  render() {
    const {
      freeVlsible,
      upgradeVlsible,
      contactVlsible,
      authorVisible,
      deleteVisible,
      deleteResultVisible,
      phoneVerifyVisible,
      phoneVerifyType,
      authorFetching,
    } = this.state
    const {
      query,
      authors,
      currentUser,
      isMobileScreen,
      enquiryDetail = {},
      enquiryContact,
      enquiryRecommendData = {},
    } = this.props
    const isLogin = !!currentUser.id
    const isCurrentUser = enquiryDetail.senderId === currentUser.id
    const isVistor = enquiryDetail.senderType === LetterSenderTypes.VISTOR || !enquiryDetail.senderType
    const showSettingMenu = (isLogin && isCurrentUser) || (!isLogin && isVistor)
    // const showSettingMenu = true

    const isEdit = !!enquiryDetail.gmtEdit
    const gmtTime = isEdit ? enquiryDetail.gmtEdit : (enquiryDetail.gmtPublished || enquiryDetail.gmtCreate)
    const dateStr = moment(gmtTime).format('YYYY-MM-DD')
    const dateTypeStr = isEdit ? ' 编辑' : ' 发布'
    const gmtExpireStr = moment(enquiryDetail.gmtExpire).format('YYYY-MM-DD')
    const views = enquiryDetail.views || 0
    const contactViews = enquiryDetail.contactViews || 0
    const company = enquiryDetail.contactOrg || ''

    const recommendEnquirys = enquiryRecommendData.list || []
    const isRecommendEnd = enquiryRecommendData.end
    const hasRecommendEnquirys = recommendEnquirys.length > 0

    return (
      <>
        {isMobileScreen &&
          <MbNavigatorBar
            showTitle
            title="询价详情"
            btnType="back"
            backUrl="/enquiry"
          />}
        <div className="enquiry-body">
          <div className="enquiry-detail-section">
            <div className="enquiry-detail-container enquiry-detail-wrapper">
              <div className="enquiry-detail-content">
                {enquiryDetail.content}
              </div>
              <div className="enquiry-detail-intro">
                <div className="intro-left">
                  <Tooltip title={`机构名称：${company}`}><span>{company}</span></Tooltip>
                  <Tooltip title={`${dateTypeStr}日期：${dateStr}`}><span className="date-publish">{dateStr}{dateTypeStr}</span></Tooltip>
                  <Tooltip title={`浏览人数：${views}人`}><span className="views">{views}人浏览</span></Tooltip>
                </div>
                <div className="intro-right">
                  <Tooltip title={`询价截止日期：${gmtExpireStr}`}><span>{gmtExpireStr} 截止</span></Tooltip>
                </div>
              </div>
              <div className="enquiry-detail-bottom">
                <div className="contact-info">
                  <Button
                    type="primary"
                    className="btn-contact"
                    onClick={this.handleShowContact}
                    loading={authorFetching}
                  >
                    查看联系人信息
                </Button>
                  <Tooltip title={`已有${contactViews}位创作者查看了此联系人`}><span className="views-text">{contactViews}位创作者已查看</span></Tooltip>
                </div>
                <div className="operation">
                  {showSettingMenu && <Dropdown
                    placement="bottomRight"
                    overlay={
                      <Menu onClick={this.handleSettingChange}>
                        <Menu.Item key="edit">修改</Menu.Item>
                        <Menu.Item key="delete">删除</Menu.Item>
                      </Menu>
                    }
                  >
                    <CustomIcon name="ellipsis-vertical" />
                  </Dropdown>}
                </div>
              </div>
              {!isMobileScreen && <ShareBox
                title={enquiryDetail.content}
                description={enquiryDetail.content}
              />}
            </div>
          </div>

          <div className="enquiry-recommend-section">
            <div className="enquiry-detail-container enquiry-recommend-wrapper">
              <div className="header">
                相关询价推荐
              </div>
              <div className="list-wrapper">
                <EnquiryList
                  isMobileScreen={isMobileScreen}
                  list={recommendEnquirys}
                  loading={enquiryRecommendData.loading}
                />
              </div>
              <div className="load-more">
                <LoadMore
                  visible={!isRecommendEnd && hasRecommendEnquirys}
                  name={`加载更多`}
                  num={3}
                  reqList={this.handleLoadMore}
                />
              </div>
            </div>
          </div>
        </div>
        {isMobileScreen && <DetailBottomActionBar
          title={enquiryDetail.content}
          onShowContact={this.handleShowContact}
        />}
        <SelectAuthorModal
          title="请选择与对方联系的创作者"
          visible={authorVisible}
          authorId={(authors[0] || {}).id}
          authors={authors}
          onCancel={e => this.handleAuthorVisible(false)}
          onConfirm={this.handleAuthorConfirm}
        />
        <Modal
          visible={freeVlsible}
          onCancel={e => this.handleFreeVisible(false)}
          maskClosable={false}
          footer={null}
        >
          <div className="enquiry-confirm-modal-wrapper">
            <div className="title">提示</div>
            <div className="content">
              您尚未创建梅花网创作者，无法进行查看
          </div>
            <div className="footer">
              <Button onClick={e => this.handleFreeVisible(false)}>取消</Button>
              <Button type="primary" onClick={this.handleFreeSubmit}>免费创建创作者</Button>
            </div>
          </div>
        </Modal>
        <Modal
          visible={upgradeVlsible}
          onCancel={e => this.handleUpgradeVisible(false)}
          maskClosable={false}
          footer={null}
        >
          <div className="enquiry-confirm-modal-wrapper">
            <div className="title">提示</div>
            <div className="content">发布{viewContactFreeAuthorShotsCount}个作品或升级高版本创作者可查看该询价联系信息</div>
            <div className="footer">
              <Button onClick={this.handleShotsPublish}>发布作品</Button>
              <Button type="primary" onClick={this.handleUpgradeSubmit}>升级版本</Button>
            </div>
          </div>
        </Modal>
        <EnquiryContactModal
          hideChatBtn={isVistor}
          contact={enquiryContact}
          visible={contactVlsible}
          onVisible={this.handleContactVisible}
          onOnline={this.handleOnline}
        />
        {phoneVerifyVisible && <VerifyCodeModal
          title={phoneVerifyType === PhoneVerifyType.DELETE ? '删除询价' : '编辑询价'}
          enquiryId={query.id}
          visible={phoneVerifyVisible}
          onCancel={this.handlePhoneVerifyVisible}
          onConfirm={this.handlePhoneVerifyConfirm}
        />}
        <DeleteResultModal
          visible={deleteResultVisible}
          onCancel={e => this.handleDeleteResultVisible(false)}
        />
      </>
    )
  }
}

export default EnquiryDetailContainer