import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import HeadComponent from '@components/common/HeadComponent'

import Error from '@components/common/Error'
import CompositionFavorites from '@containers/collection/CompositionFavorites'
// import { FavoritesSortType } from '@base/enums'


@inject(stores => {
    const { collectionStore } = stores.store
    const { compositionFavoritesData } = collectionStore
    return {
        compositionFavoritesData,
    }
})
@observer
export default class CompositionCollection extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, mobxStore } = ctx
        const { collectionStore } = mobxStore

        let statusCode = 0
        let pagePaops: any = {}
        if (req && req.headers) {
            const host = req.headers.host 
            const compositionId = query.id
            statusCode = res.statusCode > 200 ? res.statusCode : 0

            const resultFavorites = await collectionStore.fetchCompositionFavorites({host, compositionId, orderType: 2, pageIndex: 1, pageSize: 100})
            if (!resultFavorites || !resultFavorites.success) {
              statusCode = 404
            } else {
              const resultHotFavorites = await collectionStore.fetchPublicFavorites({host, orderType: 1, pageIndex: 1, pageSize: 40})
            }

        }

        return {
          statusCode,
          query,
          ...pagePaops
        }
    }

    render() {
        const { statusCode, query, compositionFavoritesData } = this.props
        
        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        return (
            <>
                <HeadComponent title={`${compositionFavoritesData.title}被收藏的收藏夹 - 营销作品宝库 - 梅花网`} />
                <CompositionFavorites query={query} />
            </>
        )
    }
}