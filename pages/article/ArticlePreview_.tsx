import { Component } from 'react'
import { parseCookies, setCookie, destroyCookie } from 'nookies'
import PreviewContainer from '@containers/article/PreviewContainer'
import HeadComponent from '@components/common/HeadComponent'
import Head from 'next/head'
import Error from '@components/common/Error'
import { utils, config } from '@utils'


export default class ArticlePreview extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        let statusCode = res.statusCode > 200 ? res.statusCode : false
        const { compositionStore } = mobxStore

        let datas = {}
        
        if (req && req.headers) {
            const host = req.headers.host
            const code = query.id
            const cookies = parseCookies(ctx)
            const client = cookies[config.COOKIE_MEIHUA_CLIENT_CODE]
            const token = cookies[config.COOKIE_MEIHUA_TOKEN]
            
            // if (!token) {
            //     res.writeHead(307, { Location: `/signin?c=${req.originalUrl}` })
            //     res.end()
            // }
                
            const params = { host, code }
            // const resultPreview = await compositionStore.fetchCompositionPreview(params)
            // const resultPreview = await compositionStore.fetchCompositionPreviewCode({compositionId: code})
            const resultPreview = await compositionStore.fetchComposition({ host, compositionId: code, token, client, op: 2 }) 
            // console.log('origin url',req.originalUrl, code, resultPreview)

            if (!resultPreview 
                || resultPreview.code === 'E100000' 
                || resultPreview.msg === 'SERVER ERROR'
                || !resultPreview.composition) {
                statusCode = 404
            } else {
                // const resultAuthorInfo = await compositionStore.fetchAuthor({host, token, compositionId})
                const resultAuthorInfo = {}
                const composition = resultPreview.composition || {}
                const content = utils.replaceImageSrcWithOriginal(composition.content || '')
                const resultCompositionPreview = {
                    ...resultPreview,
                    composition: {
                        ...composition,
                        content,
                    }
                }

                datas = {resultCompositionPreview, content, resultAuthorInfo}
            }
        }

        return {
            statusCode,
            asPath,
            query,
            ...datas,
        }
    }

    render() {
        const { statusCode, asPath, query, userInfo, resultCompositionPreview, content, resultAuthorInfo } = this.props

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }
        
        const detail = resultCompositionPreview || {}
        const composition = detail.composition || {}
        const title = composition.title || ''

        return (
            <>
                <HeadComponent title={`${title}-梅花网`} />
                <Head>
                    <script src="/static/images/plugins/lazyload/lazyload.min.js"></script>
                </Head>
                <PreviewContainer 
                    query={query} 
                    resultCompositionPreview={detail}
                    resultContent={content}
                    resultAuthorInfo={resultAuthorInfo}
                />
            </>
        )
    }
}