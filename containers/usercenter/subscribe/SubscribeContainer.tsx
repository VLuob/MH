import { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { Tabs, Icon, message } from 'antd'

import { Router } from '@routes'
import PartLoading from '@components/features/PartLoading'

// 我的创作

const EmailSubContainerWithNoSSR = dynamic(() => import('../account/EmailSubContainer'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

@inject(stores => {
  const { accountStore, userCenterStore } = stores.store
  const { userClientInfo, } = accountStore
  const {  fetchGetSubscriptions, fetchGetSettingMember, fetchGetSettingBaseInfo } = userCenterStore
  return {
    accountStore,
    userClientInfo,
    fetchGetSubscriptions,
    fetchGetSettingMember,
  }
})
@observer
export default class SubscribeContainer extends Component {
  componentDidMount() {
    const { query } = this.props
    this.myDataChangeTabs(query.tab || '')
  }

  myDataChangeTabs = key => {
    const { fetchGetSettingMember, fetchGetSubscriptions, } = this.props

    switch(key) {
        case 'subscribe':
        default:
          fetchGetSubscriptions()
          fetchGetSettingMember()
          break
    }
  }


  render() {
    const { query, } = this.props

    return (
      <div >
        <Tabs 
          className='user-tabs' 
          size='large' 
          defaultActiveKey={query.tab || 'subscribe'}
          activeKey={query.tab || 'subscribe'}
          animated={false} 
          //onChange={this.handleDataTabChange}
        >
          <TabPane tab='邮件订阅' key='subscribe'>
              <EmailSubContainerWithNoSSR />
          </TabPane>
      </Tabs>
      </div>
    )
  }
}