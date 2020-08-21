import { Component } from 'react'
import { Row, Col, Icon } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums'

import LoadMore from '@components/common/LoadMore'
import DetailHeader from '@components/author/DetailHeader'
import ArticleBriefComp from '@components/common/ArticleBriefComp'
import ArticleItem from '@components/article/ArticleItem'

let num = 3
@inject(stores => {
    const { followStore } = stores.store
    const { followArticleData } = followStore

    return {
        followStore,
        followArticleData,
    }
})
@observer
export default class FollowArticleContainer extends Component {
  componentDidMount() {
      this.requestArticles()
  }

  requestArticles({page, size}={}) {
      const { followStore } = this.props
      followStore.fetchFollowCompositions({
          composition_type: CompositionTypes.ARTICLE,
          page: page || 1,
          size: size || 10,
      })
  }

  handleNext = () => {
      const { followArticleData } = this.props
      this.requestArticles({page: followArticleData.page + 1})
  }

  render() {
    const { followArticleData } = this.props
    const articleList = followArticleData.list || []
    const { isLastPage, isLoading, isLoaded } = followArticleData

      return (
          <div className='article-container'>
              <DetailHeader meta={`关注的创作者最新文章`} />
              <div className='follow-article-box'>
                  <div className="article-list">
                      {articleList.map(item => {
                          return <ArticleItem 
                                  item={item} 
                                  key={item.compositionId}
                                  id={item.compositionId}
                                  title={item.title}
                                  cover={item.cover}
                                  summary={item.summary}
                                  authorCode={item.authorCode}
                                  author={item.authorName}
                                  view={item.views}
                                  time={item.gmtPublished}
                                  classification={item.classificationName}
                                />
                      })}
                  </div>
                  {!isLastPage && isLoaded && <LoadMore name={`加载更多`} num={num}
                      reqList={this.handleNext} />}
              </div>
          </div>
      )
  }
}