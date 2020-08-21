import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Input, Modal, message, Spin } from 'antd'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { toJS } from 'mobx';

import PartLoading from '@components/features/PartLoading'
import CommentForm from '@components/comment/CommentForm'
import CommentItem from './CommentItem'

import { config, utils } from '@utils/'
import { CommentSortTypes } from '@base/enums'
import { user } from '@base/system'
import comment from '@api/composition/comment';

const Textarea = Input.TextArea

const sortTypes = [
  {type: CommentSortTypes.HOT, label: '按热度'},
  {type: CommentSortTypes.TIME, label: '按时间'},
]

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { commentStore, accountStore } = stores.store
  const { commentData } = commentStore

  return {
    accountStore,
    commentStore,
    commentData, 
    currentUser: accountStore.userClientInfo || {},
  }
})
@observer
export default class CommentBox extends Component {
  state = {
    sort_type: CommentSortTypes.HOT,
    sortTypeChange: false,
    showCommentInputId: null,

    author: {},

    submitContent: '',
    submitTime: moment(),
  }
  componentDidMount() {
    const {  compositionId } = this.props

    if (!compositionId) {
      return
    }

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

  requestCurrent() {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      const { accountStore } = this.props
      accountStore.fetchGetClientCurrent()
    }
  }

  requestComments(option={}) {
    const { commentStore, compositionId, commentData, type } = this.props
    const { sort_type } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const terms = commentData.terms
    commentStore.fetchComments({
      type,
      composition_id: compositionId,
      sort_type: option.sort_type || sort_type,
      page: option.page || 1,
      size: option.size || terms.limit,
      token,
      client_code,
    })
  }

  handleLoadNext = () => {
    const { commentStore, compositionId, commentData } = this.props
    // const { sort_type } = this.state
    // const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    // const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const terms = commentData.terms
    // commentStore.fetchComments({
    //   composition_id: compositionId,
    //   sort_type,
    //   page: terms.page + 1,
    //   size: terms.limit,
    //   token,
    //   client_code,
    // })

    this.requestComments({
      page: terms.page + 1,
      size: terms.limit,
    })
  }

  handleSortTypeChange = (sort_type) => {
    if (sort_type !== this.state.sort_type) {
      this.setState({sort_type, sortTypeChange: true})
      this.requestComments({sort_type}, (res) => {
        if (res.success) {
          this.setState({sortTypeChange: false})
        }
      })
    }
  }

  handleToggleInput = (id) => {
    const { showCommentInputId } = this.state
    const commentInputId = id === showCommentInputId ? null : id
    this.setState({showCommentInputId: commentInputId})
  }

