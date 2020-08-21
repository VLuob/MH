import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { toJS } from 'mobx'

import { inject, observer } from 'mobx-react'

import wxSignature from '@utils/wxSignature'
import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import NavContainer from '@containers/subject/articlassify/NavContainer'
import ArticlassifyLayout from '@containers/subject/articlassify/ArticlassifyLayout'
import ArticlassifyContent from '@containers/subject/articlassify/ArticlassifyContent'

@inject(stores => {
    const { articlassifyStore } = stores.store
    const {
        updateArticlassifyData,
        articlassifyClientDetail,
    } = articlassifyStore

    return {
        articlassifyClientDetail,
        updateArticlassifyData
    }
})
@observer
export default class ChannelContainer extends Component {
    static async getInitialProps(ctx) {
        const { req, res, asPath, query, mobxStore } = ctx
        const { id } = query
        const { globalStore, articlassifyStore } = mobxStore
        const { serverClientCode } = globalStore

        const { articlassifyListData, fetchArticlassifyDetail, fetchGetArticlassifyList } = articlassifyStore
        let statusCode = false
        let appProps = {}

        if(req && req.headers) { 
            const host = req.headers.host 
            const cookies = req.headers.cookie 
            let token 
            let client_code = serverClientCode
            statusCode = res.statusCode > 200 ? res.statusCode : false

            if(typeof cookies === 'string') {
                token = jsHttpCookie.parse(cookies).token
            } 

            // 获取分类详情 
            const detailParam = { token, host, client: client_code, classificationId: id }
            const resultClassificationDetail = await fetchArticlassifyDetail(detailParam)
    
            
            if (!resultClassificationDetail) {
                statusCode = 404
            } else {
                // appProps.articlassifyDetail = resultClassificationDetail
                
                // 获取分类作品列表 
                articlassifyListData.terms && articlassifyListData.terms.term && (articlassifyListData.terms.term.classifications = [id])
                const articlassifyParam = { host, terms: { ...articlassifyListData.terms, page: 1 }, client: client_code }
                const resultClassificationDate = await fetchGetArticlassifyList(articlassifyParam) 
                // appProps.articlassifySvrData = resultClassificationDate
            }
        }

        return {
            statusCode,
            query, 
            ...appProps
        }
    }

    componentDidMount() {
        this.initWxSignature()
    }

    initWxSignature() {
        wxSignature.init({
            cover: 'https://resource.meihua.info/FkVLmZ_FSwR9MdOWPmFMY8RjVJur?imageView2/2/w/200/',
        })
    }

    render() {
        const { statusCode, query, articlassifyClientDetail } = this.props
        const channel = articlassifyClientDetail 
        const name = channel && channel.classification && channel.classification.name || ''

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        return (
            <>
                <HeadComponent title={`${name}相关文章 - 营销作品宝库 - 梅花网`} />
                <ArticlassifyLayout NavContainer={<NavContainer articlassifyDetail={articlassifyClientDetail} /> }>
                    <ArticlassifyContent query={query} />
                </ArticlassifyLayout>
            </>
        )
    }
}