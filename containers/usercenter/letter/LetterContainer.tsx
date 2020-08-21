import { Component } from 'react'
import { toJS } from 'mobx'
import dynamic from 'next/dynamic'
import classnames from 'classnames'
import { Tabs, Icon, message } from 'antd'

import { Router } from '@routes'
import PartLoading from '@components/features/PartLoading'

const LetterBoxNoSSR = dynamic(() => import('./LetterBox'), {loading: () => <PartLoading />, ssr: false})
const PublicEnquiryBoxNoSSR = dynamic(() => import('./PublicEnquiryBox'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

export default class LetterContainer extends Component {
  state = {
    currentTab: this.props.query.tab || '',
  }

  handleTabChange = (tab) => {
    this.setState({currentTab: tab})
    Router.pushRoute(`/personal/letter` + (tab ? `/${tab}` : ''))
  }

  render() {
    const { query } = this.props
    const isPublicType = query.tab === 'public'

    return (
      <div className='common-container user-common user-letter'>
          <div className="user-header">
            <div className="user-header-content">
              <div className="user-header-title">我的询价</div>
            </div>
          </div>
          <div className="user-sub-tabs">
            <div className={classnames('user-sub-tab', {active: !isPublicType})} onClick={e => this.handleTabChange('')}>未公开询价</div>
            <div className={classnames('user-sub-tab', {active: isPublicType})} onClick={e => this.handleTabChange('public')}>公开询价</div>
          </div>
          <div className="user-content">
            {isPublicType && <PublicEnquiryBoxNoSSR query={query} />}
            {!isPublicType && <LetterBoxNoSSR query={query} />}
          </div>
      </div>
    )
  }
}