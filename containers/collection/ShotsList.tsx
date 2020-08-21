import { Component } from 'react'
import dynamic from 'next/dynamic'
import { inject, observer } from 'mobx-react'
import { CompositionTypes, FavorTypes } from '@base/enums' 
import { toJS } from 'mobx'

import CommonIntro from '@components/common/CommonIntro'
import PartLoading from '@components/features/PartLoading'
import EmptyComponent from '@components/common/EmptyComponent'

const LoadMore = dynamic(() => import('@components/common/LoadMore'), {
    loading: () => <p></p>,
    ssr: false
})

@inject(stores => {
    const { collectionStore, globalStore } = stores.store
    const { favoritesShots } = collectionStore
    const { serverClientCode } = globalStore

    return {
        collectionStore,
        serverClientCode,
        favoritesShots,
    }
})
@observer
export default class ShotsList extends Component {

    reqCompositions = () => {
        const { favoritesShots, collectionStore } = this.props
        const terms = favoritesShots.terms 
        delete terms.host

        const param = { ...terms, pageIndex: terms.pageIndex + 1 }
        collectionStore.fetchFavoritesCompositions(param)
    }

    onActionFavor = option => {
        const { collectionStore } = this.props
        collectionStore.fetchFavoritesShotsFavor({...option, type: FavorTypes.SHOTS})
    }

    render() {
        const { favoritesShots } = this.props
        const { isEnd, loading, list } = favoritesShots

        return (
            <>
                <div className='collection-content'>
                    {!loading ? 
                        <div>
                            {list.length > 0 ?
                                <div className='shots-list'>
                                    {list.map(item => {
                                        return (
                                            <CommonIntro
                                                key={item.compositionId ||item.id}
                                                brand
                                                item={item}
                                                authorDetail
                                                onFavor={this.onActionFavor} 
                                            />
                                        )
                                    })}
                            </div> : <EmptyComponent text='未找到相关作品' />}
                        </div> : <PartLoading />}

                    {!isEnd && <LoadMore name={`加载更多`} num={3} reqList={this.reqCompositions} />}
                </div>
            </>
        )
    }
}