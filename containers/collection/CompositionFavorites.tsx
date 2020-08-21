import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'
import { Pagination, Select, Avatar, message } from 'antd'
import classnames from 'classnames'

import {CollectionStore} from '@stores/collection/collectionStore'
import ShareGroup from '@containers/shots/ShareGroup'
import EmptyComponent from '@components/common/EmptyComponent'
import CIcon from '@components/widget/common/Icon'
import PartLoading from '@components/features/PartLoading'
import FavoritesItem from '@components/collection/FavoritesItem'
import EditFavoritesModal from '@containers/collection/EditFavoritesModal'
import { FavoritesSortType } from '@base/enums'
import { utils, config } from '@utils'
import { Router } from '@routes'

import './index.less'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
  loading: () => <p></p>,
  ssr: false
})


const sortKeys = [
  {key: 'new', value: FavoritesSortType.NEW, name: '最新'},
  {key: 'hot', value: FavoritesSortType.HOT, name: '热门'},
  // {key: 'follow', value: FavoritesSortType.FOLLOW, name: '关注'},
]

const orderKeyMap = {
  'new': FavoritesSortType.NEW,
  'hot': FavoritesSortType.HOT,
  // 'follow': FavoritesSortType.FOLLOW,
}

interface Props {
  collectionStore: CollectionStore
  compositionFavoritesData: object
  favoritesData: object
  query: object
}

interface State {
    editVisible: boolean
}

@inject(stores => {
    const { collectionStore } = stores.store
    const { compositionFavoritesData, favoritesData } = collectionStore
    return {
      collectionStore,
      compositionFavoritesData,
      favoritesData,
    }
})
@observer
export default class CompositionFavorites extends Component<Props, State> {
    state = {
      editVisible: false,
    }

    requestFavorites({pageIndex=1, ...option}) {
      const { query, collectionStore, compositionFavoritesData } = this.props
      const compositionId = query.id
      const terms = compositionFavoritesData.terms || {}
      collectionStore.fetchCompositionFavorites({
        ...terms,
        ...option,
        compositionId,
        orderType: orderKeyMap[query.sort] || FavoritesSortType.NEW,
        pageIndex: pageIndex,
      })
    }

    requestPublicFavorites({page_index=1, ...option}) {
      const { collectionStore, favoritesData } = this.props
      const terms = favoritesData.terms || {}
      collectionStore.fetchPublicFavorites({
        ...terms,
        ...option,
        orderType: FavoritesSortType.HOT,
        page_index: page_index,
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
      delete queryObj.id
      const queryParams = Object.keys(queryObj).map(key => (`${key}=${queryObj[key]}`))
      const paramStr = queryParams.length === 0 ? '' : `?${queryParams.join('&')}`
      Router.pushRoute(location.pathname + paramStr)
    }

    handleLoadNext = () => {
      const { compositionFavoritesData } = this.props
      const terms = compositionFavoritesData.terms || {}
      const param = {
        ...terms,
        page_index: terms.page_index + 1,
      }
      this.requestPublicFavorites(param)
    }

    handleSort = (record) => {
      this.requestFavorites({orderType: record.value})
      this.changeRoute({sort: record.key})
    }

    handleEditVisible = (flag=false) => {
      const token = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
      if (!token) {
        location.href = '/signin?c=' + location.href
        return
      }

      this.setState({editVisible: !!flag})
    }

    handleEditSubmit = (values) => {
      const { collectionStore } = this.props
      collectionStore.addFavorites(values).then(res => {
        if (res.success) {
          this.setState({editVisible: false})
          message.success('创建成功')
        } else {
          message.error('创建失败')
        }
      })
    }

    render() {
        const { compositionFavoritesData, favoritesData, query } = this.props
        const { editVisible } = this.state
        const favorites = compositionFavoritesData.list || []
        const total = compositionFavoritesData.total
        const title = compositionFavoritesData.title
        const loading = compositionFavoritesData.loading
        const isEnd = compositionFavoritesData.isEnd
        const isEmpty = isEnd && favorites.length === 0

        const publicFavorites = favoritesData.list || []
        const isPublicEmpty = favoritesData.isEnd && publicFavorites.length === 0
        
        return (
            <div className='collection-body'>
                <div className="collection-header-container">
                    <div className="collection-header">
                    <div className="collection-top-title">
                        <div className="title">
                          <h1>{title}</h1>
                        </div>
                        <span className="total-count">当前共被{total}个收藏夹收藏</span>
                    </div>
                    </div>
                </div>
                <div className="collection-sort-bar-wrapper">
                    <div className="collection-sort-bar collection-container">
                        <span className="sort-tabs">
                            {sortKeys.map(item => (
                            <span 
                                key={item.value} 
                                className={`sort-tab-item ${(query.sort || 'new') === item.key ? 'active' : ''}`}
                                onClick={e => this.handleSort(item)}
                            >{item.name}</span>
                            ))}
                        </span>
                        <span className="sort-tabs-right" onClick={e => this.handleEditVisible(true)}>
                          <CIcon name="plus" /> 创建我的收藏夹
                        </span>
                    </div>
                </div>
                <div className="collection-content">
                  <div className="collection-content-box">
                    {loading && <PartLoading />}
                    <div className="collection-list">
                      {favorites.map(item => {
                        return (
                          <FavoritesItem key={item.id} item={item} />
                        )
                      })}
                      <div className="collection-item">
                        <div className="collection-item-content" onClick={e => this.handleEditVisible(true)}>
                            <div className="collection-item-cover">
                              <a className="cover-create"><CIcon name="favorites" /></a>
                            </div>
                            <div className="collection-item-intro">
                              <a className="btn-create"><CIcon name="plus" /> 创建我的收藏夹</a>
                            </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="collection-content-box">
                    <div className="list-title">热门收藏夹</div>
                    {favoritesData.loading && <PartLoading />}
                    {!favoritesData.loading && <>
                      {!isPublicEmpty ? 
                      <>
                        <div className="collection-list">
                          {publicFavorites.map(item => {
                            return (
                              <FavoritesItem key={item.id} item={item} />
                            )
                          })}
                        </div>
                        {!favoritesData.isEnd && <div className="collection-loadmore">
                          <LoadMore 
                            name={`加载更多`} 
                            num={3}
                            reqList={this.handleLoadNext} />
                        </div>}
                      </> : <EmptyComponent text="暂无收藏夹" />}
                    </>}
                  </div>
                  <ShareGroup
                    hideActions
                    scope="topic"
                    title={"收藏夹-梅花网"}
                    cover={'https://resource.meihua.info/FuLrn1kuRes0efB9IJPNERLj2o43'}
                    style={{top: 0, right: '-80px'}}
                  />
                </div>
                <EditFavoritesModal 
                  visible={editVisible}
                  onClose={e => this.handleEditVisible()}
                  onSubmit={this.handleEditSubmit}
                />
            </div>
        )
    }
}