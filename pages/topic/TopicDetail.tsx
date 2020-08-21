import { Component } from 'react'
// import jsHttpCookie from 'cookie'
import { inject, observer } from 'mobx-react'
import { toJS } from 'mobx'

import { parseCookies, setCookie, destroyCookie } from 'nookies'
import TopicContainer from '@containers/topic/DetailContainer'
import HeadComponent from '@components/common/HeadComponent'
import Error from '@components/common/Error'
import { config } from '@utils'
import srvUtils from '@utils/srvutils'
import wxSignature from '@utils/wxSignature'

@inject(({store}) => {
    const { topicStore, globalStore } = store
    const { pageData } = globalStore
    return {
        topicStore,
        topicDetail: topicStore.topicDetail || {},
        pageData,
    }
})
@observer
export default class TopicDetail extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        const { topicStore, globalStore } = mobxStore
        const { serverClientCode, fetchPageData } = globalStore

        let statusCode = res.statusCode > 200 ? res.statusCode : false
        let datas = {}

        if(req && req.headers) {
            const isMobile = srvUtils.isMobile(req)
            let works_limit = isMobile ? 8 : 40
            let article_limit = 10
            
            const id = query.id
            const token = parseCookies(ctx)[config.COOKIE_MEIHUA_TOKEN]
            const client_code = serverClientCode
            const params = {token, id, client_code, works_limit, article_limit}
            let resultTopicDetail
            if (id && client_code) {
                let detailResult = await topicStore.fetchTopic(params)
                resultTopicDetail = detailResult.data
                if (!detailResult.success) {
                    if (resultTopicDetail.code === 'E100000' && resultTopicDetail.msg === 'Error Token') {
                        destroyCookie(ctx, config.COOKIE_MEIHUA_TOKEN, {path: '/', domain: config.COOKIE_MEIHUA_DOMAIN})
                        delete params.token
                        detailResult = await topicStore.fetchTopic(params)
                        resultTopicDetail = detailResult.data
                        if (!detailResult.success) {
                            statusCode = 404
                        }
                    } else {
                        statusCode = 404
                    }
                }

                const pageDataResult = await fetchPageData({relationId: id})
            }
            
            datas = { works_limit, article_limit}
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
        const { topicDetail={} } = this.props
        if (!topicDetail) {
            return
        }
        wxSignature.init({
            title: topicDetail.title,
            describe: topicDetail.summary,
            cover: topicDetail.cover,
            // cover: topicDetail.cover + '?imageMogr2/thumbnail/!200x200r/gravity/center/crop/200x200',
        })
    }

    render() {
        const { statusCode, asPath, query, pageData, topicDetail, article_limit, works_limit } = this.props

        if (statusCode) {
            return  <Error statusCode={statusCode} />
        }

        // const topicDetail = resultTopicDetail || {}
        // 网页标题用摘要截取不超过20个汉字
        // const title = (topicDetail.summary || '').substring(0,20)

        const pageTitle = pageData.title || `${topicDetail.title} - 营销作品宝库 - 梅花网`
        const pageKeywords = pageData.keyword
        const pageDescription = pageData.description || topicDetail.summary

        return (
            <>
                <HeadComponent
                    title={pageTitle}
                    keywords={pageKeywords}
                    description={pageDescription}
                />
                <TopicContainer 
                    query={query}
                    article_limit={article_limit}
                    works_limit={works_limit}
                />
            </>
        )
    }
}