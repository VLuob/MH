import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Row, Col, Pagination } from 'antd'

import TopicItem from '@components/topic/TopicItem'
import ShareGroup from '@containers/shots/ShareGroup'
import EmptyComponent from '@components/common/EmptyComponent'
import { CompositionTypes } from '@base/enums'
import { utils } from '@utils'

interface Props {
    
}

interface State {
    current: number
}

@inject(stores => {
    const { topicStore } = stores.store

    return {
      topicStore,
      topicsData: topicStore.topicsData || {},
      topicStatistics: topicStore.topicStatistics || {},
    }
})
@observer
export default class TopicContainer extends Component<Props, State> {

    componentDidMount() {
      const { topicStore, resultTopicsData, resultTopicStatistics } = this.props
      topicStore.setTopicData(resultTopicsData || {}, {})
      topicStore.setTopicStatistics(resultTopicStatistics)
    }

    handlePagination = (page, size) => {
      const { topicStore } = this.props
      topicStore.fetchTopics({page, size})
    }

    render() {
        const { topicStore, topicsData, topicStatistics } = this.props
        const topics = topicsData.list || []
        const total = topicsData.total
        const terms = topicsData.terms || {}
        const current = terms.page || 1
        const pageSize = terms.limit || 12

        const isEmpty = topics.length === 0
        
        return (
            <div className='topic-contanier'>
                <div className="topic-header">
                  {/* <div className="topic-header-bg">
                    <img src="https://resource.meihua.info/FuLrn1kuRes0efB9IJPNERLj2o43" alt=""/>
                  </div>
                  <div className="topic-header-content">
                    <div className="content-wrapper">
                      <div className="title">专题列表</div>
                      <ul className="topic-outline">
                        <li>
                          <div className="name">专题数量</div>
                          <div className="count">{topicStatistics.feature_count || 0}</div>
                        </li>
                        <li>
                          <div className="name">作品数量</div>
                          <div className="count">{topicStatistics.works_count || 0}</div>
                        </li>
                        <li>
                          <div className="name">文章数量</div>
                          <div className="count">{topicStatistics.article_count || 0}</div>
                        </li>
                      </ul>
                    </div>
                  </div> */}
                  <div className="topic-top-title">
                    <h1>专题</h1>
                    <span className="total-count">当前共{total}个专题</span>
                  </div>
                </div>
                <div className="topic-content">
                  <div className="topic-content-box">
                    {!isEmpty ? 
                    <>
                      <div className="topic-list">
                        {topics.map(item => {
                          return (
                            <TopicItem
                              key={item.id}
                              item={item}
                            />
                          )
                        })}
                      </div>
                      <div className="topic-pagination">
                        <Pagination
                          showQuickJumper
                          hideOnSinglePage
                          total={total}
                          defaultCurrent={current}
                          current={current}
                          pageSize={pageSize}
                          onChange={this.handlePagination}
                        />
                      </div>
                    </> : <EmptyComponent text="暂无专题" />}
                  </div>
                  <ShareGroup
                    hideActions
                    scope="topic"
                    title={"梅花网专题"}
                    cover={'https://resource.meihua.info/FuLrn1kuRes0efB9IJPNERLj2o43'}
                  />
                </div>
            </div>
        )
    }
}