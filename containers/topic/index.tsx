import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import { toJS } from 'mobx'
import { Pagination, Select, Dropdown, Menu } from 'antd'
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


const imgTypeAll = '/static/images/common/topic_type_all.png'

const SelectOption = Select.Option

const sortKeys = [
  {key: 'recommend', value: TopicSortTypes.RECOMMEND, name: '编辑推荐'},
  {key: 'new', value: TopicSortTypes.NEW, name: '最新'},
]

const orderKeyMap = {
  'new': TopicSortTypes.NEW,
  'recommend': TopicSortTypes.RECOMMEND,
}

interface Props {
    
}

interface State {
}

@inject(stores => {
    const { topicStore, globalStore } = stores.store
    const { isMobileScreen } = globalStore

    return {
      isMobileScreen,
      topicStore,
      topicsData: topicStore.topicsData || {},
      classificationData: topicStore.topicClassificationData || {},
    }
})
@observer
export default class TopicContainer extends Component<Props, State> {
    state = {
      reloading: false
    }

    requestTopics({page=1, classification_id, ...option}) {
      const { query, topicStore, topicsData } = this.props
      const terms = topicsData.terms || {}
      let classificationId 
      if (classification_id || classification_id === 0) {
        classificationId = classification_id || undefined
      } else {
        classificationId = query.type
      }
      topicStore.fetchTopics({
        ...terms,
        classification_id: classificationId,
        order_type: orderKeyMap[query.sort] || TopicSortTypes.RECOMMEND,
        page,
        ...option,
      }).then(res => {
        this.setState({reloading: false})
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

    handlePagination = (page, size) => {
      this.requestTopics({page, size})
    }

    handleLoadNext = () => {
      const { topicsData } = this.props
      const terms = topicsData.terms || {}
      const param = {
        page: terms.page + 1,
      }
      this.requestTopics(param)
    }

    handleSort = (record) => {
      this.setState({reloading: true})
      this.requestTopics({order_type: record.value})
      this.changeRoute({sort: record.key})
    }
    handleSortSelect = (e) => {
      const record = e.item.props.record || {}
      this.requestTopics({order_type: record.value})
      this.changeRoute({sort: record.key})
    }

    handleClassification = (classification_id) => {
      this.setState({reloading: true})
      this.requestTopics({classification_id})
      this.changeRoute({type: classification_id})
    }

    handleClassificationSelect = (e) => {
      const classification_id = Number(e.key)
      this.requestTopics({classification_id})
      this.changeRoute({type: classification_id})
      
    }

    render() {
        const { topicsData, classificationData, query, isMobileScreen } = this.props
        const { reloading } = this.state
        const topics = topicsData.list || []
        const total = topicsData.total
        const terms = topicsData.terms || {}
        const isLoading = topicsData.isLoading
        const isEnd = topicsData.isLastPage
        const firstLoading = isLoading && terms.page === 1
        const current = terms.page || 1
        const pageSize = terms.size || 20

        const classifications = (classificationData.list || []).filter(item => item.status === 1)

        const isEmpty = topics.length === 0


        const classificationItem = classifications.find(item => String(item.id) === query.type) || {id: 0, name: '全部'}
        const sortItem = sortKeys.find(item => String(item.key) === query.sort) || sortKeys[0]
        const typeMenu = (<Menu
          onClick={this.handleClassificationSelect}
        >
          <Menu.Item key={0}>全部</Menu.Item>
          {classifications.map(item => (<Menu.Item key={item.id}>{item.name}</Menu.Item>))}
        </Menu>)
        
        const sortMenu = (<Menu
          onClick={this.handleSortSelect}
        >
          {sortKeys.map(item => (<Menu.Item key={item.value} record={item}>{item.name}</Menu.Item>))}
        </Menu>)
        
        return (
            <div className='topic-contanier'>
                {!isMobileScreen && <div className="topic-header">
                  <div className="topic-top-title">
                    <div className="title">
                      <CIcon name="topic" />
                      <h1>专题</h1>
                    </div>
                    <span className="total-count">当前共有{total}个专题</span>
                  </div>
                </div>}
                {!isMobileScreen && <div className="topic-classification topic-container">
                  <div 
                    className={classnames('topic-classification-item', {active: !query.type})}
                    onClick={e => this.handleClassification(0)}
                  >
                      <img src={imgTypeAll} alt=""/>
                      <span className="name">全部</span>
                    </div>
                  {classifications.map(item => (
                    <div 
                      key={item.id}
                      className={classnames('topic-classification-item', {active: query.type === String(item.id)})}
                      onClick={e => this.handleClassification(item.id)}
                    >
                      <img src={item.cover} alt=""/>
                      <span className="name">{item.name}</span>
                    </div>
                  ))}
                </div>}
                {isMobileScreen && <div className="topic-sort-bar topic-container">
                  <div className="classification-select">
                    <Dropdown
                      trigger={['click']}
                      overlay={typeMenu}
                    >
                      <span>
                      <span>{classificationItem.name}</span> <CIcon name="arrow-down" />
                      </span>
                    </Dropdown>
                    <Dropdown
                      trigger={['click']}
                      overlay={sortMenu}
                    >
                      <span style={{marginLeft: '20px'}}>
                      <span>{sortItem.name}</span> <CIcon name="arrow-down" />
                      </span>
                    </Dropdown>
                    {/* <Select
                      defaultValue={query.type ? Number(query.type) : 0}
                      onSelect={this.handleClassification}
                    >
                      <SelectOption className="topic-classification-select-item" value={0}>全部</SelectOption>
                      {classifications.map(item => (
                        <SelectOption className="topic-classification-select-item" key={item.id} value={item.id}>{item.name}</SelectOption>
                      ))}
                    </Select> */}
                  </div>
                  {/* <div className="sort-tabs">
                    {sortKeys.map(item => (
                      <span 
                        key={item.value} 
                        className={`sort-tab-item ${(query.sort || 'recommend') === item.key ? 'active' : ''}`}
                        onClick={e => this.handleSort(item)}
                      >{item.name}</span>
                    ))}
                  </div> */}
                </div>}
                {isMobileScreen && <div className="topic-type-total-desc">
                  <span className="total-count">当前共有{total}个专题</span>
                </div>}
                <div className="topic-content">
                  <div className="topic-content-box">
                    {reloading && <PartLoading float />}
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
                        {/* <div className="topic-pagination">
                          <Pagination
                            showQuickJumper
                            hideOnSinglePage
                            total={total}
                            defaultCurrent={current}
                            current={current}
                            pageSize={pageSize}
                            onChange={this.handlePagination}
                          />
                        </div> */}
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