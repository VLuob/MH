import { Component } from 'react'
import { Dropdown, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes } from '@base/enums'

import LoadMore from '@components/common/LoadMore'
import EmptyComponent from '@components/common/EmptyComponent'
import FavoritesItem from '@components/collection/FavoritesItem'
import DetailHeader from '@components/author/DetailHeader'
import CustomIcon from '@components/widget/common/Icon'

const orderMenus = [
    {value: null, label: '全部'},
    {value: true, label: '公开'},
    {value: false, label: '私密'},
]

@inject(stores => {
    const { collectionStore } = stores.store
    const { myFavoritesData } = collectionStore

    return {
        collectionStore,
        myFavoritesData,
    }
})
@observer
export default class FavoritesBox extends Component {
    componentDidMount() {
        this.requestFavorites()
    }

    requestFavorites(option={}) {
        const { collectionStore, myFavoritesData } = this.props
        const terms = myFavoritesData.terms || {}
        collectionStore.fetchMyFavorites({
            ...terms,
            ...option,
            pageIndex: option.pageIndex || 1,
        })
    }

    handleNext = () => {
        const { myFavoritesData } = this.props
        const terms = myFavoritesData.terms || {pageIndex: 1}
        this.requestFavorites({pageIndex: terms.pageIndex + 1})
    }


    handleSortMenuClick = (e) => {
        const param = {
            pageIndex: 1,
        }
        if (e.key === 'true' || e.key === 'false') {
            param.published = e.key === 'true' ? true : false
        } else {
            param.published = undefined
        }
        this.requestFavorites(param)
    }

    render() {
        const { myFavoritesData, onEdit, onDelete } = this.props
        const favorites = myFavoritesData.list || []
        const { isEnd, loading, isLoad, total, terms } = myFavoritesData
        const isEmpty = isEnd && favorites.length === 0

        const currentSort = orderMenus.find(item => item.value === terms.published) || orderMenus[0]
        const sortLabel = currentSort.label
        const menu = (
            <Menu onClick={this.handleSortMenuClick}>
                {orderMenus.map(item =>(<Menu.Item key={item.value}>{item.label}</Menu.Item>))}
            </Menu>
        )

        return (
            <div className='prod-container'>
                <DetailHeader 
                    meta={`共创建了${total}个收藏夹`} 
                    extraContent={
                        <Dropdown overlay={menu} placement="bottomRight">
                            <a>{sortLabel} <CustomIcon name="arrow-down" /></a>
                        </Dropdown>
                    }
                />
                {!isEmpty ? <div className='prod-box'>
                  <div className="collection-list">
                    {favorites.map(item => {
                      return (
                        <FavoritesItem 
                          key={item.id}
                          item={item}
                          scope="myFavorites"
                          hideAuthor
                          showExtra
                          extraMenus={['edit','delete']}
                          onEdit={onEdit}
                          onDelete={onDelete}
                        />
                      )
                    })}
                  </div>
                  {!isEnd && isLoad && 
                    <LoadMore 
                        name={`加载更多`} 
                        num={3}
                        reqList={this.handleNext} 
                    />}
                </div> : <EmptyComponent text='暂无相关收藏夹' />}
            </div>
        )
    }
}