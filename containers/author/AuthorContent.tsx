import { Component } from 'react'
import dynamic from 'next/dynamic'
import { Tabs } from 'antd'
import jsCookie from 'js-cookie'

import { Router } from '@routes'
import { AuthorType } from '@base/enums'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums'
import { config } from '@utils'
import { toJS } from 'mobx'


const { TabPane } = Tabs

// import FavoriteContainer from './FavoriteContainer'
// import FansContainer from './FansContainer'
// import FocusContainer from './FocusContainer'
import ServiceContainer from './ServiceContainer'
import ArticleContainer from './ArticleContainer'
import ProductionContainer from './ProductionContainer'
import AboutContainer from './AboutContainer'
import PartLoading from '@components/features/PartLoading'
import AuthorBottomBar from './AuthorBottomBar'
import EnquiryBtnMobile from './EnquiryBtnMobile'

interface Props {
  id: number,
  tab: string,
  type: number,
  query: any,
}

interface State {

}

const tabList = ['service', `shots`, `article`, `about`, `like`, `focus`,
  `followers`, `shots`, `article`, `followers`]

@inject(stores => {
  const { authorStore, accountStore, globalStore } = stores.store
  const { isMobileScreen } = globalStore
  const { currentUser } = accountStore
  const {
    briefInfo,
    favorData,
    fansParam,
    followParam,
    articleParam,
    favorCondition,
    fetchFavorList,
    compositionData,
    compositionParam,
    articleData,
    authorServiceData,
    fetchGetComposition,
    fetchGetClientAuthorFans,
    fetchGetAuthorAbout,
    fetchGetClientAuthorFollow,
    fetchGetAuthorFavorCount,
    fetchAuthorServices,
  } = authorStore

  return {
    isMobileScreen,
    currentUser,
    briefInfo,
    favorData,
    fansParam,
    followParam,
    articleParam,
    favorCondition,
    fetchFavorList,
    compositionData,
    compositionParam,
    articleData,
    authorServiceData,
    fetchGetClientAuthorFans,
    fetchGetComposition,
    fetchGetAuthorAbout,
    fetchGetClientAuthorFollow,
    fetchGetAuthorFavorCount,
    fetchAuthorServices,
  }
})
@observer
export default class AuthorContent extends Component<Props, State> {
  state = {
    loadingTab: true
  }

  componentDidMount() {
    this.setState({ loadingTab: false })
  }

  changeTabs = key => {
    const {
      query,
      currentUser,
      briefInfo,
      fansParam,
      followParam,
      articleParam,
      compositionParam,
      fetchGetComposition,
      fetchGetAuthorAbout,
      fetchGetClientAuthorFans,
      fetchGetClientAuthorFollow,
      fetchGetAuthorFavorCount,
      fetchAuthorServices,
    } = this.props
    const { code, tab, type } = query
    const isCurrentAuthor = currentUser.id === briefInfo.userId
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    // console.log('curr user', toJS(currentUser), toJS(briefInfo))

    switch (key) {
      case 'article':
        fetchGetComposition({ code, token, type: CompositionTypes.ARTICLE, ...articleParam, page: 1 }).then(res => {
          if (!res.success && res.data.msg === 'Error Token') {
            if (currentUser.id === briefInfo.userId) {
              console.log('current user')
            }
          }
        })

        break
      case 'service':
        fetchAuthorServices({code, pageIndex: 1, pageSize: 10})
        break
      case 'about':
        fetchGetAuthorAbout({ code })

        break
      case 'like':
        fetchGetAuthorFavorCount({ code })

        break
      case 'focus':
        fetchGetClientAuthorFollow({ code, ...followParam })

        break
      case 'followers':
        fetchGetClientAuthorFans({ code, ...fansParam })

        break
      case 'shots':
      default:
        fetchGetComposition({ code, token, type: CompositionTypes.SHOTS, ...compositionParam, page: 1 }).then(res => {
          if (!res.success && res.data.msg === 'Error Token') {
            if (currentUser.id === briefInfo.userId) {
              console.log('current user')
            }
          }
        })

        break
    }

    //FIXME: 修复Router.pushRoute和window.location.href
    if (type) {
      if (key) {
        // window.location.href = `/teams/${code}/${key}`
        // Router.pushRoute(`/teams/${code}/${key}`)
      } else {
        // window.location.href = `/teams/${code}`
        // Router.pushRoute(`/teams/${code}`)
      }
    } else {
      if (key) {
        Router.pushRoute(`/author/${code}/${key}`)
      } else {
        Router.pushRoute(`/author/${code}`)
      }
    }
  }

  getActiveKey() {
    const { query, briefInfo } = this.props
    let key = 'shots'
    if (query.tab) {
      key = query.tab
    } else if (briefInfo.compositionCount > 0) {
      key = 'shots'
    } else if (briefInfo.serviceQuantity > 0) {
      key = 'service'
    } else if (briefInfo.articleCount > 0) {
      key = 'article'
    } else {
      key = 'about'
    }
    return key
  }

  render() {
    const { loadingTab } = this.state
    const { query, tabProps, briefInfo, authorInfo, contentProps, isMobileScreen, compositionData, articleData, authorServiceData } = this.props
    const { id, tab, code } = query

    const activeKey = this.getActiveKey()
    const hideEnquiry = [AuthorType.EDITOR, AuthorType.BRANDER].includes(briefInfo.type)
    const showBottomBar = isMobileScreen && !hideEnquiry

    if (tabList.some(l => l === tab) || tab === undefined) {
      return (
        <>
          <div className='org-content-container'>
            <Tabs
              size={`large`}
              animated={false}
              forceRender={true}
              className='user-tabs'
              activeKey={activeKey}
              onChange={this.changeTabs || {}}
            >
              <TabPane tab={`服务 ${briefInfo.serviceQuantity || 0}`} key="service">
                <ServiceContainer query={query} />
              </TabPane>
              <TabPane tab={`作品 ${briefInfo.compositionCount || 0}`} key="shots">
                <ProductionContainer query={query} />
              </TabPane>
              <TabPane tab={`文章 ${briefInfo.articleCount || 0}`} key="article">
                <ArticleContainer query={query} />
              </TabPane>
              {!isMobileScreen && <TabPane tab="关于" key="about">
                <AboutContainer query={query} authorInfo={authorInfo} aboutResultData={tabProps.aboutResultData || {}} />
              </TabPane>}
              {/* <TabPane tab='喜欢' key='like'>
                            <FavoriteContainer query={query} favorResultData={tabProps.favorResultData} />
                        </TabPane>
                        <TabPane tab='关注' key='focus'>
                            <FocusContainerWithNoSSR query={query} />
                        </TabPane>
                        <TabPane tab='粉丝' key='followers'>
                            <FansContainerWithNoSSR query={query} />
                        </TabPane> */}
            </Tabs>

          </div>
          {showBottomBar && <EnquiryBtnMobile />}
        </>
      )
    } else {
      return (
        <div>404</div>
      )
    }
  }
}