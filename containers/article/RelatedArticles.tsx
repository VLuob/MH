import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { Row, Col } from 'antd'
import renderEmpty from 'antd/lib/config-provider/renderEmpty'

import PartLoading from '@components/features/PartLoading'
import ArticleItemSmall from '@components/article/ArticleItemSmall'
import { utils } from '@utils'

import { CompositionTypes } from '@base/enums'

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { compositionStore } = stores.store
  const { relatedArticleData } = compositionStore

  return {
      compositionStore,
      relatedArticleData, 
  }
})
@observer
export default class RelatedCompositions extends Component {
  componentDidMount() {
    // const { compositionStore, compositionId } = this.props

    // if (!compositionId) {
    //   return
    // }

    // compositionStore.fetchRelatedCompositions({
    //   compositionId,
    //   type: CompositionTypes.ARTICLE,
    //   page: 1,
    //   limit: 8,
    // })
  }

  handleLoadNext = () => {
    const { compositionStore, compositionId, relatedArticleData } = this.props
    const terms = relatedArticleData.terms
    compositionStore.fetchRelatedCompositions({
      compositionId,
      type: CompositionTypes.ARTICLE,
      page: terms.page + 1,
      limit: 4,
    })

  }

  render() {
    const { relatedArticleData } = this.props
    const relatedCompositions = relatedArticleData.list || []
    const relatedIsLastPage = relatedArticleData.isLastPage
    const relatedIsLoading = relatedArticleData.isLoading
    const isEmpty = !relatedIsLoading && relatedCompositions.length === 0

    return (
      <>
      {!isEmpty ? 
      <div className="releval-article">
        <div className="title">相关文章</div>
        {!relatedIsLoading &&
        <ul className="list">
          {relatedCompositions.map((item, index) => {
            return (
              <ArticleItemSmall
                key={index}
                id={item.compositionId || item.id}
                title={item.title}
                img={item.cover}
                author={item.authorName}
                code={item.authorCode}
                //time={item.gmtPublish}
                timeago={utils.timeago(item.gmtPublish)}
              />
            )
          })}
        </ul>}
        {/* {!relatedIsLoading && !relatedIsLastPage &&
              <div className="load-more-box" onClick={this.handleLoadNext}>
                  加载更多文章
              </div>} */}
            {/* {relatedIsLoading && <PartLoading />} */}
      </div> : null}
    </>
    )
  }
}