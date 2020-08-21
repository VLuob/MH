import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import jsCookie from 'js-cookie'
import { Button } from 'antd'

import ArticleItem from '@components/article/ArticleItem'
import PartLoading from '@components/features/PartLoading'
import SubscribeComp from '@components/common/SubscribeComp'
import SubTab from '@components/widget/common/SubTab'
import BottomTabBar from '@containers/common/BottomTabBar'
import SideProductBox from '@containers/common/SideProductBox'
import SecondHeader from '@containers/common/SecondHeader'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import SideAdBox from '@components/common/SideAdBox'
import HotArticles from './HotArticles'
import RecommendAuthors from './RecommendAuthors'
import AdBanner from './AdBanner'

import { subTabList } from '@constants/article/list'
import { Router } from '@routes'
import { CompositionTypes } from '@base/enums'
import { config } from '@utils'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

interface Props {
  serverClientCode: string
  compositionStore: any
  compositionsData: any
}

interface State {

}

@inject(stores => {
  const { compositionStore, globalStore, accountStore, adStore } = stores.store
  const { currentUser } = accountStore
  const { compositionsData } = compositionStore
  const { serverClientCode, isMobileScreen } = globalStore
  const { articleHomeAds } = adStore

  return {
    compositionStore,
    compositionsData,
    serverClientCode,
    currentUser,
    isMobileScreen,
    articleHomeAds,
  }
})
@observer
export default class ArticleContainer extends Component<Props, State> {

  changeRoute({ sort }) {
    const urlPath = sort ? `!${sort}` : ''
    Router.pushRoute(`/article${urlPath}`)
  }

  handleLoadNext = () => {
    const { compositionsData, compositionStore, serverClientCode } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const terms = {
      ...compositionsData.terms,
      page: compositionsData.terms.page + 1,
    }
    compositionStore.fetchCompositions({ terms, client: serverClientCode, token })
  }

  reqArticleList = (option, routeOption) => {
    const { compositionStore, compositionsData, serverClientCode } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)

    const terms = {
      ...option,
      page: 1,
      limit: compositionsData.terms.limit,
      recommended: false,
    }
    compositionStore.fetchCompositions({ terms, client: serverClientCode, token })
    this.changeRoute(routeOption)
  }

  handleRefresh = () => {
    const { compositionsData, compositionStore, serverClientCode } = this.props
    const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
    const terms = {
      ...compositionsData.terms,
      page: 1,
    }
    compositionStore.fetchCompositions({ terms, client: serverClientCode, token })
  }

  handlePublish = () => {
    const { currentUser } = this.props
    const isLogin = !!currentUser.id
    if (isLogin) {
      if (currentUser.hasAuthor) {
        window.location.href = '/article/new'
      } else {
        window.location.href = '/creator'
      }
    } else {
      window.location.href = `/signin?c=${encodeURIComponent(window.location.pathname)}`
    }
  }

  render() {
    const { compositionsData, currentUser, isMobileScreen, articleHomeAds } = this.props
    const articleList = compositionsData.list
    const isLastPage = compositionsData.isLastPage
    const isLoading = compositionsData.isLoading
    const rightSideAds1 = articleHomeAds['f_a_s_l_t_r_1'] || []

    return (
      <>
        {isMobileScreen &&
          <MbNavigatorBar
            hideBackBtn
            showTitle
            title="文章"
          />}
        {!isMobileScreen &&
          <SecondHeader
            hideForm
            navContainerClass="article-list-container"
            currentPage="article"
            navs={['shots', 'author', 'enquiry']}
            extra={
              <div>
                <Button type="primary" onClick={this.handlePublish}>发布文章</Button>
              </div>
            }
          />}
        <div className='article-contanier'>
          <div className='article-layout'>
            <main className='article-content'>
              {isMobileScreen && <div className='article-sub-tab sub-tab-content mb-filter-bar'>
                <SubTab
                  compositionType={CompositionTypes.ARTICLE}
                  subTabList={subTabList}
                  condition={compositionsData.terms}
                  reqList={this.reqArticleList}
                  userInfo={currentUser}
                />
              </div>}
              <AdBanner resultNewArticles={articleList || []} />
              {!isMobileScreen && <div className='article-sub-tab sub-tab-content'>
                <SubTab
                  compositionType={CompositionTypes.ARTICLE}
                  subTabList={subTabList}
                  condition={compositionsData.terms}
                  reqList={this.reqArticleList}
                  userInfo={currentUser}
                />
              </div>}
              <div className="article-list-wrapper" style={{ position: 'relative' }}>
                <div className='article-list'>
                  {articleList.map(item => (
                    <ArticleItem
                      item={item}
                      key={item.compositionId}
                      id={item.compositionId}
                      title={item.title}
                      cover={item.cover}
                      summary={item.summary}
                      authorCode={item.authorCode}
                      author={item.authorName}
                      view={item.views}
                      time={item.gmtPublish}
                      classification={item.classificationName}
                    />
                  ))}
                </div>
                {!isLoading && !isLastPage &&
                  <LoadMore
                    name={`加载更多文章`}
                    num={3}
                    reqList={this.handleLoadNext}
                  />}
                {isLoading && <PartLoading float mask />}
              </div>
            </main>
            <aside className='article-sider'>
              <SideAdBox
                adList={rightSideAds1}
              />
              <SideProductBox className="article-list-side-box" />
              <HotArticles />
              <hr className='separator' />
              <RecommendAuthors />
              <SubscribeComp
                className='side-position'
                wxName={`微信公众号：梅花网`}
                smName={`微信小程序：梅花网`}
              />
            </aside>
          </div>
        </div>
        {isMobileScreen && <BottomTabBar currentPath="article" onRefresh={this.handleRefresh} />}
      </>
    )
  }
}