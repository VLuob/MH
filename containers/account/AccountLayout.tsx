import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Row, Col } from 'antd'
import CIcon from '@components/widget/common/Icon'

import CommonIntro from '@components/common/CommonIntro'
const logoSvg = '/static/images/account/logo.svg'

@inject(stores => {
  const { adStore, accountStore, globalStore } = stores.store
  const { hotShots } = accountStore
  const { isMobileScreen } = globalStore
  return {
    adStore,
    accountStore,
    hotShots,
    isMobileScreen,
  }
})
@observer
export default class AccountLayout extends Component {
  componentDidMount() {
    const { resHotShots, accountStore } = this.props
    if (resHotShots) {
      accountStore.updateHotShots(resHotShots)
    }
  }
  handleAdClick = (id) => {
    const { adStore } = this.props
    adStore.actionAdClick({ id })
  }
  render() {
    const { children, hotShots: resHotShots, isMobileScreen } = this.props
    const hotShots = (resHotShots || []).slice(0, 9)
    // const hotShots = resHotShots ? Array(9).fill(resHotShots[0]) : []
    const hasShots = hotShots.length > 0

    return (
      <div className='account-container'>
        {!hasShots && !isMobileScreen &&
          <div className='account-bg'>
            <img src='https://resource.meihua.info/login_left_banner.png' alt='' />
          </div>}
        {hasShots && !isMobileScreen &&
          <div className="sign-left-container">
            <div className="sign-shots-wrapper">
              <Row className="sign-shots-list" type='flex' align='middle' justify='start' gutter={30}>
                {hotShots.map((item, index) => {
                  return (
                    <Col key={index}>
                      <CommonIntro
                        brand
                        authorDetail
                        hideActions
                        hideAuthorInfoBtns
                        item={item}
                        onAdClick={this.handleAdClick}
                      />
                    </Col>
                  )
                })}
              </Row>
            </div>
            <div className="sign-ad-wrapper">
              <div className="intro">注册登录后可以</div>
              <div className="desc">
                <span><CIcon name="search" /> 关注你感兴趣的作品</span>
                <span><CIcon name="publish" /> 免费发布你的作品</span>
              </div>
            </div>
          </div>}
        <div className='account-content'>
          <div className='account-box'>
            <a href='/'>
              <img src={logoSvg} alt='头部logo' className='tit-logo' />
            </a>
            {children}
          </div>
        </div>
      </div>
    )
  }
}