import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import { Row, Col } from 'antd'

import PartLoading from '@components/features/PartLoading'
import CommonIntro from '@components/common/CommonIntro'
import FavoritesItem from '@components/collection/FavoritesItem'

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
  const { compositionFavoritesData } = compositionStore

  return {
      compositionStore,
      isMobileScreen: globalStore.isMobileScreen,
      compositionFavoritesData, 
  }
})
@observer
export default class RelatedCollections extends Component {

  render() {
    const { compositionFavoritesData, compositionId, compositionType, compositionStore, isMobileScreen } = this.props
    const favorites = compositionFavoritesData.list || []
    const loading = compositionFavoritesData.loading
    const isEmpty = !loading && favorites.length === 0

    const moreUrl = `/${compositionType === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${compositionId}/collection`
    
    return (
      <>
      {!isEmpty ? 
        <div className="related-compositions">
          <div className="related-container">
            <div className="header">
              <div className="title">收录本作品的收藏夹 <a className="more" href={moreUrl} target="_blank">更多</a></div>
            </div>
            <div className="list collection-list">
              {favorites.map(item => {
                return (
                  <FavoritesItem key={item.id} item={item} />
                )
              })}
            {loading && <PartLoading />}
          </div>
        </div>
      </div> : null}
    </>
    )
  }
}