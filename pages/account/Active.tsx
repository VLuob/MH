import dynamic from 'next/dynamic'
import { Component } from 'react'
import jsHttpCookie from 'cookie'
import { parseCookies, setCookie } from 'nookies'
import { user } from '@base/system'
import { inject, observer } from 'mobx-react'
import { ClassificationType } from '@base/enums'
import { toJS } from 'mobx'
import { config } from '@utils'

import PartLoading from '@components/features/PartLoading'
import HeadComponent from '@components/common/HeadComponent'

import ActiveContainer from '@containers/account/active'

@inject(stores => {
    const { authorStore, accountStore } = stores.store
    const { updateUserInfo } = accountStore
    const { updateClassificationData } = authorStore

    return {
        accountStore,
        authorStore,
        updateUserInfo,
        updateClassificationData
    }
})
@observer
export default class Active extends Component {
    static async getInitialProps(ctx) {
        const { query, req, res, mobxStore } = ctx
        const { authorStore, accountStore, globalStore } = mobxStore
        const { fetchActivateUser, updateUserInfo } = accountStore
        const { serverClientCode, ip } = globalStore
        const { classificationsData, fetchGetClassComposition } = authorStore
        let classCompositionData
        let activeUser
        let authorRecommendeds

        const datas = {}

        if(req && req.headers) {
            const host = req.headers.host
            const client_code = serverClientCode
            const cookies = req.headers.cookie
            let token

            if(typeof cookies === 'string') {
                token = jsHttpCookie.parse(cookies)[config.COOKIE_MEIHUA_TOKEN]
            }   

            // 获取激活用户功能
            const activation_token = query.activation_token
            const activeResult = await fetchActivateUser({activation_token, ip })

            if (activeResult.success) {
                const data = activeResult.data || {}
                const maxAge =  30 * 24 * 60 * 60
                const hosts = host.split('.')[0]
                const domain = hosts !== 'www' ? hosts + config.COOKIE_MEIHUA_DOMAIN : config.COOKIE_MEIHUA_DOMAIN
                const tokenOptions = { maxAge, domain, path: '/' }
                token = data.token

                setCookie(ctx, config.COOKIE_MEIHUA_TOKEN, token, tokenOptions)
                setCookie(ctx, 'mhauthorization', token, tokenOptions)

                updateUserInfo(data.user)

                if (activeResult.data.isFirst) {
                    // 获取推荐作者列表
                    const classParam = {
                        host,
                        token,
                        page: 1,
                        client_code,
                        size: 45,
                        classification: ClassificationType.SPECIAL,
                    }
                    classCompositionData = await fetchGetClassComposition(classParam)
                } else {
                    res.writeHead(307, { Location: '/'})
                    res.end()
                }
            }

        }

        return {
            activeUser,
            classCompositionData,
            authorRecommendeds,
        }
    }

    componentDidMount() {
        user.init()
    }

    render() {
        return (
            <>
                <HeadComponent title={`注册成功-梅花网`} />
                <ActiveContainer />
            </>
        )
    }
}