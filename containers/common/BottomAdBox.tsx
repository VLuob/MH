import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { Icon } from 'antd'
import classnames from 'classnames'
import jsCookie from 'js-cookie'
import Portal from '@components/common/Portal'
import './BottomAdBox.less'

import { config } from '@utils'


@inject(stores => {
  const { adStore } = stores.store

  const { actionAdClick } = adStore

  return {
      actionAdClick
  }
})
@observer
export default class BottomAdBox extends Component {
  state = {
    show: false,
  }

  componentDidMount() {
    setTimeout(() => {
      this.handleVisible(true)
    }, 500)
  }

  handleClose = () => {
    this.handleVisible(false)

    const { id, adItem={}, pageCode } = this.props
    const options = { 
        expires: 30, 
        domain: config.COOKIE_MEIHUA_DOMAIN, 
        path: '/' 
    }

    let cookieValue = adItem.contentType === 2 ? `${id}-${adItem.description}` : `${id}-${adItem.image}` 

    jsCookie.set(`bottom_ad_${pageCode || 'p_g'}`, cookieValue, options)
    
  }
  
  handleVisible = (flag) => {
    this.setState({show: !!flag})
  }

  handleClick = (e) => {
    const { id, actionAdClick } = this.props
    actionAdClick({ id })
    this.handleClose()
  }

  render() {
    const { show } = this.state
    const { adItem={} } = this.props
    const isTextType = adItem.contentType === 2

    let showTitle = false
    let showSpread = false
    if (!isTextType) {
      const setting = JSON.parse(adItem.setting || '{"appSetting":{"appOpenScreenImages":null},"showSetting":{"title":false,"recommendation":false}}')
      const showSetting = setting.showSetting || {}
      showTitle = !!showSetting.title
      showSpread = !!showSetting.recommendation
    }

    return (
      <Portal selector='#popupModal'>
        <div className={classnames("bottom-ad-box", {show})}>
            <div className="btn-close" onClick={this.handleClose}><Icon type="close" /></div>
            <div className="bottom-ad-body">
              {isTextType 
              ? <div className="bottom-ad-text-box">
                <div className="ad-text-title"><a href={adItem.link} target="_blank" onClick={this.handleClick}>{adItem.title}</a></div>
                <div className="ad-text-content">
                <a href={adItem.link} target="_blank" onClick={this.handleClick}>{adItem.description}</a>
                </div>
                <div className="ad-text-footer">
                  <a href={adItem.link} target="_blank" onClick={this.handleClick}>查看详情</a>
                </div>
              </div>
              : <div className="bottom-ad-img-box">
                <a href={adItem.link} target="_blank" onClick={this.handleClick}>
                  <img src={`${adItem.image}?imageMogr2/thumbnail/!320x230r/size-limit/50k/gravity/center/crop/320x230`} alt={adItem.title}/>
                {showTitle && <div className="ad-title"><div className="ad-title-text">{adItem.title}</div></div>}
                </a>
                {showSpread && <span className="ad-spreads">推广</span>}
              </div>}
            </div>
        </div>
      </Portal>
    )
  }
}