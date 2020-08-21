import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Input, Modal, message, Spin, Button, Form, Avatar, Divider } from 'antd'
import classnames from 'classnames'
import moment from 'moment'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

import { LetterSendType, LetterSources, LetterStatus, LetterSenderTypes } from '@base/enums'
import { config } from '@utils'
import sysLetter from '@base/system/letter'

const noticeAvatar = '/static/images/common/notice_avatar.svg'

const FormItem = Form.Item
const TextArea = Input.TextArea

const sourceMap = sysLetter.filters.sourceMap

@inject(stores => {
  const { accountStore, letterStore } = stores.store
  const { chatUi, chatData, letterDetail } = letterStore
  const { currentUser } = accountStore

  return {
    accountStore,
    currentUser,
    letterStore,
    chatUi,
    chatData,
    letterDetail,
  }
})
@observer
export default class LetterChat extends Component {
  state = {
    msgContent: '',
  }

  prevTime = null

  handleClose = () => {
    const { letterStore } = this.props
    letterStore.close()
  }

  afterClose = () => {
    this.prevTime = null
  }

  handleContentChange = (e) => {
    const msgContent = e.target.value
    this.setState({msgContent})
  }

  clearInputContent = () => {
    this.setState({msgContent: ''})
  }

  handleSend = () => {
    const { msgContent } = this.state
    if (msgContent.trim() === '') {
      message.destroy()
      message.error('请输入询价内容')
      return
    }
    this.submitSend()
  }
  
  submitSend = async () => {
    const { chatData, letterStore } = this.props
    const { msgContent } = this.state
    let parentId = chatData.parentId
    // 在线联系，预先生成对话ID
    if (chatData.requestChatId) {
      const chatIdRes = await chatData.requestChatId()
      if (chatIdRes.success) {
        parentId = chatIdRes.data
      }
    }

    letterStore.sendLetter({
      type: chatData.type || LetterSendType.SEND,
      receiverType: chatData.receiverType,
      receiverId: chatData.receiverId,
      senderId: chatData.senderId,
      senderType: chatData.senderType,
      source: chatData.source,
      parentId,
      // parentId: chatData.parentId,
      content: msgContent.trim(),
    }, (res) => {
      if (res.success) {
        this.clearInputContent()
        message.success('发送成功')
      } else {
        message.error(res.data.msg)
      }
    })
  }
  // submitSend = () => {
  //   const { chatData, letterStore } = this.props
  //   const { msgContent } = this.state
  //   letterStore.sendLetter({
  //     type: chatData.type || LetterSendType.SEND,
  //     receiverType: chatData.receiverType,
  //     receiverId: chatData.receiverId,
  //     senderId: chatData.senderId,
  //     senderType: chatData.senderType,
  //     source: chatData.source,
  //     parentId: chatData.parentId,
  //     content: msgContent.trim(),
  //   }, (res) => {
  //     if (res.success) {
  //       this.clearInputContent()
  //       message.success('发送成功')
  //     }
  //   })
  // }

  renderChatContent = (item) => {
    const isArticleSource = item.source === LetterSources.ARTICLE_DETAIL
    const isShotsSource = item.source === LetterSources.SHOTS_DETAIL
    const isCompositionDetailSource = isShotsSource || isArticleSource
    const contactInfo = JSON.parse(item.contactInfo || '{}')
    const linkReg = /(http:\/\/|https:\/\/)((w|=|\?|.|\/|&|-)+)/g;
    const content = item.content.replace(linkReg, url => `<a href="${url}" target="_blank">${url}</a>`)
    const compositionTitle = (isCompositionDetailSource && item.sourceDetail && item.relationId) ? <a href={`/${isShotsSource ? 'shots' : 'article'}/${item.sourceRelationId}`} target="_blank">({item.sourceDetail})</a> : null
    const isEnquirySource = item.source === LetterSources.PUBLIC_ENQUIRY
    const isServiceSource = item.source === LetterSources.SERVICE
    const hasSource = !!item.sourceId
    const hasRelationId = !!item.relationId
    const enquirySourceUrl = hasSource ? `${config.CURRENT_DOMAIN}/enquiry/${item.sourceId}` : ''
    const serviceSourceUrl = hasRelationId ? `${config.CURRENT_DOMAIN}/service/${item.relationId}` : ''
    const showEnquiryExtra = isEnquirySource && hasSource
    const showServiceExtra = isServiceSource && hasRelationId
    const serviceExtend = JSON.parse(item.relationExtend || '{}')
    
    return (
      <div className="chat-item-content">
        {!!item.contactInfo 
        ? <div className="chat-msg-box">
          <div className="chat-msg-text">
            <p>需求：<span dangerouslySetInnerHTML={{__html: content}} /></p>
            <p>预算：{item.budget ? `${item.budget}` : '面议'}</p>
            <p>姓名：{contactInfo.realName}</p>
            <p>手机：{contactInfo.phone}</p>
            <p>邮箱：{contactInfo.email}</p>
            <p>微信：{contactInfo.wx}</p>
            <p>机构：{contactInfo.company}</p>
            <p>职务：{contactInfo.job}</p>
            <p>来源：{item.sourceChannel} {compositionTitle}</p>
          </div>
          {showServiceExtra && <div className="chat-msg-text chat-msg-extra chat-msg-source">
            <div className="label">咨询服务和清单：</div>
            <div className="label">{item.sourceDetail}</div>
            <div className="label">{serviceExtend.name}（{serviceExtend.price}元）</div>
            <div className="link-wrap"><a href={serviceSourceUrl} target="_blank">{serviceSourceUrl}</a></div>
          </div>}
        </div> 
        : <div className="chat-msg-box">
          <div className="chat-msg-text"><pre dangerouslySetInnerHTML={{__html: content}} /></div>
          {showEnquiryExtra && <div className="chat-msg-text chat-msg-extra chat-msg-source">
            <div className="label">咨询公开询价：</div>
            <div className="link-wrap"><a href={enquirySourceUrl} target="_blank">{enquirySourceUrl}</a></div>
          </div>}
          {showServiceExtra && <div className="chat-msg-text chat-msg-extra chat-msg-source">
            <div className="label">咨询服务和清单：</div>
            <div className="label">{item.sourceDetail}</div>
            <div className="label">{serviceExtend.name}（{serviceExtend.price}元）</div>
            <div className="link-wrap"><a href={serviceSourceUrl} target="_blank">{serviceSourceUrl}</a></div>
          </div>}
          {/* {item.status === LetterStatus.AUDITING && <span className="chat-msg-status auditing">待审核</span>} */}
          {/* {item.status === LetterStatus.REFUSED && <span className="chat-msg-status fail">发送失败</span>} */}
        </div>}
      </div>
    )
  }

