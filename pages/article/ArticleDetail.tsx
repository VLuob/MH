import { Component } from 'react'
import { inject, observer } from 'mobx-react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import { toJS } from 'mobx'
import Head from 'next/head'
import Error from '@components/common/Error'
import HeadComponent from '@components/common/HeadComponent'
import ArticleDetailContainer from '@containers/article/DetailContainer'
import MbNavigatorBar from '@containers/common/MbNavigatorBar'
import { utils, config } from '@utils'
import wxSignature from '@utils/wxSignature'
import { CompositionTypes } from '@base/enums'

const replaceImageSrcWithOriginal = (html) => {
    const reg = /<img([^>]+?) src=[\'"]?([^\'"\s>]+)[\'"]?([^>]*)>/g
    const replaceStr = '<img$1src="" data-original="$2"$3>'
    const content = html.replace(reg,replaceStr)
    return content
}


@inject(stores => {
    const { compositionStore, globalStore } = stores.store
    const { isMobileScreen } = globalStore
    const { compositionDetail } = compositionStore
    return {
        isMobileScreen,
        compositionDetail,
    }
})
@observer
export default class Article extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        let statusCode = res.statusCode > 200 ? res.statusCode : false
        const { compositionStore, adStore, globalStore, productStore } = mobxStore
        const { serverClientCode, isMobileScreen, setMobileNavigationData } = globalStore
        const { fetchProducts } = productStore

        let datas = {}
        
        if (req && req.headers) {
            const host = req.headers.host
            const compositionId = query.id
            const client = serverClientCode
            let token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]

            if (isMobileScreen) {
                setMobileNavigationData({hide: true})
            }

            const params = { compositionId, token, client, op: 2 }
            let detailResult = await compositionStore.fetchComposition(params) 
            let resultDetail = detailResult.data
            if (resultDetail && resultDetail.code === 'E100000' && (resultDetail.msg || '').toUpperCase() === 'ERROR TOKEN') {
                destroyCookie(ctx, config.COOKIE_MEIHUA_TOKEN, {path: '/', domain: config.COOKIE_MEIHUA_DOMAIN})
                delete params.token
                token = ''
                detailResult = await compositionStore.fetchComposition(params) 
                resultDetail = detailResult.data
            }
            const composition = (resultDetail.composition || {}) || {}
            if (!resultDetail || !resultDetail.composition || resultDetail.code === 'E100000' || composition.type !== CompositionTypes.ARTICLE) {
                statusCode = 404
            } else {
                await compositionStore.fetchNewArticles({limit: 6})
                await compositionStore.fetchAuthor({host, token, compositionId})
                await adStore.fetchAdvertisement({page_code: `f_a_d`,  field_code: JSON.stringify(['f_a_d_l_t_1'])})
                await compositionStore.fetchRelatedCompositions({
                    compositionId,
                    type: CompositionTypes.ARTICLE,
                    page: 1,
                    limit: 8,
                })
                await compositionStore.fetchRelatedCompositions({
                    compositionId,
                    type: CompositionTypes.SHOTS,
                    page: 1,
                    limit: 9,
                    client,
                })
                await compositionStore.fetchCompositionFavorites({
                    compositionId,
                    orderType: 2,
                    pageIndex: 1,
                    pageSize: 20,
                })
    
                const composition = resultDetail.composition || {}
                const content = utils.replaceImageSrcWithOriginal(composition.content || '')
                
                // 右侧产品
                await fetchProducts()

                datas = {content}
                
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
        this.initWxSignature()
    }

    initWxSignature() {
        const { compositionDetail } = this.props
        if (!compositionDetail) {
            return
        }
        const composition = compositionDetail.composition || {}
        wxSignature.init({
            title: composition.title,
            describe: composition.summary,
            cover: composition.cover,
            // cover: composition.cover + '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200',
        })
    }

    render() {
        const { statusCode, query, isMobileScreen, compositionDetail, content } = this.props
        
        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        const detail = compositionDetail || {}
        const composition = detail.composition || {}
        const title = composition.title || ''
        const summary = composition.summary || ''
        const authorNickname = composition.authorName
        const description = utils.getSubstr(summary, 60)
        const keywordsArr = [authorNickname, composition.classificationName]
        if (composition.categoryName) {
            keywordsArr.push(composition.categoryName)
        }
        if (composition.formName) {
            keywordsArr.push(composition.formName)
        }
        if (composition.brandName) {
            keywordsArr.push(composition.brandName)
        }
        if (composition.productName) {
            keywordsArr.push(composition.productName)
        }
        if (composition.tags && composition.tags.length > 0) {
            const tagNames = composition.tags.map(item => item.tagName)
            keywordsArr.push(...tagNames)
        }
        keywordsArr.push('热点案例','创意文案','发稿')
        const keywords = keywordsArr.join('、')

        return (
            <>
                <HeadComponent 
                    title={`${title}-梅花网`} 
                    description={description}
                    keywords={keywords}
                />
                <Head>
                    <script src="/static/images/plugins/lazyload/lazyload.min.js"></script>
                </Head>
                {isMobileScreen && <MbNavigatorBar 
                    showTitle 
                    btnType="back"
                    backUrl="/article"
                    title={authorNickname} 
                />}
                <ArticleDetailContainer 
                    query={query} 
                    resultContent={content}
                />
                <div style={{display: 'none'}}><img className="cover" src={`${composition.cover}?imageView2/2/w/200`}/></div>
            </>
        )
    }
}