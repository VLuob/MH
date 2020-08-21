import { Component } from 'react'
import { observer, inject } from 'mobx-react'
import { parseCookies, destroyCookie } from 'nookies'
import { toJS } from 'mobx'

import { CompositionTypes } from '@base/enums'
import { config, utils } from '@utils'
import wxSignature from '@utils/wxSignature'

import Error from '@components/common/Error'
import HeadComponent from '@components/common/HeadComponent'
import ShotsContainer from '@containers/shots/DetailContainer'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'

@inject(stores => {
    const { globalStore, compositionStore } = stores.store
    const { isMobileScreen } = globalStore
    const { compositionDetail } = compositionStore
    return {
        globalStore,
        isMobileScreen,
        compositionDetail,
    }
})
@observer
export default class ShotsDetail extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        let statusCode = res.statusCode > 200 ? res.statusCode : false
        const { compositionStore, globalStore } = mobxStore
        const { serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore


        let datas = {}

        if(req && req.headers) {
            const host = req.headers.host
            const compositionId = query.id
            const client = serverClientCode
            const token = parseCookies(ctx, config.COOKIE_MEIHUA_TOKEN)[config.COOKIE_MEIHUA_TOKEN]

            const isMobile = isMobileScreen

            datas.isMobile = isMobile

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }

            const params = { compositionId, token, client, op: 2 }
            let detailResult = await compositionStore.fetchComposition(params)
            let resultCompositionDetail = detailResult.data
            if (resultCompositionDetail && resultCompositionDetail.code === 'E100000' && (resultCompositionDetail.msg || '').toUpperCase() === 'ERROR TOKEN') {
                destroyCookie(ctx, config.COOKIE_MEIHUA_TOKEN, {path: '/', domain: config.COOKIE_MEIHUA_DOMAIN})
                delete params.token
                detailResult = await compositionStore.fetchComposition(params)
                resultCompositionDetail = detailResult.data
            }

            const composition = (resultCompositionDetail.composition || {}) || {}
            if (!resultCompositionDetail || !resultCompositionDetail.composition || resultCompositionDetail.code === 'E100000' || composition.type !== CompositionTypes.SHOTS) {
                statusCode = 404
            } else {
                datas.resultCompositionDetail = resultCompositionDetail
                const resultAuthorInfo = await compositionStore.fetchAuthor({host, token, compositionId})
                const resultRelatedShots = await compositionStore.fetchRelatedCompositions({
                    compositionId,
                    type: CompositionTypes.SHOTS,
                    page: 1,
                    limit: 5,
                })
                const resultRelatedCollections = await compositionStore.fetchCompositionFavorites({
                    compositionId,
                    orderType: 2,
                    pageIndex: 1,
                    pageSize: 20,
                })
            }
        }

        return {
            statusCode,
            asPath,
            query,
            ...datas,
        }
    }

    componentDidMount() {
        const { globalStore, isMobile } = this.props
        globalStore.setMobileScreen(isMobile)
        this.initWxSignature()
    }

    initWxSignature() {
        const { resultCompositionDetail } = this.props
        if (!resultCompositionDetail) {
            return
        }
        const composition = resultCompositionDetail.composition || {}
        wxSignature.init({
            title: composition.title,
            describe: composition.summary,
            cover: composition.cover,
            // cover: composition.cover + '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200',
        })
    }

    render() {
        const { statusCode, query, resultCompositionDetail, isMobile, isMobileScreen } = this.props

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        const composition = (resultCompositionDetail || {}).composition || {}
        const title = composition.title
        const summary = composition.summary || ''
        const authorNickname = composition.authorName
        const description = utils.getSubstr(summary, 60)
        const keywordsArr = []
        if (authorNickname) {
            keywordsArr.push(authorNickname)
        }
        if (composition.brandName) {
            keywordsArr.push(composition.brandName)
        }
        if (composition.categoryName) {
            keywordsArr.push(composition.categoryName)
        }
        if (composition.formName) {
            keywordsArr.push(composition.formName)
        }
        if (composition.productName) {
            keywordsArr.push(composition.productName)
        }
        if (composition.tags && composition.tags.length > 0) {
            const tagNames = composition.tags.map(item => item.tagName)
            keywordsArr.push(...tagNames)
        }
        keywordsArr.push('营销作品','营销案例','创意案例')
        const keywords = keywordsArr.join('、')

        console.log('composition', composition)

        return (
            <>
                <HeadComponent 
                    title={`${title}-梅花网`} 
                    description={description}
                    keywords={keywords}
                />
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/shots"
                    title={authorNickname} 
                />}
                <ShotsContainer  
                    query={query} 
                    isMobile={isMobile}
                />
                <div style={{display: 'none'}}><img className="cover" src={`${composition.cover}?imageView2/2/w/200`}/></div>
            </>
        )
    }
}