  renderChatItem = (item, index) => {
    const isSender = item.sender
    const chatTime = item.gmtCreate
    let showTime = index === 0
    if (!this.prevTime || moment(chatTime).diff(this.prevTime, 'hour') >= 1) {
      showTime = true
      this.prevTime = chatTime
    }

    // const isEnquiry = item.type === 13 // 询价
    const isSystemSource = item.source === LetterSources.SYSTEM_NOTICE
    const avatar = item.senderAvatar || (isSystemSource ? noticeAvatar : '')
    // const contactInfo = JSON.parse(item.contactInfo || '{}')
    // const linkReg = /(http:\/\/|https:\/\/)((w|=|\?|.|\/|&|-)+)/g;
    // const content = item.content.replace(linkReg, url => `<a href="${url}" target="_blank">${url}</a>`)
    let renderArr = []
    if (showTime) {
      renderArr.push(<div className="letter-chat-time-line" key={`time-${item.id}`}>{moment(chatTime).format('YYYY-MM-DD HH:mm')}</div>)
    }
    renderArr.push(
      isSender 
      ? <div className="letter-chat-item right" key={item.id}>
          <div className="chat-item-content">
            {this.renderChatContent(item)}
          </div>
          <div className="chat-item-avatar">
            <Avatar icon="user" size={30} src={avatar} />
          </div>
        </div>
      : <div className="letter-chat-item left" key={item.id}>
        <div className="chat-item-avatar">
          <Avatar icon="user" size={30} src={avatar} />
        </div>
        {this.renderChatContent(item)}
      </div>
    )

    return renderArr
  }

  render() {
    const { chatUi, chatData, letterDetail } = this.props
    const { msgContent } = this.state

    // console.log(toJS(chatData))
    const receiverNickName = chatData.receiverNickName || chatData.receiverName
    const canSend = !!msgContent
    const isSystemSource = chatData.source === LetterSources.SYSTEM_NOTICE
    // const isSenderNotice = isSystemSource && chatData.receiverType === 0
    const isSenderNotice = isSystemSource 
    const isVisitor = chatData.receiverType === LetterSenderTypes.VISTOR

    return (
      <Modal
        width={700}
        footer={null}
        maskClosable={false}
        visible={chatUi.visible}
        onCancel={this.handleClose}
        afterClose={this.afterClose}
      >
        <div className="letter-chat-header">
          <div className="letter-chat-title">{receiverNickName}</div>
        </div>
        <div className="letter-chat-body">
          <div className="letter-chat-content">
            {chatUi.detailLoading && <PartLoading />}
            {!chatUi.detailLoading && letterDetail.map(this.renderChatItem)}
          </div>
        </div>
        <div className="letter-chat-footer">
          <div className="litter-chat-input">
            <TextArea 
              placeholder="这里输入询价内容..."
              value={msgContent}
              onChange={this.handleContentChange}
              // disabled={isSystemSource}
            />
          </div>
          <div className="litter-chat-submit">
            <Button 
              type="primary"
              disabled={!canSend}
              loading={chatUi.sendLoading}
              onClick={this.handleSend} 
            >发送</Button>
          </div>
          {(isSenderNotice || isVisitor) && 
          <div className="letter-disable-send-mask">
            {isVisitor ? <span>该消息不支持在线回复</span> : <span>系统消息,不支持回复</span>}
          </div>}
        </div>
      </Modal>
    )
  }
}