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

import { config } from '@utils/'
import { CommentSortTypes } from '@base/enums'
import { user } from '@base/system'
import comment from '@api/composition/comment';


const tabTypes = [
  {type: 1, label: '全部评论'},
  {type: 2, label: '我发出的'},
  {type: 3, label: '我收到的'},
]

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { commentStore, accountStore } = stores.store
  const { accountCommentData, messageCount } = commentStore
  

  return {
    commentStore,
    accountStore,
    accountCommentData, 
    messageCount,
    currentUser: accountStore.userClientInfo || {},
  }
})
@observer
export default class CommentBox extends Component {
  state = {
    type: 1,
    showCommentInputId: null,

    author: {},
  }
  componentDidMount() {
    this.requestCurrent()
    this.requestComments()
    this.initUserInfo()
  }

  initUserInfo() {
    const userInfo = user.getCookieUser()
    if (userInfo) {
      const author = userInfo || {}
      this.setState({author})
    }
  }

  requestComments(option={}) {
    const { commentStore, accountCommentData } = this.props
    const { type } = this.state
    const terms = accountCommentData.terms
    commentStore.fetchAccountComments({
      type: option.type || type,
      page: option.page || 1,
      size: option.size || terms.limit,
    })
  }

  requestCurrent() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { accountStore } = this.props
      accountStore.fetchGetClientCurrent()
    }
  }

  handleLoadNext = () => {
    const { commentStore, accountCommentData } = this.props
    const { type } = this.state
    const terms = accountCommentData.terms
    commentStore.fetchAccountComments({
      type,
      page: terms.page + 1,
      size: 5,
    })
  }

  handleTypeChange = (type) => {
    this.setState({type})
    this.requestComments({type})
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

    const { commentStore } = this.props
    
    Modal.confirm({
      title: '是否确认删除该评论',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        commentStore.deleteComment({
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
    

    const { commentStore, currentUser} = this.props
    const { author } = this.state
    commentStore.addComment({
      commentScope: 'account',
      token,
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
      client_code,
    }, (res) => {
      if (res.success) {
        if (parent_id) {
          this.setState({showCommentInputId: null})
        }
        
      }
    })
  }

  handleReplies = (comment_id) => {
    const { compositionId, commentStore } = this.props
    const { type } = this.state
    // console.log(comment_id)
    commentStore.fetchCommentReplies({
      composition_id: compositionId,
      comment_id,
      sort_type: type,
      page: 1,
      size: 100,
    })
  }

  handlePagination = (page, size) => {
    this.requestComments({ page, size, })
  }

  render() {
    const { 
      accountCommentData, 
      messageCount, 
      currentUser,
    } = this.props
    const { 
      type, 
      showCommentInputId,
      author,
    } = this.state

    const commentList = accountCommentData.list || []
    const isLastPage = accountCommentData.isLastPage
    const isLoading = accountCommentData.isLoading
    const isLoaded = accountCommentData.isLoaded
    const hasComments = isLoaded && commentList.length > 0
    const terms = accountCommentData.terms || {}
    const pageIndex = terms.page || 1
    const pageSize = terms.limit || 10
    const total = accountCommentData.total || 0

    // console.log(toJS(commentList))
    // console.log('isLoaded',hasComments)

    return (
      <div className="user-comment-container">
        <ul className="tabs">
          {tabTypes.map(item => {
            const dotCount = (messageCount > 0 && item.type === 3) ? <span className="dot-count">{messageCount}</span> : null
            return(<li 
                key={item.type} 
                className={classnames({'active': type === item.type})}
                onClick={e => this.handleTypeChange(item.type)}
              ><span className="tab-text">{item.label}{dotCount}</span></li>
            )
          })}
        </ul>
        <div className="comment-box-wrapper">
            {isLoading && <div className="load-spining"><Spin /></div>}
            {hasComments ?
            <div className="comment-box">
              <article className="comment-main">
                <ul className="comment-list">
                  {commentList.map((item, index) => (
                    <CommentItem
                      key={item.id + index}
                      index={index}
                      currAuthorId={currentUser.id}
                      showCommentInputId={showCommentInputId}
                      item={item}
                      subComment={item.replyAuthorComment ? [item.replyAuthorComment] : []}
                      onToggleInput={this.handleToggleInput}
                      onDelete={this.handleDeleteComment}
                      onSubmit={this.handleSubmit}
                      onReplies={this.handleReplies}
                    />
                  ))}
                </ul>
                <div className="comment-footer">
                    <Pagination
                      showQuickJumper
                      defaultCurrent={pageIndex}
                      current={pageIndex}
                      pageSize={pageSize}
                      total={total}
                      onChange={this.handlePagination}
                    />
                </div>
              </article>
            </div>
            : <EmptyComponent text='暂无评论' />}
        </div>

      </div>
    )
  }
}