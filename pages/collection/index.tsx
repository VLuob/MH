import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { parseCookies } from 'nookies'
import HeadComponent from '@components/common/HeadComponent'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

import CollectionContainer from '@containers/collection'
// import { FavoritesSortType } from '@base/enums'
import { FavoritesSortType } from '@base/enums'
import { config } from '@utils'

const orderKeyMap: any = {
    'new': FavoritesSortType.NEW,
    'hot': FavoritesSortType.HOT,
    'follow': FavoritesSortType.FOLLOW,
}

@inject(stores => {
    const { globalStore } = stores.store
    const { isMobileScreen } = globalStore


    return {
        isMobileScreen,
    }
})
@observer
export default class Collection extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        const { collectionStore, globalStore } = mobxStore
        const { isMobileScreen, setMobileNavigationData } = globalStore

        let pagePaops = {}
        if (req && req.headers) {

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }

            const host: string = req.headers.host 
            const param: any = {host, page_index: 1, page_size: 40}
            if (query.sort === 'follow') {
                const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
                if (!token) {
                    res.writeHead(307, { Location: `/signin?c=${encodeURIComponent(asPath)}`})
                    res.end()
                }
                param.token = token
            } else {
                param.order_type = orderKeyMap[query.sort] || FavoritesSortType.HOT
            }

            await collectionStore.fetchPublicFavorites(param)
        }

        return {
            query,
            ...pagePaops
        }
    }

    render() {
        const { query, isMobileScreen } = this.props

        return (
            <>
                <HeadComponent 
                    title="营销案例作品收藏夹 - 营销作品宝库 - 梅花网" 
                    description="梅花网营销案例作品收藏夹 ,营销作品宝库,梅花网,致力于成为中国最大的营销作品库,并为行业上下游提供一个合作共赢的互动交流平台。"
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/discover"
                    title="公开收藏夹" 
                />}
                <CollectionContainer query={query} />
            </>
        )
    }
}