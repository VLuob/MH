import { Component } from 'react'

import jsHttpCookie from 'cookie'

import { config } from '@utils'

import NavComponent from '@components/creator/NavComponent'
import ClaimForm from '@containers/creator/ClaimForm'
import HeadComponent from '@components/common/HeadComponent'
import CreatorLayout from '@containers/creator/CreatorLayout'

export default class ClaimContainer extends Component<Props> {
    static async getInitialProps(ctx) {
        const { req, res, asPath, query, mobxStore } = ctx
        const { globalStore } = mobxStore
        const { serverClientCode } = globalStore
        let appProps = {}

        if(req && req.headers) {
            const host = req.headers.host 
            // const cookies = req.headers.cookie 
            // let token 
            // let client_code = serverClientCode
 

            const resultQiniuToken = await globalStore.fetchQiniuToken({ host })

            appProps.resultQiniuToken = resultQiniuToken
        }

        return {
            ...appProps
        }
    }
    render() {
        const { resultQiniuToken } = this.props

        return (
            <>
                <HeadComponent
                    title={`创作者争议认领-梅花网-营销作品宝库`}
                />
                <CreatorLayout
                    navContainer={<NavComponent title={`创作者争议认领`} />}
                >
                    <ClaimForm resultQiniuToken={resultQiniuToken} />
                </CreatorLayout>
            </>
        )
    }
}