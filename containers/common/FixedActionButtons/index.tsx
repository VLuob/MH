import { Component } from 'react'
import { Avatar, Popover, Divider } from 'antd'
import { utils } from '@utils'
import classNames from 'classnames'
import QRCode from 'qrcode.react'
import debounce from 'lodash/debounce'
import CIcon from '@components/widget/common/Icon'

import './index.less'



export default class FixedActionButtons extends Component {
  constructor(props) {
    super(props)
    this.documentScroll = debounce(this.documentScroll, 200)
  }

  state = {
    show: false,
    scrollDistance: 100
  }

  static getDerivedStateFromProps(props, state) {
    return {
      scrollDistance: props.scrollDistance || state.scrollDistance
    }
  }

  componentDidMount() {
    window.addEventListener('scroll', this.documentScroll, false)
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.documentScroll, false)
  }

  documentScroll = () => {
    const { scrollDistance } = this.state
    const scrollTop = document.body.scrollTop || document.documentElement.scrollTop

    if (scrollTop > scrollDistance) {
      this.setState({ show: true })
    } else {
      this.setState({ show: false })
    }
  }

  handleReturnTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth"
    });
  }

  handleEnquiry = () => {
    const { onEnquiry } = this.props
    if (onEnquiry) {
      onEnquiry()
    }
  }

  render() {
    const { asPath = '', onEnquiry, enquiryButton } = this.props
    const { show } = this.state

    const paramIndex = asPath.indexOf('?')
    const paramLength = paramIndex > 0 ? paramIndex : asPath.length
    const currentPath = paramIndex > 0 ? asPath.substring(0, paramLength) : asPath
    const isHome = currentPath === '/'
    const currentUrl = typeof window === 'undefined' ? '' : location.href

    return (
      <div className="fixed-action-box">
        <div className="fixed-action-box-wrapper">
          {onEnquiry && <div className='fixed-action-button'>
            <Popover
              content="询价"
              placement="left"
            >
              <a onClick={this.handleEnquiry}>
                <span className="fixed-action-icon">
                  <CIcon name="enquiry" />
                </span>
              </a>
            </Popover>
          </div>}
          {enquiryButton}
          <div className='fixed-action-button'>
            <Popover
              content={
                <div className="fixed-action-qrcode-box">
                  <div className="fixed-action-qrcode-item">
                    <div className="title">梅花网微信公众号</div>
                    <div className="qrcode-content">
                      <img src="/static/images/account/wx-qrcode.png" alt="" />
                    </div>
                  </div>
                  <div className="fixed-action-qrcode-item">
                    <div className="title">
                      手机浏览梅花网
                                        </div>
                    <div className="qrcode-content">
                      {isHome ? <img src="/static/images/meihua_home_qrcode.png" alt="" />
                        : <QRCode
                          className="rc-qrcode"
                          value={currentUrl}
                          size={100}
                        />}
                    </div>
                  </div>
                </div>
              }
              placement="left"
            >
              <a>
                <span className="fixed-action-icon">
                  <CIcon name="qrcode" />
                </span>
              </a>
            </Popover>
          </div>
          <div className='fixed-action-button'>
            <Popover
              content="联系我们"
              placement="left"
            >
              <a href='/contact' target='_blank'>
                <span className="fixed-action-icon">
                  <CIcon name="phone" />
                </span>
              </a>
            </Popover>
          </div>
          <div className='fixed-action-button'>
            <Popover
              content="意见反馈"
              placement="left"
            >
              <a href='https://mingdao.com/form/037ad2adcca84916b76ac4994c94994e' target='_blank'>
                <span className="fixed-action-icon">
                  <CIcon name="feedback" />
                </span>
              </a>
            </Popover>
          </div>
          <div className={classNames(
            'fixed-action-button to-fixed-action',
            { 'fixed-action-box-showing': show }
          )} onClick={this.handleReturnTop}>
            <Popover
              content="返回顶部"
              placement="left"
            >
              <a>
                <span className="fixed-action-icon">
                  <CIcon name="go-top" />
                </span>
              </a>
            </Popover>
          </div>
        </div>
      </div>
    )
  }
}