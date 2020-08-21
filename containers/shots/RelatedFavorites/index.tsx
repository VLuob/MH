import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import dynamic from 'next/dynamic'
import { Tooltip } from 'antd'

import PartLoading from '@components/features/PartLoading'

import { CompositionTypes } from '@base/enums'

import './index.less'

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
export default class RelatedFavorites extends Component {

  render() {
    const { compositionFavoritesData, compositionId, compositionType, compositionStore, isMobileScreen } = this.props
    const favorites = compositionFavoritesData.list || []
    const loading = compositionFavoritesData.loading
    const isEmpty = !loading && favorites.length === 0

    const moreUrl = `/${compositionType === CompositionTypes.ARTICLE ? 'article' : 'shots'}/${compositionId}/collection`
    
    return (
      <>
      {!isEmpty ? 
        <div className="related-favorites">
          <div className="related-container">
            <div className="header">
              <div className="title">收录本作品的收藏夹 <a className="more" href={moreUrl} target="_blank">更多</a></div>
            </div>
            <div className="list favorites-list">
              {favorites.map(item => {
                let covers = item.cover || []
                if (covers.length < 4) {
                  covers = covers.slice(0,1)
                }
                return (
                  <div className="favorites-item" key={item.id}>
                    <div className="favorites-item-content">
                      <div className={`favorites-item-cover ${covers.length === 1 ? 'single' : ''}`}>
                        <a href={`/collection/${item.id}`} target="_blank">
                          {covers.map((url, i) => (<img key={i} src={`${url}?imageMogr2/thumbnail/!252x180r/size-limit/50k/gravity/center/crop/252x180`} alt={item.name} />))}
                        </a>
                      </div>
                      <div className="favorites-item-intro">
                          <div className="title">
                              <a href={`/collection/${item.id}`} title={item.name} alt={item.name}><Tooltip title={item.name}>{item.name}</Tooltip></a>
                          </div>
                          <div className="footer-bar">
                            <span className="stat">
                              <span className="text">{item.worksQuantity || 0}个作品</span>
                            </span>
                          </div>
                      </div>
                    </div>
                  </div>
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