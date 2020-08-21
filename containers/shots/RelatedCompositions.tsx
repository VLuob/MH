import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import { Row, Col, Switch } from 'antd'

import PartLoading from '@components/features/PartLoading'
import CommonIntro from '@components/common/CommonIntro'

import { CompositionTypes } from '@base/enums'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})

export interface Props {
    compositionId: string|number
}

@inject(stores => {
  const { compositionStore, globalStore } = stores.store
  const { serverClientCode, isMobileScreen } = globalStore
  const { relatedShotsData } = compositionStore

  return {
      compositionStore,
      isMobileScreen,
      serverClientCode,
      relatedShotsData, 
  }
})
@observer
export default class RelatedCompositions extends Component {
  // componentDidMount() {
  //   const { compositionStore, compositionId } = this.props
  //   if (!compositionId) {
  //     return
  //   }

  //   compositionStore.fetchRelatedCompositions({
  //     compositionId,
  //     type: CompositionTypes.SHOTS,
  //     page: 1,
  //     limit: 9,
  //   })
  // }

  handleLoadNext = () => {
    const { compositionStore, compositionId, relatedShotsData, serverClientCode } = this.props
    const terms = relatedShotsData.terms
    compositionStore.fetchRelatedCompositions({
      compositionId,
      type: CompositionTypes.SHOTS,
      page: terms.page + 1,
      limit: 9,
      client: serverClientCode,
    })

  }

  render() {
    const { relatedShotsData, compositionStore, isMobileScreen } = this.props
    const relatedCompositions = relatedShotsData.list || []
    const relatedIsLastPage = relatedShotsData.isLastPage
    const relatedIsLoading = relatedShotsData.isLoading
    const isEmpty = !relatedIsLoading && relatedCompositions.length === 0


    return (
      <>
      {!isEmpty ? <div className="related-compositions">
      <div className="related-container">
        <div className="header">
          <span className="title">相关推荐</span>
        </div>
        <div className="list">
          {<Row type='flex' align='middle' justify='start'>
            {relatedCompositions.map((item, i) => {
              return (
                <Col key={i}>
                  <CommonIntro 
                    item={item} 
                    brand={true} 
                    authorDetail={!isMobileScreen} 
                    onFavor={compositionStore.fetchRelatedShotsFavor} 
                  />
                </Col>
              )
            })}
          </Row>}
          {!relatedIsLastPage &&
            <LoadMore 
            name={`加载更多`} 
            num={3}
            reqList={this.handleLoadNext} />
        }
          {relatedIsLoading && <PartLoading />}
        </div>
      </div>
    </div> : null}
    </>
    )
  }
}