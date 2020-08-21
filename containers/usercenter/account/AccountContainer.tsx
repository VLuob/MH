import { Component } from 'react'
import { toJS } from 'mobx'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { Tabs, Icon, message } from 'antd'

import { Router } from '@routes'
import { FuncType } from '@base/enums'
import PartLoading from '@components/features/PartLoading'

// 我的创作

const EmailSubContainerWithNoSSR = dynamic(() => import('./EmailSubContainer'), {loading: () => <PartLoading />, ssr: false})
const SafeContainerWithNoSSR = dynamic(() => import('./SafeContainer'), {loading: () => <PartLoading />, ssr: false})
const DomainContainerWithNoSSR = dynamic(() => import('./DomainContainer'), {loading: () => <PartLoading />, ssr: false})
const OAuthContainerWithNoSSR = dynamic(() => import('./OAuthContainer'), {loading: () => <PartLoading />, ssr: false})

const WatermarkContainerWithNoSSR = dynamic(() => import('./WatermarkContainer'), {loading: () => <PartLoading />, ssr: false})
const UserDataFormWithNoSSR = dynamic(() => import('../form/UserDataForm'), {loading: () => <PartLoading />, ssr: false})

const { TabPane } = Tabs

@inject(stores => {
  const { accountStore, userCenterStore } = stores.store
  const { userClientInfo, fetchGetClientCurrent } = accountStore
  const { domainSettingInfo, fetchGetSetting, fetchGetSubscriptions, fetchGetSettingMember, fetchGetSettingBaseInfo } = userCenterStore
  return {
    accountStore,
    userClientInfo,
    domainSettingInfo,

    fetchGetClientCurrent,
    fetchGetSetting,
    fetchGetSettingBaseInfo,
    fetchGetSubscriptions,
    fetchGetSettingMember,
  }
})
@observer
export default class AccountContainer extends Component {
  componentDidMount() {
    const { query } = this.props
    this.myDataChangeTabs(query.tab || '')
    this.handleEmailBind()
  }

  // 我的资料切换
  handleDataTabChange = (key) => {
    const { query } = this.props
    this.myDataChangeTabs(key)
    Router.pushRoute(`/personal/${query.menu}/${key}`)
  }
  myDataChangeTabs = key => {
    const { fetchGetSetting, userCenterInfo, fetchGetSettingMember, fetchGetSubscriptions, fetchGetClientCurrent, fetchGetSettingBaseInfo } = this.props

    switch(key) {
        case 'domain':
            fetchGetSetting({ type: FuncType.DOMAIN, org_id: userCenterInfo.authorId })

            break
        // case 'watermark':
        //     fetchGetSetting({ type: FuncType.WATERMARK, org_id: userCenterInfo.authorId })

        //     break
        case 'safe':
            fetchGetClientCurrent()
            // fetchGetSettingBaseInfo({ type: AuthorType.PERSONAL })

            break
        case 'subscribe':
            fetchGetSubscriptions()
            fetchGetSettingMember()

            break
        case 'info':
        default:
            // if(userCenterInfo.authorId) {
            //     fetchGetSettingBaseInfo({ org_id: userCenterInfo.authorId })
            // }
            fetchGetClientCurrent()
            break
    }
  }

  handleEmailBind = () => {
    const { query, accountStore } = this.props
    const bindToken = query.token
    if (bindToken) {
        accountStore.fetchChangeEmailBind({bindToken}, (res) => {
            if (res.success) {
                accountStore.fetchGetClientCurrent()
            } 
            Router.pushRoute(`/personal/account/safe`)
        })
    }
  }

  render() {
    const { query, userCenterInfo, userClientInfo, domainSettingInfo } = this.props
    const { userDomain, independentDomain } = domainSettingInfo

    return (
      <div >
        <Tabs 
          className='user-tabs' 
          size='large' 
          defaultActiveKey={query.tab || 'info'}
          activeKey={query.tab || 'info'}
          animated={false} 
          onChange={this.handleDataTabChange}
        >
          <TabPane tab='个人资料' key={'info'}>
            <UserDataFormWithNoSSR 
              userCenterInfo={userCenterInfo} 
              query={query} 
              onChangeTab={this.myDataChangeTabs}
            />
          </TabPane>
          {/* <TabPane tab='邮件订阅' key='subscribe'>
              <EmailSubContainerWithNoSSR />
          </TabPane> */}
          <TabPane tab='安全设置' key='safe'>
              {query.tab === 'safe' && <SafeContainerWithNoSSR query={query} userInfo={userClientInfo} />}
          </TabPane>
          {/* {userCenterInfo.authorId && <TabPane tab='水印设置' key='watermark'>
              <WatermarkContainerWithNoSSR userInfo={userCenterInfo} />
          </TabPane>} */}
          {/* {userCenterInfo.authorId && <TabPane tab='域名设置' key='domain'>
              <DomainContainerWithNoSSR userDomain={userDomain} independentDomain={independentDomain} />
          </TabPane>} */}
          <TabPane tab='账户绑定' key='bind'>
              <OAuthContainerWithNoSSR />
          </TabPane>
      </Tabs>
      </div>
    )
  }
}