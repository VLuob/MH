import { Component } from 'react'
import { parseCookies } from 'nookies'
import { toJS } from 'mobx'
import Error from '@components/common/Error'
import HeadComponent from '@components/common/HeadComponent'
import ShotsContainer from '@containers/shots/PreviewContainer'

import { config } from '@utils'

export default class ShotsDetail extends Component {
    static async getInitialProps(ctx) {
        const { req, res, query, asPath, mobxStore } = ctx
        let statusCode = res.statusCode > 200 ? res.statusCode : false
        const { compositionStore } = mobxStore

        let datas = {}
        
        if (req && req.headers) {
            const host = req.headers.host
            const compositionId = query.id
            const cookies = parseCookies(ctx)
            const client = cookies[config.COOKIE_MEIHUA_CLIENT_CODE]
            const token = cookies[config.COOKIE_MEIHUA_TOKEN]

            const params = { host, compositionId, token, client, op: 2 }
            const resultPreview = await compositionStore.fetchCompositionPreview(params)

            if (!resultPreview 
                || resultPreview.code === 'E100000' 
                || resultPreview.msg === 'SERVER ERROR'
                || !resultPreview.composition) {
                statusCode = 404
            } else {
                datas = {resultCompositionPreview: resultPreview}
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
        const { statusCode, query, resultCompositionPreview } = this.props

        if (statusCode) {
            return <Error statusCode={statusCode} />
        }

        return (
            <>
                <HeadComponent title={`${resultCompositionPreview.composition.title}-梅花网`} />
                {/* <CommonHeader asPath={asPath} userInfo={userInfo} /> */}
                <ShotsContainer  
                    query={query} 
                    resultCompositionPreview={resultCompositionPreview}
                />
            </>
        )
    }
}