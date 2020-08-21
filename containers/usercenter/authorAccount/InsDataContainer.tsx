import { Component } from 'react'
import dynamic from 'next/dynamic'
import { FuncType, AuthorType, InsSetType, AuthorManageBaseTab } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'
import { Tabs } from 'antd'
import { Router } from '@routes'

import ClassifyTab from '@components/common/ClassifyTab'

const InsDomainContainerWithNoSSR = dynamic(() => import('./InsDomainContainer'), {
  loading: () => <p></p>,
  ssr: false
})

const InsDataFormWithNoSSR = dynamic(() => import('../form/InsDataForm'), {
  loading: () => <p></p>,
  ssr: false
})
const PersonalDataFormWithNoSSR = dynamic(() => import('../form/PersonalDataForm'), {
  loading: () => <p></p>,
  ssr: false
})

// const InsServerCustomContentWithNoSSR = dynamic(() => import('./InsServerCustomContent'), {
//     loading: () => <p></p>,
//     ssr: false
// })

const InsWatermarkContainerWithNoSSR = dynamic(() => import('./InsWatermarkContainer'), {
  loading: () => <p></p>,
  ssr: false
})

const InsEmailSubContainerWithNoSSR = dynamic(() => import('./InsEmailSubContainer'), {
  loading: () => <p></p>,
  ssr: false
})

// const InsServerContentWithNoSSR = dynamic(() => import('./InsServerContent'), {
//     loading: () => <p></p>,
//     ssr: false
// })

const menuList = [{
  id: AuthorManageBaseTab.INFO,
  name: `基本信息`
}, /* {
    id: 1,
    name: `产品服务`
}, {
    id: 2,
    name: `服务客户`
}, */

// {
//     id: AuthorManageBaseTab.SUBSCRIBE,
//     name: `邮件订阅`
// },
{
  id: AuthorManageBaseTab.WATERMARK,
  name: `水印设置`
},
{
  id: AuthorManageBaseTab.DOMAIN,
  name: `域名设置`
},
]

const { TabPane } = Tabs

@inject(stores => {
  const { userCenterStore } = stores.store
  const { commonAuthor, serverInfo, fetchGetSetting, fetchGetOrgService, fetchGetSettingBaseInfo, fetchGetSubscriptions, fetchGetSettingMember } = userCenterStore

  return {
    commonAuthor,
    serverInfo,
    fetchGetSetting,
    fetchGetOrgService,
    fetchGetSettingBaseInfo,
    fetchGetSubscriptions,
    fetchGetSettingMember,
  }
})
@observer
export default class InsDataContainer extends Component {
  state = {
    currentKey: AuthorManageBaseTab.INFO,
  }

  componentDidMount() {
    const { query } = this.props
    this.changeTab(query.tab)
  }

  handleTabChange = (key) => {
    const { query } = this.props
    const { id } = query
    this.changeTab(key)
    Router.pushRoute(`/teams/${id}/account/${key}`)
  }

  changeTab = key => {
    const { query, fetchGetSetting, fetchGetOrgService, fetchGetSettingBaseInfo, fetchGetSubscriptions, fetchGetSettingMember } = this.props
    const { id } = query
    // console.log('key', key)
    this.setState({ currentKey: key })
    switch (key) {
      case AuthorManageBaseTab.INFO:
        fetchGetSettingBaseInfo({ org_id: id })

        break
      // case 1:
      //     fetchGetOrgService({ type: 0, org_id: id })

      //     break
      // case 2:
      //     fetchGetOrgService({ type: 1, org_id: id })

      //     break
      case AuthorManageBaseTab.WATERMARK:
        fetchGetSetting({ type: FuncType.WATERMARK, org_id: id })

        break
      case AuthorManageBaseTab.DOMAIN:
        fetchGetSetting({ type: FuncType.DOMAIN, org_id: id })

        break
      case AuthorManageBaseTab.SUBSCRIBE:
        // fetchGetSetting({ type: FuncType.EMAIL, org_id: id })
        fetchGetSubscriptions()
        fetchGetSettingMember()

        break
      default:
        fetchGetSettingBaseInfo({ org_id: id })
        break
    }
  }

  render() {
    const { currentKey } = this.state
    const { query, commonAuthor } = this.props
    const tab = query.tab || AuthorManageBaseTab.INFO
    let renderComponent

    const isPersonal = commonAuthor.type === AuthorType.PERSONAL

    switch (tab) {
      // case InsSetType.PROSERVER:
      //     renderComponent = <InsServerContentWithNoSSR query={query} />

      //     break
      // case InsSetType.SERVERCUS:
      //     renderComponent = <InsServerCustomContentWithNoSSR query={query} />

      //     break
      case AuthorManageBaseTab.DOMAIN:
        renderComponent = <InsDomainContainerWithNoSSR query={query} />

        break
      case AuthorManageBaseTab.WATERMARK:
        renderComponent = <InsWatermarkContainerWithNoSSR query={query} userInfo={commonAuthor} />

        break
      case AuthorManageBaseTab.SUBSCRIBE:
        renderComponent = <InsEmailSubContainerWithNoSSR query={query} />

        break
      default:
        renderComponent = isPersonal ? <PersonalDataFormWithNoSSR query={query} userCenterInfo={commonAuthor} isAuthor /> : <InsDataFormWithNoSSR query={query} userCenterInfo={commonAuthor} />
        break
    }

    return (
      <div className='ins-data-container'>
        <Tabs className='user-tabs' size='large' animated={false}>
          <TabPane tab='创作者资料' key='data' style={{ color: '#191919' }}>
            <div className='ins-data-wrapped'>
              <ClassifyTab
                notMore
                borderless
                keys={tab}
                tabList={menuList}
                className='ins-menu-list'
                changeFn={this.handleTabChange}
              // initialFn={true} 
              />
              {renderComponent}
            </div>
          </TabPane>
        </Tabs>
      </div>
    )
  }
}