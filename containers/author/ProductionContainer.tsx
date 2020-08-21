import { Fragment, Component } from 'react'
import { Row, Col } from 'antd'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { CompositionType } from '@base/enums'
import PartLoading from '@components/features/PartLoading'
import { toJS } from 'mobx'

// import LoadMore from '@components/common/LoadMore'
import CommonIntro from '@components/common/CommonIntro'
import AuthorHeader from '@components/author/AuthorHeader'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

@inject(stores => {
  const { authorStore } = stores.store
  const { compositionData, fetchActionFavor, compositionParam, updateComposition, updateCompositionParam, changeComposition, fetchGetComposition, fetchGetClientComposition } = authorStore

  return {
    compositionData,
    fetchActionFavor,
    compositionParam,
    updateComposition,
    changeComposition,
    fetchGetComposition,
    updateCompositionParam,
    fetchGetClientComposition
  }
})
@observer
export default class ShotsContainer extends Component {

  searchFn = val => {
    const { query, compositionParam, fetchGetComposition } = this.props
    const { code } = query
    const param = { key: val, code, type: CompositionType.COMPOSITION, ...compositionParam, page: 1 }

    fetchGetComposition(param)
  }

  reqComposition = () => {
    const { query, compositionData, changeComposition, compositionParam, fetchGetComposition } = this.props
    const { code } = query
    let page = compositionParam.page

    if (compositionParam.page <= 1) {
      page += 1
    }

    fetchGetComposition({ code, type: CompositionType.COMPOSITION, ...compositionParam, page })
    // fetchGetComposition({ terms: shotsData.terms })
  }

  render() {
    // const compositionData = this.state.compositionData || {}
    const { query, compositionData, fetchActionFavor, compositionParam, fetchGetClientComposition } = this.props
    const { state, isLastPage } = compositionData
    const { code } = query

    return (
      // <div className='origin-prod-box media-prod-container'>
      <div className='origin-prod-box'>
        {compositionData.state && <AuthorHeader meta={`共创作了${compositionData.count}组作品`} placeholder={`搜索他的作品`} searchFn={this.searchFn}
          query={query} fetchGetClientComposition={fetchGetClientComposition} />}
        <div>
          <div className='origin-prod-content'>
            {state ? <>
              {compositionData.list && compositionData.list.length > 0 ? <Row className="author-shots-row" type='flex' gutter={{ xs: 12, sm: 16, md: 30 }} align='middle' justify='start'>
                {compositionData.list.map((item, index) => {
                  return (
                    <Fragment key={index}>
                      <Col>
                        <CommonIntro
                          brand
                          times
                          item={item}
                          onFavor={fetchActionFavor}
                        />
                      </Col>
                    </Fragment>
                  )
                })}
              </Row> : <EmptyComponent text='TA没有发布任何作品' />}
            </> : <PartLoading />}
          </div>
        </div>
        {!isLastPage && <LoadMore name={`加载更多`} num={compositionParam.page}
          status={compositionData.state} reqList={this.reqComposition} />}
      </div>
    )
  }
}