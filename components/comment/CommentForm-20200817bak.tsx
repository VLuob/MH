import { PureComponent } from 'react'
import classnames from 'classnames'
import { Input, Button } from 'antd'
import { utils } from '@utils/'

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
    this.setState({commentText, textCurrent})
  }

  handleSubmit = (e) => {
    console.log('submit')
    this.toSubmit()
  }

  handleKeyUp = (e) => {
    // console.log(e.ctrlKey, e.keyCode)
    if (e.ctrlKey && e.keyCode === 13) {
      this.toSubmit()
    }
  }

  toSubmit() {
    const { onSubmit } = this.props
    const { commentText } = this.state
    if (onSubmit) {
      onSubmit(commentText, () => {
        this.setState({commentText: ''})
      })
    }
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
      <div className="comment-form">
        <div className="comment-input">
          <Textarea 
            placeholder={placeholder}
            value={commentText}
            onChange={this.handleTextChange}
            onKeyUp={this.handleKeyUp}
          />
          <span className={classnames('length-tips', {error: textCurrent >= textMax})}>{textCurrent}/{textMax}</span>
          {!isLogin &&
          <div className="login-info-box">
            <span className="login-info">
              <span className="text">大牛，快登录点评一下吧</span>
              <a href="/signup" target="_blank">注册</a>|<a onClick={this.handleLogin}>登录</a>
            </span>
          </div>}
        </div>
        <div className="footer">
          <span className="intro-label">Ctrl+Enter</span><Button type="primary" onClick={this.handleSubmit} >{btnText || '发表评论'}</Button>
        </div>
      </div>
    )
  }
}