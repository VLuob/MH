import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import jsCookie from 'js-cookie'
import moment from 'moment'
import { Input, message } from 'antd'

import { utils, config } from '@utils'

import RenderGeetestBind from '@containers/common/RenderGeetestBind'

const Search = Input.Search

@inject(stores => {
  const { globalStore, accountStore, commentStore } = stores.store
  const { serverClientCode, isMobileScreen } = globalStore
  const { currentUser } = accountStore
  return {
    globalStore,
    commentStore,
    serverClientCode,
    isMobileScreen,
    currentUser,
  }
})
@observer
class CommentInput extends Component {
  state = {
    commentText: '',
    textCurrent: 0,
    textMax: 300,

    submitContent: '',
    submitTime: moment(),
  }

  handleTextChange = (e) => {
    const commentText = e.target.value || ''
    const length = utils.getStringLength(commentText.trim())
    let textCurrent = Math.ceil(length / 2)
    this.setState({ commentText, textCurrent })
  }

  handleSearch = (bindGt) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    if (token) {
      this.toSubmit()
    } else {
      bindGt()
    }
  }

  handleKeyUp = (e, bindGt) => {
    const { isMobileScreen } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    // console.log(e.ctrlKey, e.keyCode)
    if (isMobileScreen && e.keyCode === 13) {
      if (token) {
        this.toSubmit()
      } else {
        bindGt()
      }
    } else if (e.ctrlKey && e.keyCode === 13) {
      if (token) {
        this.toSubmit()
      } else {
        bindGt()
      }
    }
  }

  toSubmit(option={}) {
    const { onSubmit } = this.props
    const { commentText } = this.state
    if (onSubmit) {
      onSubmit({
        ...option,
        content: commentText,
        callback: () => {
          this.setState({ commentText: '' })
        },
      })
    } else {
      this.handleSubmit({
        ...option,
        content: commentText,
        callback: () => {
          this.setState({ commentText: '' })
        }
      })
    }
  }

  handleSubmit = ({ content, parentId, replyId, gtResult, callback }) => {
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    // if (!token) {
    //   location.href = `/signin?c=${location.origin + location.pathname + location.search + '#comment'}`
    //   return
    // }

    console.log('content', content)

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

    const { commentStore, compositionId, currentUser = {}, type, serverClientCode } = this.props
    // const client_code = jsCookie.get(config.COOKIE_MEIHUA_CLIENT_CODE)
    const client_code = serverClientCode

    this.setState({ submitContent: content, submitTime: moment() })

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
      ...gtResult,
    }, (res) => {
      if (res.success) {
        if (parentId) {
          this.setState({ showCommentInputId: null })
        }
        if (callback) {
          callback()
        }
      } else {
        this.setState({ submitContent: '' })
      }
    })
  }

  handleGeetestSuccess = (gtResult) => {
    this.toSubmit({ gtResult })
  }

  render() {
    const { placeholder, inputType, inputProps } = this.props
    const { commentText, textCurrent, textMax } = this.state


    const isSearchType = inputType === 'search'

    return (
      <RenderGeetestBind render={({ bindGt }) => <>
        {isSearchType ?
          <Search
            {...inputProps}
            placeholder={placeholder || '大牛，快点评一下吧…'}
            value={commentText}
            onChange={this.handleTextChange}
            onKeyUp={e => this.handleKeyUp(e, bindGt)}
            onSearch={e => this.handleSearch(bindGt)}
          />
          : <Input
            {...inputProps}
            placeholder={placeholder || '大牛，快点评一下吧…'}
            value={commentText}
            onChange={this.handleTextChange}
            onKeyUp={e => this.handleKeyUp(e, bindGt)}
          />}
      </>}
        onSuccess={this.handleGeetestSuccess}
      />
    )
  }
}

export default CommentInput