  handleDeleteComment = (comment_id) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = `/signin?c=${location.href}`
      return
    }

    const { compositionId, commentStore } = this.props
    
    Modal.confirm({
      title: '是否确认删除该评论',
      okText: '确定',
      cancelText: '取消',
      onOk: () => {
        commentStore.deleteComment({
          token,
          composition_id: compositionId,
          comment_id,
        })
      },
    })
  }

  handleSubmit = ({content, parentId, replyId, callback}) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token) {
      location.href = `/signin?c=${location.origin + location.pathname + location.search + '#comment'}`
      return
    }

    const { submitContent, submitTime } = this.state
    const length = utils.getStringLength(content.trim())
    let textLength = Math.ceil(length / 2)
    message.destroy()
    if (content.trim() === '') {
      message.error('请输入评论内容')
      return
    } else if (textLength > 300) {
      message.error('评论内容不得超过300汉字')
      return
    }
    
    if (content === submitContent && moment().diff(submitTime, 'second') <= 60) {
      message.error('相同的内容请隔1分钟再进行发布')
      return
    }

    const { commentStore, compositionId, currentUser, type} = this.props
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    this.setState({submitContent: content, submitTime: moment()})

    commentStore.addComment({
      token,
      client_code,
      type,
      composition_id: compositionId,
      content,
      parent_id: parentId,
      reply_comment_id: replyId,
      userId: currentUser.id,
      nickname: currentUser.nickName,
      avatar: currentUser.avatar,
      gmtCreate: moment().valueOf(),
    }, (res) => {
      if (res.success) {
        if (parentId) {
          this.setState({showCommentInputId: null})
        }
        if (callback) {
          callback()
        }
      } else {
        this.setState({submitContent: ''})
      }
    })
  }

  handleReplies = (comment_id) => {
    const { compositionId, commentStore } = this.props
    const { sort_type } = this.state
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    commentStore.fetchCommentReplies({
      composition_id: compositionId,
      comment_id,
      sort_type: sort_type,
      page: 1,
      size: 500,
      token,
      client_code,
    })
  }

  handleFavor = (id, action, favored) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (!token && favored) {
      message.destroy()
      message.error('您已经点了喜欢')
      return
    }
    const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)

    const { commentStore } = this.props
    commentStore.fetchFavor({
      token,
      client_code,
      id,
      type: 3,
      action,
    }, (res) => {
      if (res.success) {
        message.destroy()
        if (action === 1) {
          message.success('喜欢成功')
        } else {
          message.success('取消喜欢成功')
        }
      }
    })
  }

  handleLogin() {
    const loc = window.location
    const url = '/signin?c=' + encodeURIComponent(loc.origin + loc.pathname + loc.search + '#comment')
    location.href = url
  }

  render() {
    const { commentData, currentUser, hideFirstForm } = this.props
    const { 
      sort_type, 
      sortTypeChange,
      showCommentInputId,
      author,
    } = this.state

    const commentList = commentData.list || []
    const isLastPage = commentData.isLastPage
    const isLoading = commentData.isLoading
    const isLoaded = commentData.isLoaded
    const isEmptyComment = isLoaded && commentList.length === 0
    const isLogin = user.isLogin()

    // console.log(toJS(commentList))

    return (
      <>
      <div className="comment-box">
        <a id="comment" name="comment"></a>
        <div className="comment-header">
          <span className="title">评论</span>
        </div>
        {!hideFirstForm && <CommentForm
          isLogin={isLogin}
          placeholder="发表评论..."
          onSubmit={(content, callback) => this.handleSubmit({content, callback})}
        />}
        {!isEmptyComment && 
        <article className="comment-main">
          <div className="header">
            <ul className="sort-tabs">
              {sortTypes.map(item => (
                <li key={item.type} className={classnames({'active': sort_type === item.type})} onClick={e => this.handleSortTypeChange(item.type)}>{item.label}</li>
              ))}
            </ul>
          </div>
          <div className="comment-list-wrapper">
            {sortTypeChange && isLoading && <div className="load-spining"><Spin /></div>}
            <ul className="comment-list">
              {commentList.map((item, index) => (
                <CommentItem
                  key={item.id + index}
                  index={index}
                  isLogin={isLogin}
                  currAuthorId={currentUser.id}
                  showCommentInputId={showCommentInputId}
                  item={item}
                  subComment={item.subComment || {}}
                  onToggleInput={this.handleToggleInput}
                  onDelete={this.handleDeleteComment}
                  onSubmit={this.handleSubmit}
                  onReplies={this.handleReplies}
                  onFavor={this.handleFavor}
                />
              ))}
            </ul>
          </div>
          <div className="comment-footer">
          {isLoaded && !isLastPage &&
            <div className="load-more-box" onClick={!isLoading ? this.handleLoadNext : null}>
              {isLoading ? '加载中...' : '加载更多'}
            </div>
          }
          </div>
        </article>}
        
        {isEmptyComment && <div className="comment-empty"><div className="line" /><span className="text">暂无评论{!isLogin ? '，点击登录抢沙发' : ''}</span></div>}
      </div>
    </>
    )
  }
}