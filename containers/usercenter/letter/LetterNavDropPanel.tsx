import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import classnames from 'classnames'
import moment from 'moment'
import { Input, Modal, message, Spin, Button, Form, Avatar, Menu, Badge } from 'antd'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

import { LetterSendType, LetterSources, NoticeType, MessageType, AuthorType, CommentTypes } from '@base/enums'

const noticeAvatar = '/static/images/common/notice_avatar.svg'

const MenuItem = Menu.Item

const navTabs = [
  { id: 1, label: '通知' },
  { id: 2, label: '询价' },
]

const commentTypeLabelMap = {
  [CommentTypes.ARTICLE]: '文章',
  [CommentTypes.SHOTS]: '作品',
  [CommentTypes.TOPIC]: '专题',
}

const commentTypeKeyMap = {
  [CommentTypes.ARTICLE]: 'article',
  [CommentTypes.SHOTS]: 'shots',
  [CommentTypes.TOPIC]: 'topics',
}

@inject(stores => {
  const { accountStore, letterStore, messageStore } = stores.store
  const { letterUnreadData, unreadEnquiryCount } = letterStore
  const { messageStat } = messageStore
  const { currentUser } = accountStore

  return {
    accountStore,
    currentUser,

    letterStore,
    letterUnreadData,
    unreadEnquiryCount,
    messageStat,
  }
})
@observer
export default class LetterNavDropPanel extends Component {
  state = {
    showAll: false,
    msgTabType: 1, // 1 通知，2 询价
  }

  handleTabClick = (v) => {
    this.setState({ msgTabType: v })
  }

  handleShowAll = () => {
    this.setState({ showAll: !this.state.showAll })
  }

