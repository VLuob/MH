import { PureComponent } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import moment from 'moment'
import { Avatar, Icon } from 'antd'

import { MessageType, NoticeType, AuthorType, LetterSendType, LetterSources, LetterDetailType } from '@base/enums'

@inject((stores: any) => {
  const { letterStore, accountStore, serviceStore } = stores.store
  const { currentUser, } = accountStore
  return {
    letterStore,
    accountStore,
    serviceStore,
    currentUser,
  }
})
export default class CommentItem extends PureComponent {


  handleOpenEnquiry = (record) => {
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
      detailType: LetterDetailType.NOTICE,
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

  handleOpenService = async (record) => {
    const { serviceStore } = this.props
    if (record.status === 2) {
      window.open(`/service/${record.relationId}`)
    } else {
      const serviceId = record.relationId
      const response = await serviceStore.fetchServicePreviewCode({serviceId})
      if (response.success) {
        const previewCode = response.data
        window.open(`/service/preview/${previewCode}`)
      }
    }
  }

  render() {
    const { item, ...props } = this.props

    const isSystemGroupSend = item.noticeType === NoticeType.SYSTEM_GROUP_SEND
    const isServiceAudit = item.noticeType === NoticeType.SERVICE_AUDIT 

    let noticeAvatar = '/static/images/common/notice_avatar.svg'
    let noticeTypeLabel = ''
    let noticeStatusLabel = ''
    let showTitle = ''
    let relationPath
    let linkText = ''
    let refuseContent = null
    let msgContent = null
    let msgNameLabel = '系统消息'
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
        break
      case NoticeType.AUTHOR_PASSED:
        noticeTypeLabel = '作者'
        noticeStatusLabel = '审核通过了'
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
        break
      case NoticeType.SYSTEM_GROUP_SEND: {
        const linkReg = /(http:\/\/|https:\/\/)((w|=|\?|.|\/|&|-)+)/g;
        // showTitle = `${item.senderNickName}消息·${moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}`
        const content = (item.content || '').replace(linkReg, url => `<a href="${url}" target="_blank">${url}</a>`)
        msgContent = <span dangerouslySetInnerHTML={{__html: content}} />
        linkText = '查看消息'
        if (item.senderType !== 0) {
          msgNameLabel = item.senderNickName 
          noticeAvatar = item.senderAvatar
        }
        break
      }
      case NoticeType.ENQUIRY_AUDIT: {
        msgContent = <span dangerouslySetInnerHTML={{__html: item.content}} />
        if (item.status === 2) {
          relationPath = `/enquiry/${item.relationId}`
          linkText = '查看询价'
        } else {
          relationPath = `/enquiry/edit/${item.relationId}`
          linkText = '编辑询价'
        }
        break
      }
      case NoticeType.SERVICE_AUDIT: {
        const titleReg = /(《.*?》)/g
        // showTitle = `${item.senderNickName}消息·${moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}`
        // console.log(item.content.replace(titleReg, (a,b,c,d) => console.log(a,b,c,d)))
        // // console.log(titleReg.exec(item.content))
        let relationUrl
        if (item.status === 2) {
          relationUrl = `/service/${item.relationId}`
          linkText = '查看服务'
        } else {
          relationUrl = `/service/edit/${item.relationId}?s=${item.status}`
          linkText = '编辑服务'
        }
        const content = (item.content || '').replace(titleReg, title => `<a class="title" href="${relationUrl}" target="_blank">${title}</a>`)
        msgContent = <span dangerouslySetInnerHTML={{__html: content}} />

        // const execResult = titleReg.exec(item.content)
        // let str = item.content
        // let start = execResult.index
        // let title = execResult[0]
        // let titleLength = title.length
        // let startStr = str.substring(0, start)
        // let endStr = str.substring(start + titleLength)
        // msgContent = <span>{startStr}<a className="title" onClick={e => this.handleOpenService(item)}>{title}</a>{endStr}</span>
        // linkText = '查看服务'
        break
      }
    }

    return (
      <li className="comment-item">
        <div className="comment-avatar">
          <Avatar icon="user" size={50} src={noticeAvatar} />
        </div>
        
        <div className="comment-content-wrapper">
          <div className="comment-content">
            <div className="comment-info-wrap">
              <span className="author-info">
                <span className="nick">
                  {msgNameLabel}
                </span>
                <span className="dot">·</span>
                <span className="time">
                  {moment(item.gmtCreate).format('YYYY-MM-DD HH:mm')}
                </span>
              </span>
              
              <span className="comment-actions">
                {relationPath &&
                <a className="action btn-reply" href={relationPath} target="_blank" >
                  {linkText}
                </a>}
                {isSystemGroupSend && 
                <a className="action btn-reply" onClick={e => this.handleOpenEnquiry(item)} >
                  {linkText}
                </a>}
                {isServiceAudit && 
                <a className="action btn-reply" onClick={e => this.handleOpenService(item)} >
                  {linkText}
                </a>}
              </span>
            </div>
            <div className="comment-message">
              <div className="reply-author-intro" style={{marginLeft: '0'}}>
                {msgContent}
              </div>
              {refuseContent &&
              <div className="message-refuse">
                拒绝原因：{refuseContent}
              </div>}
            </div>
          </div>
        </div>

      </li>
    )
  }
}