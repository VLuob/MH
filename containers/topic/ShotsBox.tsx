import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import debounce from 'lodash/debounce';
import { Row, Col, Pagination } from 'antd'
import ArticleItem from '@components/article/ArticleItem'
import CommonIntro from '@components/common/CommonIntro'



export default class ShotsBox extends Component {

  render() {
    const { shots, gutter, totalCount, terms, onPagination, onFavor, worksLimit } = this.props
    const current = terms.page || 1
    const pageSize = terms.size || worksLimit || 8

    return (
      <div className="topic-shots-box">
          <Row type='flex' align='middle' justify='start' gutter={gutter}>
          {shots.map((item, index) => (
            <Col key={item.compositionId + index}>
              <CommonIntro 
                  brand
                  item={item} 
                  authorDetail
                  onFavor={onFavor}
              />
          </Col>
          ))}
          </Row>
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
    )
  }
}