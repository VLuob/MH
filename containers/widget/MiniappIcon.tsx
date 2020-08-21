import React, { Component } from 'react'
import { Button, message, Spin } from 'antd'

import CustomIcon from '@components/widget/common/Icon'
import { globalApi } from '@api'

export default class MiniappIcon extends Component {
  state = {
    loading: false,
    wxacode: '',
  }

  mouseEnter = (e) => {
    const { wxacode, loading } = this.state
    if (wxacode || loading) {
      return
    }
    const { params } = this.props
    const param = { scene: '', ...params }
    this.setState({ loading: true })
    globalApi.getWxacode(param).then(res => {
      this.setState({ loading: false })
      if (res.success) {
        const wxacode = res.data
        this.setState({ wxacode })
      } else {
        message.destroy()
        message.error('小程序码生成错误，请再次移入鼠标重新生成')
      }
    })
  }


  render() {
    const { placement, className, style } = this.props
    const { wxacode } = this.state
    return (
      <span
        className={`miniapp-icon ${className || ''}`}
        style={style}
        onMouseEnter={this.mouseEnter}
      >
        <CustomIcon name="mini-app" />
        <span className={`miniapp-overlay ${placement || ''}`}>
          {!wxacode && <span className="loading">
            <Spin />
          </span>}
          {wxacode && <span className="wxacode"><img src={wxacode} alt="微信小程序码" /></span>}
          <span className="text">{wxacode ? '扫码进入小程序查看' : '小程序码生成中...'}</span>
        </span>
      </span>
    )
  }
}