  handleSelect = (record) => {
    // const record = e.item.props.record
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
      authorId: currentUser.authorId,
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

  handleSelectNotice = (record) => {
    let urlPath = ''
    switch (record.type) {
      case MessageType.COMMENT:
        urlPath = '/comment'
        break
      case MessageType.FAVOR:
        urlPath = '/favor'
        break
      case MessageType.FOLLOW:
        urlPath = '/follow'
        break
      case MessageType.COLLECTION:
        urlPath = '/collection'
        break
      case MessageType.NOTICE:
        urlPath = '/notice'
        break
    }
    location.href = '/personal/message' + urlPath
  }

  getNoticeInfo(item) {
    let nickName = '系统消息'
    let noticeAvatar = '/static/images/common/notice_avatar.svg'
    let noticeTypeLabel = ''
    let noticeStatusLabel = ''
    let showTitle = ''
    let relationPath
    let linkText = ''
    let refuseContent = null
    let msgContent

    if (MessageType.NOTICE === item.type) {
      switch (item.noticeType) {
        case NoticeType.SHOTS_PASSED:
          noticeTypeLabel = '作品'
          noticeStatusLabel = '审核通过了'
          showTitle = item.compositionTitle
          relationPath = `/shots/${item.relationId}`
          linkText = '查看作品'
          msgContent = <span>您发布的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}</span>
          break
        case NoticeType.SHOTS_REFUSE:
          noticeTypeLabel = '作品'
          noticeStatusLabel = '审核未通过'
          showTitle = item.compositionTitle
          relationPath = `/shots/edit/${item.relationId}`
          linkText = '修改作品'
          refuseContent = item.content
          msgContent = <span>您发布的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}</span>
          break
        case NoticeType.ARTICLE_PASSED:
          noticeTypeLabel = '文章'
          noticeStatusLabel = '审核通过了'
          showTitle = item.compositionTitle
          relationPath = `/article/${item.relationId}`
          linkText = '查看文章'
          msgContent = <span>您发布的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}</span>
          break
        case NoticeType.ARTICLE_REFUSE:
          noticeTypeLabel = '文章'
          noticeStatusLabel = '审核未通过'
          showTitle = item.compositionTitle
          relationPath = `/article/edit/${item.relationId}`
          linkText = '修改文章'
          refuseContent = item.content
          msgContent = <span>您发布的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}</span>
          break
        case NoticeType.AUTHOR_PASSED:
          noticeTypeLabel = '创作者账号'
          noticeStatusLabel = '已审核通过'
          showTitle = item.compositionAuthorName
          relationPath = `/author/${item.compositionAuthorCode}`
          linkText = '查看作者'
          msgContent = <span>恭喜您，您提交的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}，快来发布作品和文章吧！</span>
          break
        case NoticeType.AUTHOR_REFUSE:
          noticeTypeLabel = '作者'
          noticeStatusLabel = '审核未通过'
          showTitle = item.compositionAuthorName
          linkText = '修改作者'
          refuseContent = item.content
          if (item.compositionAuthorType === AuthorType.SERVER) {
            relationPath = `/creator/service/${item.compositionAuthorId}`
          } else if (item.compositionAuthorType === AuthorType.BRANDER) {
            relationPath = `/creator/brand/${item.compositionAuthorId}`
          } else if (item.compositionAuthorType === AuthorType.PERSONAL) {
            relationPath = `/creator/personal${item.compositionAuthorId}`
          } else if (item.compositionAuthorType === AuthorType.EDITOR) {
            relationPath = `teams/${item.compositionAuthorId}/account`
          } else {
            relationPath = '/personal/account'
          }
          msgContent = <span>您发布的{noticeTypeLabel} <a className="title" href={relationPath} target="_blank">《{showTitle}》</a> {noticeStatusLabel}</span>
          break
        case NoticeType.SYSTEM_GROUP_SEND:
          const isSender = item.sender
          nickName = !isSender ? (item.senderNickName || item.senderName) : (item.receiverNickName || item.receiverName)
          const linkReg = /(http:\/\/|https:\/\/)((w|=|\?|.|\/|&|-)+)/g;
          const content = (item.content || '').replace(linkReg, url => `<a href="${url}" target="_blank">${url}</a>`)
          msgContent = <span dangerouslySetInnerHTML={{ __html: content }} />
          // msgContent = item.content
          break
        case NoticeType.SERVICE_AUDIT: {
          const titleReg = /(《.*?》)/g
          let relationUrl
          if (item.status === 2) {
            relationUrl = `/service/${item.relationId}`
          } else {
            relationUrl = `/service/edit/${item.relationId}`
          }
          const content = (item.content || '').replace(titleReg, title => `<a class="title" href="${relationUrl}" target="_blank">${title}</a>`)
          msgContent = <span dangerouslySetInnerHTML={{ __html: content }} />

          break
        }
      }
    }
    return { msgContent, nickName }
  }

  getMessageInfo(item) {
    const compositionTypeLabel = item.compositionType === 2 ? '作品' : '文章'
    const compositionPath = item.compositionType === 2 ? `/shots/${item.compositionId}` : `/article/${item.compositionId}`
    const nickName = item.nickname
    let messateTypeLabel = ''
    let messageIntro
    switch (item.type) {
      case MessageType.FAVOR:
        messateTypeLabel = '喜欢'
        messageIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a> {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle}》</a></span>
        break
      case MessageType.COLLECTION:
        messateTypeLabel = '收藏'
        messageIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a> {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle}》</a></span>
        break
      case MessageType.FOLLOW:
        messateTypeLabel = '关注'
        messageIntro = <span>{messateTypeLabel}了您的创作者 <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorName}</a></span>
        break
    }
    return { msgContent: messageIntro, nickName }
  }

  getCommentInfo(item) {
    // const isCurrentAuthor = currAuthorId === item.userId
    // const showInput = !noShowInput && showCommentInputId === item.id
    const nickName = item.nickname
    const commentLabel = !item.parentId ? '评论' : '回复'
    const compositionLaterLabel = !item.parentId ? '' : '中的评论'
    // const compositionTypeLabel = item.type === 2 ? '作品' : '文章'
    const compositionTypeLabel = commentTypeLabelMap[item.compositionType]
    // const compositionPath = item.type === 2 ? `/shots/${item.relationId}` : `/article/${item.relationId}`
    const compositionPath = `/${commentTypeKeyMap[item.compositionType]}/${item.relationId}`
    // const isSelfNick = item.replyAuthorNickname === '您'
    const compositionAuthorLabel = item.compositionType === CommentTypes.TOPIC ? item.replyAuthorNickname : <a className="nickname" href={`/author/${item.compositionAuthorCode}`} target="_blank">{item.compositionAuthorNickname}</a>

    const msgContent = <span>{commentLabel}了 {compositionAuthorLabel} {compositionTypeLabel} <a className="title" href={compositionPath} target="_blank">《{item.compositionTitle}》</a> {compositionLaterLabel}</span>
    return { msgContent, nickName }
  }


  render() {
    const { letterUnreadData, messageStat, unreadEnquiryCount } = this.props
    const { showAll, msgTabType } = this.state

    // console.log(toJS(chatData))
    const isEnquiryType = msgTabType === 2
    const letterList = letterUnreadData.list || []
    const noticeList = letterUnreadData.notices || []
    const hasUnreadLetters = letterList.length > 0
    const hasUnreadNotices = noticeList.length > 0
    // const showAllBtn = !showAll && letterList.length > 5
    // const showMoreBtn = letterList.length > 3

    return (
      <div className="nav-drop-letter-panel">
        <div className="nav-drop-letter-header">
          <div className="nav-drop-tabs">
            {navTabs.map(item => (
              <div 
                key={item.id} 
                className={classnames('nav-drop-tab-item', { active: item.id === msgTabType })} 
                onClick={e => this.handleTabClick(item.id)}
              >
                <Badge count={item.id === 1 ? messageStat.totalCount : unreadEnquiryCount}>
                  <span className="tab-text">{item.label}</span>
                </Badge>
              </div>
            ))}
          </div>
        </div>
        {isEnquiryType && <div className={`nav-drop-letter-body${showAll ? ' all' : ''}`}>
          {!hasUnreadLetters && <EmptyComponent text="无消息" />}
          {hasUnreadLetters &&
            <Menu onSelect={e => this.handleSelect(e.item.props.record)}>
              {letterList.map(item => {
                // const isSystemSource = item.source === LetterSources.SYSTEM_NOTICE
                // const isSender = item.sender
                // const nickName = !isSender ? (item.senderNickName || item.senderName) : (item.receiverNickName || item.receiverName)
                // const avatar = !isSender ? item.senderAvatar : item.receiverAvatar
                return (
                  <MenuItem key={item.id} record={item} className="letter-nav-item-wrap">
                    <div className="letter-nav-item">
                      {/* <div className="letter-nav-item-avatar">
                          <Avatar icon="user" size={40} src={avatar || (isSystemSource ? noticeAvatar : '')} /> 
                        </div> */}
                      <div className="letter-nav-item-content">
                        <h4>
                          <span className="letter-type">{item.senderNickName}</span>
                          <span className="dot">·</span>
                          <span className="letter-time">{moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}</span>
                        </h4>
                        <div className="letter-content">{item.content}</div>
                      </div>
                    </div>
                  </MenuItem>
                )
              })}
            </Menu>}
        </div>}
        {!isEnquiryType && <div className={`nav-drop-letter-body${showAll ? ' all' : ''}`}>
          {!hasUnreadNotices && <EmptyComponent text="无消息" />}
          {hasUnreadNotices &&
            <Menu>
              {noticeList.map(item => {
                // const isSystemSource = item.source === LetterSources.SYSTEM_NOTICE
                const isSender = item.sender
                // const nickName = !isSender ? (item.senderNickName || item.senderName) : (item.receiverNickName || item.receiverName)
                // const avatar = !isSender ? item.senderAvatar : item.receiverAvatar
                const isSystemGroupSend = item.type === MessageType.NOTICE && item.noticeType === NoticeType.SYSTEM_GROUP_SEND

                let msgContent
                let nickName
                if (MessageType.NOTICE === item.type) {
                  const noticeInfo = this.getNoticeInfo(item)
                  msgContent = noticeInfo.msgContent
                  nickName = noticeInfo.nickName
                } else if (MessageType.COMMENT === item.type) {
                  const commentInfo = this.getCommentInfo(item)
                  msgContent = commentInfo.msgContent
                  nickName = commentInfo.nickName
                } else {
                  const messageInfo = this.getMessageInfo(item)
                  msgContent = messageInfo.msgContent
                  nickName = messageInfo.nickName
                }

                return (
                  <MenuItem
                    key={item.id}
                    record={item}
                    className="letter-nav-item-wrap"
                    onClick={e => {
                      if (isSystemGroupSend) {
                        this.handleSelect(item)
                      } else {
                        this.handleSelectNotice(item)
                        // location.href = '/personal/message'
                      }
                    }}
                  >
                    <div className="letter-nav-item">
                      {/* <div className="letter-nav-item-avatar">
                            <Avatar icon="user" size={40} src={avatar || (isSystemSource ? noticeAvatar : '')} /> 
                          </div> */}
                      <div className="letter-nav-item-content">
                        <h4>
                          <span className="letter-type">{nickName}</span>
                          <span className="dot">·</span>
                          <span className="letter-time">{moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}</span>
                        </h4>
                        <div className="letter-content">{msgContent}</div>
                      </div>
                    </div>
                  </MenuItem>
                )
              })}
            </Menu>}
        </div>}
        <div className="nav-drop-letter-footer">
          {/* {showAllBtn && <div className="show-all-btn" onClick={this.handleShowAll}>查看全部</div>} */}
          {isEnquiryType && <a className="show-all-btn" href="/personal/letter" >查看更多历史消息</a>}
          {!isEnquiryType && <a className="show-all-btn" href="/personal/message" >查看更多历史消息</a>}
        </div>
      </div>
    )
  }
}