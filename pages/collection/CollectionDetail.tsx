import { Component } from 'react'
import { parseCookies } from 'nookies'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import { message } from 'antd'
import wxSignature from '@utils/wxSignature'
import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import CollectionDetailContainer from '@containers/collection/CollectionDetailContainer'
import CustomIcon from '@components/widget/common/Icon'

import { config } from '@utils'
import { CompositionTypes } from '@base/enums'

@inject(stores => {
    const { collectionStore } = stores.store
    const { favoritesDetail } = collectionStore
    return {
        favoritesDetail,
    }
})
@observer
export default class CollectionDetail extends Component {
    static async getInitialProps(ctx) {
        const { req, res, asPath, query, mobxStore } = ctx
        const { id, type } = query
        const { collectionStore, globalStore } = mobxStore
        const { serverClientCode } = globalStore
        let statusCode: boolean | number = false
        let appProps: any = {}

        if(req && req.headers) { 
            const host = req.headers.host 
            let token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
            let clientCode = serverClientCode
            statusCode = res.statusCode > 200 ? res.statusCode : false
            
            // 获取收藏夹详情 
            const detailParam = { host, token, clientCode, id }
            const resultFavoritesDetail = await collectionStore.fetchFavoritesDetail(detailParam) 

            if (!resultFavoritesDetail) {
                statusCode = 404
            } else if (!resultFavoritesDetail.success) {
                const data = resultFavoritesDetail.data || {}
                if (data.code === 'E100003') {
                    // 需要登录
                    res.writeHead(307,{ Location: `/signin?c=${asPath}`})
                    res.end()
                } else if (data.code === 'E100004') {
                    // 非本人私密收藏夹
                    appProps.isPrivate = true
                } else {
                    statusCode = 404
                }

            } else {

                const collectionId = id

                if (type === 'article' ) {
                    // 获取文章列表 
                    const articleParam = { host, token, collectionId, compositionType: CompositionTypes.ARTICLE, clientCode, pageIndex: 1, pageSize: 10 }
                    const resultArticlesList = await collectionStore.fetchFavoritesCompositions(articleParam)
                } else if (type === 'shots') {
                    // 获取作品列表 
                    const shotsParam = { host, token, collectionId, compositionType: CompositionTypes.SHOTS, clientCode, pageIndex: 1, pageSize: 40 }
                    const resultShotsList = await collectionStore.fetchFavoritesCompositions(shotsParam)
                } else {
                    // 获取全部创作列表 
                    const shotsParam = { host, token, collectionId, clientCode, pageIndex: 1, pageSize: 40 }
                    const resultList = await collectionStore.fetchFavoritesCompositions(shotsParam)
                }
            }
        }

        return {
            statusCode,
            query, 
            asPath,
            ...appProps
        }
    }

    componentDidMount() {
        this.checkPrivate()
        this.initWxSignature()
    }

    checkPrivate() {
        const { isPrivate } = this.props
        if (isPrivate) {
            message.info('该收藏夹已隐藏')
            setTimeout(() => {
                location.href = '/collection'
            }, 2000)
        }
    }

    initWxSignature() {
        wxSignature.init({
            cover: 'https://resource.meihua.info/FkVLmZ_FSwR9MdOWPmFMY8RjVJur?imageView2/2/w/200/',
        })
    }

    render() {
        const { statusCode, query, favoritesDetail, isPrivate } = this.props
        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        const name = favoritesDetail.name


        return (
            <>
                <HeadComponent
                    title={`${name}收藏夹 - 营销作品宝库 - 梅花网`}
                    keywords={name}
                />
                {isPrivate 
                ? <div className="favorites-is-private-container" style={{padding: '50px 0', textAlign: 'center'}}>
                    <div className="icon-lock" style={{fontSize: '56px', color: '#888888'}}>
                        <CustomIcon name="lock" />
                    </div>
                    <div className="desc" style={{marginTop: '30px', color: '#222222', fontSize: '24px'}}>该收藏夹已隐藏  <a href="/collection" style={{fontSize: '14px'}}>查看更多收藏夹</a></div>
                </div>
                : <CollectionDetailContainer query={query} />}
            </>
        )
    }
}