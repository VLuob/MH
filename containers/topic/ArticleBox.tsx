import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import debounce from 'lodash/debounce';
import { Row, Col, Pagination } from 'antd'
import ArticleItem from '@components/article/ArticleItem'
import CommonIntro from '@components/common/CommonIntro'



export default class ArticleBox extends Component {

  render() {
    const { articles, totalCount, terms, onPagination } = this.props
    const current = terms.page || 1
    const pageSize = terms.size || 10

    return (
      <div className="topic-article-box">
        <div className="article-list-wrapper">
          <div className="article-list">
            {articles.map((item, index) => (
              <ArticleItem
                item={item}
                key={item.compositionId + index}
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
            ))}
          </div>
          <div className="topic-pagination">
            <Pagination
              showQuickJumper
              hideOnSinglePage
              total={totalCount}
              current={current}
              pageSize={pageSize}
              onChange={onPagination}
            />
          </div>
        </div>
      </div>
    )
  }
}