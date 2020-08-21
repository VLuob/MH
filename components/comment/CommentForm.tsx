import { PureComponent } from 'react'
import classnames from 'classnames'
import { Input, Button } from 'antd'
import { utils } from '@utils/'

import RenderGeetestBind from '@containers/common/RenderGeetestBind'

const Textarea = Input.TextArea

export default class CommentForm extends PureComponent {
  state = {
    commentText: '',
    textCurrent: 0,
    textMax: 300,
  }

  handleTextChange = (e) => {
    const commentText = e.target.value || ''
    const length = utils.getStringLength(commentText.trim())
    let textCurrent = Math.ceil(length / 2)
    this.setState({ commentText, textCurrent })
  }

  handleSubmit = (bindGt) => {
    const { isLogin } = this.props
    if (!this.handleContentVerify()) {
      return
    }
    // console.log('submit')
    if (!isLogin) {
      bindGt()
    } else {
      this.toSubmit()
    }
  }

  handleKeyUp = (e, bindGt) => {
    const { isLogin } = this.props
    // console.log(e.ctrlKey, e.keyCode)
    if (e.ctrlKey && e.keyCode === 13) {
      if (!this.handleContentVerify()) {
        return
      }
      if (!isLogin) {
        bindGt()
      } else {
        this.toSubmit()
      }
    }
  }

  handleContentVerify = () => {
    const { checkContentVerify } = this.props
    const { commentText } = this.state
    if (checkContentVerify && !checkContentVerify(commentText)) {
      return false
    } 
    return true
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
    }
  }

  handleGeetestSuccess = (gtResult) => {
    this.toSubmit({gtResult})
  }

  handleLogin() {
    const loc = window.location
    const url = '/signin?c=' + encodeURIComponent(loc.origin + loc.pathname + loc.search + '#comment')
    location.href = url
  }

  render() {
    const { placeholder, btnText, isLogin } = this.props
    const { commentText, textCurrent, textMax } = this.state

    return (
      <RenderGeetestBind render={({ bindGt }) => (
        <div className="comment-form">
          <div className="comment-input">
            <Textarea
              placeholder={placeholder}
              value={commentText}
              onChange={this.handleTextChange}
              onKeyUp={e => this.handleKeyUp(e, bindGt)}
            />
            <span className={classnames('length-tips', { error: textCurrent >= textMax })}>{textCurrent}/{textMax}</span>
            {/* {!isLogin &&
            <div className="login-info-box">
              <span className="login-info">
                <span className="text">大牛，快登录点评一下吧</span>
                <a href="/signup" target="_blank">注册</a>|<a onClick={this.handleLogin}>登录</a>
              </span>
            </div>} */}
          </div>
          <div className="footer">
            <span className="intro-label">Ctrl+Enter</span><Button type="primary" onClick={e => this.handleSubmit(bindGt)} >{btnText || '发表评论'}</Button>
          </div>
        </div>
      )} 
      onSuccess={this.handleGeetestSuccess}
      />
    )
  }
}