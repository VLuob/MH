import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Input, Modal, message, Spin, Pagination } from 'antd'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import CommentForm from '@components/comment/CommentForm'
import EmptyComponent from '@components/common/EmptyComponent'
import CommentItem from './CommentItem'
import MessageItem from './MessageItem'
import NoticeItem from './NoticeItem'

import { config } from '@utils/'
import { MessageType } from '@base/enums'
import { user } from '@base/system'

const tabTypes = [
  {type: 1, label: '全部评论'},
  {type: 2, label: '我发出的'},
  {type: 3, label: '我收到的'},
]

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { commentStore, accountStore, messageStore } = stores.store
  const { accountCommentData, messageCount } = commentStore
  const { messagesData } = messageStore
  

  return {
    commentStore,
    accountStore,
    accountCommentData, 
    messageCount,
    currentUser: accountStore.userClientInfo || {},

    messageStore,
    messagesData,
  }
})
@observer
export default class MessageContainer extends Component {
  constructor(props) {
    super(props)

    this.state = {
      type: props.type || MessageType.ALL,
      commentType: 1,
      showCommentInputId: null,
  
      author: {},
    }
  }

  static getDerivedStateFromProps(props, state) {
    if (props.type !== state.type) {
      return {
        type: props.type,
      }
    }
    return null
  }
  
  componentDidMount() {
    this.requestCurrent()
    // this.requestMessages()
    this.initUserInfo()
  }

  initUserInfo() {
    const userInfo = user.getCookieUser()
    if (userInfo) {
      const author = userInfo || {}
      this.setState({author})
    }
  }

  requestMessages(option={}) {
    const { messageStore, messagesData } = this.props
    const { type } = this.state
    messageStore.fetchMessages({
      type: type >= 0 ? type : messagesData.type,
      page: messagesData.page || 1,
      size: messagesData.size || 10,
      ...option,
    })
  }

  requestCurrent() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { accountStore } = this.props
      accountStore.fetchGetClientCurrent()
    }
  }


  handleTypeChange = (commentType) => {
    this.setState({commentType})
    this.requestMessages({commentType, page: 1})
  }

  handleToggleInput = (id) => {
    const { showCommentInputId } = this.state
    const commentInputId = id === showCommentInputId ? null : id
    this.setState({showCommentInputId: commentInputId})
  }

  handleDeleteComment = (comment_id, composition_id) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = `/signin?c=${location.href}`
      return
    }

    const { messageStore } = this.props
    
    Modal.confirm({
      title: '是否确认删除该评论',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        messageStore.deleteComment({
          commentScope: 'account',
          token,
          composition_id,
          comment_id,
        })
      },
    })
  }

  handleSubmit = (content, parent_id, reply_comment_id, composition_id, parentComment) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    // if (!token) {
    //   location.href = `/signin?c=${location.href}`
    //   return
    // }
    
    if (content.trim() === '') {
      message.error('请输入评论内容')
      return
    }
    

    const { messageStore, currentUser} = this.props
    messageStore.addComment({
      type: MessageType.COMMENT,
      token,
      client_code,
      composition_id,
      content,
      parent_id,
      reply_comment_id,
      userId: currentUser.id,
      nickname: currentUser.nickName,
      avatar: currentUser.avatar,
      compositionTitle: parentComment.compositionTitle,
      parentComment,
      gmtCreate: moment().valueOf(),
    }, (res) => {
      if (res.success) {
        if (parent_id) {
          this.setState({showCommentInputId: null})
        }
        
      }
    })
  }


  handlePagination = (page, size) => {
    this.requestMessages({ page, size, })
  }

  render() {
    const { 
      currentUser,

      messagesData,
    } = this.props
    const { 
      type, 
      commentType,
      showCommentInputId,
      author,
    } = this.state

    const isCommentType = type === MessageType.COMMENT

    const messageList = messagesData.list || []
    const isLoading = messagesData.isLoading
    const isLoaded = messagesData.isLoaded
    const hasMessages = isLoaded && messageList.length > 0
    const pageIndex = messagesData.page || 1
    const pageSize = messagesData.size || 20
    const total = messagesData.total || 0



    // console.log(toJS(messageList))

    return (
      <div className="user-comment-container">
        {isCommentType && 
        <ul className="tabs">
          {tabTypes.map(item => {
            return(<li 
                key={item.type} 
                className={classnames({'active': commentType === item.type})}
                onClick={e => this.handleTypeChange(item.type)}
              ><span className="tab-text">{item.label}</span></li>
            )
          })}
        </ul>}
        <div className="comment-box-wrapper">
            {isLoading && <div className="load-spining"><Spin /></div>}
            {hasMessages ?
            <div className="comment-box">
              <article className="comment-main">
                <ul className="comment-list">
                  {messageList.map((item, index) => {
                    const itemType = MessageType.COMMENT === item.type ? 'comment' : MessageType.NOTICE === item.type ? 'notice' : 'message'

                    let messageItem
                    switch (itemType) {
                      case 'comment':
                        messageItem = <CommentItem
                                        key={item.id + index}
                                        index={index}
                                        isLogin={true}
                                        currAuthorId={currentUser.id}
                                        showCommentInputId={showCommentInputId}
                                        item={item}
                                        subComment={item.replyAuthorComment ? [item.replyAuthorComment] : []}
                                        onToggleInput={this.handleToggleInput}
                                        onDelete={this.handleDeleteComment}
                                        onSubmit={this.handleSubmit}
                                      />
                        break
                      case 'notice':
                        messageItem = <NoticeItem
                                        key={index}
                                        item={item}
                                      />
                        break
                      case 'message':
                        messageItem = <MessageItem
                                        key={index}
                                        item={item}
                                      />
                        break
                    }
                    return messageItem
                  })}
                </ul>
                <div className="comment-footer">
                    <Pagination
                      showQuickJumper
                      hideOnSinglePage
                      defaultCurrent={pageIndex}
                      current={pageIndex}
                      pageSize={pageSize}
                      total={total}
                      onChange={this.handlePagination}
                    />
                </div>
              </article>
            </div>
            : <EmptyComponent text='暂无消息' />}
        </div>

      </div>
    )
  }
}