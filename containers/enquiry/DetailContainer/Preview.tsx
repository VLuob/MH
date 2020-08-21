
import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import jsCookie from 'js-cookie'
import { Button, Dropdown, Menu, Modal, Tooltip, message } from 'antd'

import { EditionType, LetterSendType } from '@base/enums'
import { config } from '@utils'
import CustomIcon from '@components/widget/common/Icon'
import SelectAuthorModal from '@components/author/SelectAuthorModal'
import EnquiryList from '../EnquiryList'
import EnquiryContactModal from '../EnquiryContactModal'
import DeleteEnquiryModal from '../DeleteEnquiryModal'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import './index.less'
import { toJS } from 'mobx'

// 免费创作者查看联系人，所需发布作品数
const viewContactFreeAuthorShotsCount = 3

@inject(stores => {
  const { authorStore, enquiryStore, accountStore, letterStore, globalStore } = stores.store
  const { serverClientCode, isMobileScreen } = globalStore
  const { authors } = authorStore
  const { currentUser } = accountStore
  const { enquiryDetail, enquiryPreview, enquiryContact, fetchEnquiryContact } = enquiryStore
  return {
    authorStore,
    letterStore,
    isMobileScreen,
    serverClientCode,
    authors,
    currentUser,
    enquiryDetail: enquiryPreview,
    enquiryContact,
    fetchEnquiryContact,
  }
})
@observer
class EnquiryPreviewContainer extends Component {
  state = {
    freeVlsible: false,
    upgradeVlsible: false,
    contactVlsible: false,
    authorVisible: false,
    deleteVisible: false,

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
    // const { currentUser } = this.props
    // const { isAuthorLoad } = this.state
    // const isLogin = !!currentUser.id
    // if (!isLogin) {
    //   location.href = `/signin?c=${encodeURIComponent(location.href)}`
    //   return
    // }
    // const authors = await this.requestAuthors()
    // if (authors.length === 0) {
    //   this.handleFreeVisible(true)
    // } else if (authors.length === 1) {
    //   const authorItem = authors[0]
    //   this.setState({authorItem})
    //   this.handleCurrentAuthorView(authorItem)
    // } else {
    //   this.handleAuthorOpen()
    // }
  }

  handleCurrentAuthorView = async (authorItem) => {
    const { fetchEnquiryContact, query, serverClientCode } = this.props
    const edition = authorItem.edition || {}
    const isFreeAuthor = !edition.editionType || edition.editionType === EditionType.FREE
    if (isFreeAuthor && authorItem.works < viewContactFreeAuthorShotsCount) {
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
    // window.open('/creator')
  }
  handleUpgradeSubmit = () => {

  }

  handleContactVisible = (flag) => {
    this.setState({ contactVlsible: !!flag })
  }

  handleOnlineChat = (record: any = {}) => {
    const { letterStore, currentUser } = this.props
    const isSender = record.sender
    const receiverName = isSender ? record.receiverName : record.senderName
    const receiverNickName = isSender ? record.receiverNickName : record.senderNickName
    const receiverType = isSender ? record.receiverType : record.senderType
    const receiverId = isSender ? record.receiverId : record.senderId
    const receiverAvatar = isSender ? record.receiverAvatar : record.senderAvatar
    const senderId = isSender ? record.senderId : record.receiverId
    const senderType = isSender ? record.senderType : record.receiverType
    const senderAvatar = isSender ? record.senderAvatar : record.receiverAvatar

    letterStore.open({
      type: LetterSendType.REPLY, //回复私信
      // authorId: currentUser.authorId,
      parentId: record.id,
      source: record.source,
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
    const { query } = this.props
    window.open(`/enquiry/edit/${query.id}`)
  }
  handleDelete = () => {
    this.handleDeleteVisible(true)
  }
  handleDeleteVisible = (flag) => {
    this.setState({ deleteVisible: !!flag })
  }
  handleDeleteConfirm = (option) => {

  }

  render() {
    const {
      freeVlsible,
      upgradeVlsible,
      contactVlsible,
      authorVisible,
      deleteVisible,
      authorFetching,
    } = this.state
    const { authors, currentUser, enquiryDetail = {}, enquiryContact, query, isMobileScreen } = this.props
    const isLogin = !!currentUser.id
    const isCurrentUser = enquiryDetail.senderId === currentUser.id
    const showSettingMenu = isLogin && isCurrentUser
    // const showSettingMenu = true

    const isEdit = !!enquiryDetail.gmtEdit
    const gmtTime = isEdit ? enquiryDetail.gmtEdit : (enquiryDetail.gmtPublished || enquiryDetail.gmtCreate)
    const dateStr = moment(gmtTime).format('YYYY-MM-DD')
    const dateTypeStr = isEdit ? '编辑' : '发布'
    const gmtExpireStr = moment(enquiryDetail.gmtExpire).format('YYYY-MM-DD')
    const views = enquiryDetail.views || 0
    const contactViews = enquiryDetail.contactViews || 0
    const company = enquiryDetail.contactOrg || ''

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
          <div className="parview-alert">
              此为发布预览的临时链接，仅用于临时预览，地址将在短期内失效
          </div>
          <div className="enquiry-detail-section">
            <div className="enquiry-detail-container enquiry-detail-wrapper">
              <div className="enquiry-detail-content">
                {enquiryDetail.content}
              </div>
              <div className="enquiry-detail-intro">
                <div className="intro-left">
                  <Tooltip title={`机构名称：${company}`}><span>{company}</span></Tooltip>
                  <Tooltip title={`${dateTypeStr}日期：${dateStr}`}><span>{dateStr}{dateTypeStr}</span></Tooltip>
                  <Tooltip title={`浏览人数：${views}人`}><span>{views}人浏览</span></Tooltip>
                </div>
                <div className="intro-right">
                  <Tooltip title={`询价截止日期：${gmtExpireStr}`}><span>{gmtExpireStr}截止</span></Tooltip>
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
                {/* <div className="operation">
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
                </div> */}
              </div>
            </div>
          </div>

          {/* <div className="enquiry-recommend-section">
            <div className="enquiry-detail-container enquiry-recommend-wrapper">
              <div className="header">
                相关询价推荐
            </div>
              <div className="list-wrapper">
                <EnquiryList />
              </div>
            </div>
          </div> */}
        </div>
        {/* <SelectAuthorModal
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
          contact={enquiryContact}
          visible={contactVlsible}
          onVisible={this.handleContactVisible}
          onOnline={this.handleOnlineChat}
        />
        {deleteVisible && <DeleteEnquiryModal
          enquiryId={query.id}
          visible={deleteVisible}
          onCancel={this.handleDeleteVisible}
          onConfirm={this.handleDeleteConfirm}
        />} */}
      </>
    )
  }
}

export default EnquiryPreviewContainer