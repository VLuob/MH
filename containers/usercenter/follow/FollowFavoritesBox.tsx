import { Component } from 'react'
import { Modal, Dropdown, Menu } from 'antd'
import { inject, observer } from 'mobx-react'
import { CompositionTypes, FollowTypes } from '@base/enums'

import LoadMore from '@components/common/LoadMore'
import EmptyComponent from '@components/common/EmptyComponent'
import FavoritesItem from '@components/collection/FavoritesItem'
import DetailHeader from '@components/author/DetailHeader'
import CustomIcon from '@components/widget/common/Icon'

const orderMenus = [
    {value: 1, label: '按热度排序'},
    {value: 2, label: '按时间排序'},
    {value: 3, label: '按关注排序'},
]

@inject(stores => {
    const { followStore, globalStore } = stores.store
    const { followFavoritesData } = followStore
    const { serverClientCode } = globalStore

    return {
        followStore,
        followFavoritesData,
        serverClientCode,
    }
})
@observer
export default class FollowFavoritesBox extends Component {
    componentDidMount() {
        this.requestFavorites()
    }

    requestFavorites(option={}) {
        const { followStore, followFavoritesData } = this.props
        const terms = followFavoritesData.terms || {}
        followStore.fetchFollowFavorites({
            ...terms,
            ...option,
            pageIndex: option.pageIndex || 1,
        })
    }

    handleNext = () => {
        const { followFavoritesData } = this.props
        const terms = followFavoritesData.terms || {pageIndex: 1}
        this.requestFavorites({pageIndex: terms.pageIndex + 1})
    }

    handleFollow = (record) => {
        Modal.confirm({
            title: '您是否确认取消关注',
            okText: '确定',
            cancelText: '取消',
            okButtonProps: {className: 'themes'},
            onOk: () => {
                const { followStore, serverClientCode } = this.props
                const param = {
                    client_code: serverClientCode,
                    id: record.id,
                    type: FollowTypes.COLLECTION,
                    action: 0,
                }
                followStore.actionFollowFavorites(param)
            }
        })
    }

    handleSortMenuClick = (e) => {
        const orderType = Number(e.key)
        const param = {
            orderType,
            pageIndex: 1,
        }
        this.requestFavorites(param)
    }

    render() {
        const { followFavoritesData } = this.props
        const favorites = followFavoritesData.list || []
        const { isEnd, loading, isLoad, total, terms } = followFavoritesData
        const isEmpty = isEnd && favorites.length === 0

        const currentSort = orderMenus.find(item => item.value === terms.orderType) || orderMenus[1]
        const sortLabel = currentSort.label
        const menu = (
            <Menu onClick={this.handleSortMenuClick}>
                {orderMenus.map(item =>(<Menu.Item key={item.value}>{item.label}</Menu.Item>))}
            </Menu>
        )

        return (
            <div className='prod-container'>
                <DetailHeader 
                    meta={`共关注了${total}个收藏夹`} 
                    extraContent={
                        <Dropdown overlay={menu} placement="bottomRight">
                            <a>{sortLabel} <CustomIcon name="arrow-down" /></a>
                        </Dropdown>
                    }
                />
                {!isEmpty ? 
                <div className='prod-box'>
                  <div className="collection-list">
                    {favorites.map(item => {
                      return (
                        <FavoritesItem 
                          key={item.id}
                          item={item}
                          hideAuthor
                          showExtra
                          extraMenus={['follow']}
                          onFollow={this.handleFollow}
                        />
                      )
                    })}
                  </div>
                  {!isEnd && isLoad && <LoadMore name={`加载更多`} num={3}
                      reqList={this.handleNext} />}
                </div> : <EmptyComponent text='暂无关注收藏夹' />}
            </div>
        )
    }
}