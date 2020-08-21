import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Pagination, Select } from 'antd'
import classnames from 'classnames'

import TopicItem from './TopicItem'
import ShareGroup from '@containers/shots/ShareGroup'
import EmptyComponent from '@components/common/EmptyComponent'
import CIcon from '@components/widget/common/Icon'
import PartLoading from '@components/features/PartLoading'
import { CompositionTypes, TopicSortTypes } from '@base/enums'
import { utils } from '@utils'
import { Router } from '@routes'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})


interface Props {
    
}

interface State {
}

@inject(stores => {
    const { topicStore } = stores.store
    const { topicsData, compositionTopicData, topicClassificationData } = topicStore
    return {
      topicStore,
      topicsData,
      compositionTopicData,
      classificationData: topicClassificationData,
    }
})
@observer
export default class CompositionTopicContainer extends Component<Props, State> {


    requestTopics(option) {
      const { query, topicStore } = this.props

      topicStore.fetchTopics({
        ...option,
        order_type: TopicSortTypes.NEW,
      })
    }

    changeRoute(option) {
      const { query } = this.props
      const queryObj = {
        ...query,
        ...option,
      }
      if (option.type === 0) {
        delete queryObj.type
      }
      const queryParams = Object.keys(queryObj).map(key => (`${key}=${queryObj[key]}`))
      const paramStr = queryParams.length === 0 ? '' : `?${queryParams.join('&')}`
      Router.pushRoute(`/topics` + paramStr)
    }

    handleLoadNext = () => {
      const { topicsData } = this.props
      const terms = topicsData.terms || {}
      const param = {
        ...terms,
        page: terms.page + 1,
      }
      this.requestTopics(param)
    }

    render() {
        const { topicsData, compositionTopicData: currentData, query } = this.props
        const currTopics = currentData.list || []
        const isCurrentEmpty = currentData.isEnd && currTopics.length === 0

        const topics = topicsData.list || []
        const isLoading = topicsData.isLoading
        const isEnd = topicsData.isLastPage

        const isEmpty = isEnd && topics.length === 0
        
        return (
            <div className='topic-contanier'>
                <div className="topic-header">
                  <div className="topic-top-title">
                    <div className="title">
                      <h1>{currentData.title}</h1>
                    </div>
                    <span className="total-count">当前共被{currentData.total}个专题收录</span>
                  </div>
                </div>
                

                <div className="topic-content">
                  <div className="topic-content-box">
                    {!isCurrentEmpty ? <div className="topic-list">
                      {currTopics.map((item, index) => {
                        return (
                          <TopicItem
                            key={index}
                            item={item}
                          />
                        )
                      })}
                    </div> : <EmptyComponent text="暂无相关专题" />}
                  </div>
                  <div className="topic-content-header">
                    <div className="topic-content-title">最新专题</div>
                  </div>
                  <div className="topic-content-box">
                      {!isEmpty ? 
                      <>
                        <div className="topic-list">
                          {topics.map((item, index) => {
                            return (
                              <TopicItem
                                key={index}
                                item={item}
                              />
                            )
                          })}
                        </div>
                        {!isEnd && <div className="collection-loadmore">
                          <LoadMore 
                            name={`加载更多`} 
                            num={3}
                            reqList={this.handleLoadNext} />
                        </div>}
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