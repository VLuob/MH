import { Component } from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import { toJS } from 'mobx'

import ServiceItem from '@components/service/ServiceItem'
import AuthorHeader from '@components/author/AuthorHeader'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'
// import ArticleBriefComp from '@components/common/ArticleBriefComp'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

@inject(stores => {
  const { authorStore } = stores.store
  const {
    authorServiceData,
    fetchAuthorServices,
  } = authorStore

  return {
    authorServiceData,
    fetchAuthorServices,
  }
})
@observer
export default class ServiceContainer extends Component {


  handleSearch = val => {
    const { query, authorServiceData, fetchAuthorServices } = this.props
    const { code } = query
    let terms = authorServiceData.terms || {}
    const param = {
      code,
      pageSize: terms.pageSize,
      pageIndex: 1,
      name: val,
    }
    fetchAuthorServices(param)
  }

  requestServices = () => {
    const {
      query,
      authorServiceData,
      fetchAuthorServices,
    } = this.props
    const { code } = query
    let terms = authorServiceData.terms || {}
    const param = {
      ...terms,
      code,
      pageIndex: terms.pageIndex + 1
    }
    fetchAuthorServices(param)
  }

  render() {
    const { query, authorServiceData, fetchGetClientComposition } = this.props
    const { total, list = [], loading, end } = authorServiceData
    const { code } = query
    const hasService = list.length > 0

    // console.log('service', toJS(authorServiceData))
    
    return (
      <div className='author-service-box'>
        {!loading && <AuthorHeader meta={`共创建了${total}个服务`} placeholder={`搜索他的服务`} searchFn={this.handleSearch}
          query={query} />}
        <div className='author-service-content'>
          {!loading ?
            <>
              {hasService && <div className='service-content'>
                {hasService && list.map(item => {
                  return (
                    <ServiceItem
                      key={item.id}
                      hideAuthor
                      item={item}
                    />
                  )
                })}
              </div>}
              {!hasService &&
                <EmptyComponent text='TA没有发布任何服务' />
              }
            </>
            : <PartLoading />}
        </div>
        {!end && <LoadMore
          name={`加载更多`}
          num={3}
          status={loading}
          reqList={this.requestServices}
        />}
      </div>
    )
  }
}