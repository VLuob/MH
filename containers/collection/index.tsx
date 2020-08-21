import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import dynamic from 'next/dynamic'
import jsCookie from 'js-cookie'
import { toJS } from 'mobx'

import { Dropdown, Menu, message } from 'antd'


import { CollectionStore } from '@stores/collection/collectionStore'
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
  {key: 'hot', value: FavoritesSortType.HOT, name: '热门'},
  {key: 'new', value: FavoritesSortType.NEW, name: '最新'},
  {key: 'follow', value: FavoritesSortType.FOLLOW, name: '关注'},
]

const orderKeyMap = {
  'new': FavoritesSortType.NEW,
  'hot': FavoritesSortType.HOT,
  'follow': FavoritesSortType.FOLLOW,
}

interface Props {
  collectionStore: CollectionStore
  favoritesData: any
  query: any
}

interface State {
    editVisible: boolean
}

@inject((stores: any) => {
    const { collectionStore, globalStore } = stores.store
    const { isMobileScreen } = globalStore
    const { favoritesData } = collectionStore
    return {
      collectionStore,
      isMobileScreen,
      favoritesData,
    }
})
@observer
export default class FavoritesContainer extends Component<Props, State> {
    state = {
      editVisible: false
    }

    requestFavorites({page_index=1, page_size=40, ...option}) {
      const { query, collectionStore } = this.props
      const param: any = {
        page_index: page_index,
        page_size: page_size,
        ...option,
      }

      // if (query.sort === 'follow') {
      //   const token: string = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
      //   if (!token) {
      //       location.href = `/signin?=${location.href}`
      //       return
      //   }
      //   param.token = token
      // } else {
      //   param.order_type = orderKeyMap[query.sort] || FavoritesSortType.HOT
      // }

      collectionStore.fetchPublicFavorites(param)
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
      Router.pushRoute(`/collection` + paramStr)
    }

    handleLoadNext = () => {
      const { favoritesData } = this.props
      const terms = favoritesData.terms || {}
      const param = {
        ...terms,
        page_index: terms.page_index + 1,
      }
      this.requestFavorites(param)
    }

    handleSort = (record) => {
      const param: any = {}
      if (record.key === 'follow') {
        const token: string = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if (!token) {
            location.href = `/signin?c=${encodeURIComponent(`/collection?sort=follow`)}`
            return
        }
        param.token = token
      } else {
        param.order_type = record.value || FavoritesSortType.HOT
      }
      this.requestFavorites(param)
      this.changeRoute({sort: record.key})
    }
    handleSortSelect = e => {
      const record = e.item.props.record || {}
      const param: any = {}
      if (record.key === 'follow') {
        const token: string = jsCookie.get(config.COOKIE_MEIHUA_TOKEN)
        if (!token) {
            location.href = `/signin?c=${encodeURIComponent(`/collection?sort=follow`)}`
            return
        }
        param.token = token
      } else {
        param.order_type = record.value || FavoritesSortType.HOT
      }
      this.requestFavorites(param)
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
      collectionStore.addFavorites(values).then((res: any) => {
        if (res.success) {
          this.setState({editVisible: false})
          message.success('创建成功')
        } else {
          message.error('创建失败')
        }
      })
    }

    render() {
        const { favoritesData, query, isMobileScreen } = this.props
        const {editVisible} = this.state
        const favorites = favoritesData.list || []
        const total = favoritesData.total
        const loading = favoritesData.loading
        const isEnd = favoritesData.isEnd

        const isEmpty = isEnd && favorites.length === 0

        const sortItem = sortKeys.find(item => item.key === query.sort) || sortKeys[0]
        const sortMenu = (<Menu onClick={this.handleSortSelect}>
          {sortKeys.map(item => (<Menu.Item key={item.value} record={item}>{item.name}</Menu.Item>))}
        </Menu>)
        
        return (
            <div className='collection-body'>
              {!isMobileScreen && <>
                <div className="collection-header-container">
                    <div className="collection-header">
                    <div className="collection-top-title">
                        <div className="title">
                          <CIcon name="favorites" />
                          <h1>公开收藏夹</h1>
                        </div>
                        <span className="total-count">当前共有{total}个收藏夹</span>
                    </div>
                    </div>
                </div>
                <div className="collection-sort-bar-wrapper">
                    <div className="collection-sort-bar collection-container">
                        <span className="sort-tabs">
                            {sortKeys.map(item => (
                            <span 
                                key={item.value} 
                                className={`sort-tab-item ${(query.sort || 'hot') === item.key ? 'active' : ''}`}
                                onClick={e => this.handleSort(item)}
                            >{item.name}</span>
                            ))}
                        </span>
                        <span className="sort-tabs-right" onClick={e => this.handleEditVisible(true)}>
                          <CIcon name="plus" /> 创建我的收藏夹
                        </span>
                    </div>
                </div>
              </>}
                {isMobileScreen && <div className="mb-collection-sort-bar-wrapper">
                  <div className="collection-sort-bar">
                    <Dropdown
                      trigger={['click']}
                      overlay={sortMenu}
                    >
                      <span className="sort-dropdown-btn">
                        <span>{sortItem.name}</span> <CIcon name="arrow-down" />
                      </span>
                    </Dropdown>
                    <span className="sort-tabs-right" onClick={e => this.handleEditVisible(true)}>
                      <CIcon name="plus" /> 创建我的收藏夹
                    </span>
                  </div>
                  <div className="total-count">
                    当前共有{total}个收藏夹
                  </div>
                </div>}
                <div className="collection-content">
                  <div className="collection-content-box">
                    {loading && <PartLoading float />}
                    {!isEmpty ? 
                    <>
                      <div className="collection-list">
                        {favorites.map(item => {
                          return (
                            <FavoritesItem key={item.id} item={item} />
                          )
                        })}
                      </div>
                      {!isEnd && <div className="collection-loadmore">
                        <LoadMore 
                          name={`加载更多`} 
                          num={3}
                          reqList={this.handleLoadNext} />
                      </div>}
                    </> : <EmptyComponent text="暂无收藏夹" />}
                  </div>
                  <ShareGroup
                    hideActions
                    scope="topic"
                    title={"收藏夹-梅花网"}
                    cover={'https://resource.meihua.info/FuLrn1kuRes0efB9IJPNERLj2o43'}
                    style={{top: 0, right: '-55px'}}
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